// Newsletter API Server
// This handles fetching from Serper API, processing with Gemini, and serving the newsletter

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store for recent newsletters (last 5 days)
let recentNewsletters = [];
const MAX_RECENT = 5;

// Search queries configuration
const SEARCH_QUERIES = [
  'latest AI developments',
  'new AI tools',
  'AI research breakthroughs',
  'AI startup funding',
  'GitHub trending AI'
];

const SOURCE_SITES = [
  'site:techcrunch.com AI',
  'site:theverge.com AI',
  'site:openai.com/blog',
  'site:deepmind.google/blog',
  'site:ai.meta.com/blog',
  'site:huggingface.co',
  'site:arxiv.org'
];

// Search using Serper API
async function searchSerper(query) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('SERPER_API_KEY not configured');
  }

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey
    },
    body: JSON.stringify({
      q: query,
      num: 10
    })
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status}`);
  }

  return response.json();
}

// Synthesize content using Gemini
async function synthesizeWithGemini(newsData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `You are a professional AI journalist and content creator.
Tone: Informative, enthusiastic, concise, professional, and slightly humorous.
Audience: Professionals, developers, researchers, and the general public interested in AI technology.

CONTENT STRUCTURE:
1. Catchy Title (e.g., "Vibe Coder Sells AI App for $80M!")
2. Introduction/Hook
3. Top Story/Trending AI News (3-4 items)
4. New AI Tools/Products (2-3 items)
5. Cutting-Edge AI Research (2-3 items)
6. Quick AI Insights (2-3 snippets)

IMPORTANT: Do NOT include any news about Trump or political topics unrelated to AI.

The following is raw search data from today's AI news:

${JSON.stringify(newsData, null, 2)}

Generate the newsletter content in JSON format matching this structure:
{
  "title": "string",
  "date": "string (e.g., 'April 10, 2026')",
  "introduction": "string",
  "topStories": [
    {
      "headline": "string",
      "summary": "string",
      "details": ["string"],
      "link": "url string"
    }
  ],
  "newTools": [
    {
      "name": "string",
      "functionality": "string",
      "highlights": ["string"],
      "link": "url string"
    }
  ],
  "research": [
    {
      "title": "string",
      "overview": "string",
      "significance": "string",
      "link": "url string"
    }
  ],
  "insights": ["string"]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from Gemini');
  }

  // Parse JSON from response
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (parseError) {
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

// Generate newsletter endpoint
app.post('/api/generate', async (req, res) => {
  try {
    console.log('Starting newsletter generation...');

    // 1. Search for news
    const allSearchResults = [];

    for (const query of [...SEARCH_QUERIES, ...SOURCE_SITES]) {
      try {
        const results = await searchSerper(query);
        if (results organic) {
          allSearchResults.push(...results.organic);
        }
      } catch (error) {
        console.error(`Search error for query "${query}":`, error.message);
      }
    }

    // Deduplicate by URL
    const uniqueResults = [];
    const seenUrls = new Set();
    for (const result of allSearchResults) {
      if (!seenUrls.has(result.link)) {
        seenUrls.add(result.link);
        uniqueResults.push(result);
      }
    }

    console.log(`Found ${uniqueResults.length} unique results`);

    // 2. Synthesize with Gemini
    const newsletter = await synthesizeWithGemini(uniqueResults.slice(0, 20));

    // 3. Add metadata
    newsletter.id = new Date().toISOString().split('T')[0];
    newsletter.createdAt = new Date().toISOString();

    // 4. Update recent newsletters
    recentNewsletters.unshift(newsletter);
    if (recentNewsletters.length > MAX_RECENT) {
      recentNewsletters = recentNewsletters.slice(0, MAX_RECENT);
    }

    console.log('Newsletter generated successfully');
    res.json(newsletter);

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current newsletter
app.get('/api/newsletter', (req, res) => {
  if (recentNewsletters.length > 0) {
    res.json(recentNewsletters[0]);
  } else {
    res.status(404).json({ error: 'No newsletter available' });
  }
});

// Get newsletter history
app.get('/api/newsletter/history', (req, res) => {
  res.json(recentNewsletters);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Newsletter API server running on port ${PORT}`);
});
