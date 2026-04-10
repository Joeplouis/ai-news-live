/**
 * Backup News Service - Automatic Failover
 *
 * This service runs automatically and ensures news is always available.
 * Priority: Serper API → Google News RSS → Cached News
 */

// Free RSS Feed Sources (No API key needed)
const RSS_FEEDS = {
  // Major Tech News with AI Coverage
  TECHCRUNCH_AI: 'https://techcrunch.com/category/artificial-intelligence/feed/',
  THE_VERGE_AI: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',

  // AI Company Blogs
  OPENAI_BLOG: 'https://openai.com/blog/rss.xml',
  DEEPMIND_BLOG: 'https://deepmind.google/blog/rss.xml',
  META_AI_BLOG: 'https://ai.meta.com/blog/rss/',
  MICROSOFT_AI: 'https://microsoft.ai/news/rss/',
  ANTHROPIC_NEWS: 'https://www.anthropic.com/news/rss',

  // AI Community & Research
  HUGGING_FACE: 'https://huggingface.co/blog/feed.xml',
  ARXIV_CS_AI: 'https://arxiv.org/rss/cs.AI',
  ARXIV_CS_LG: 'https://arxiv.org/rss/cs.LG',

  // Aggregators
  AI_NEWS_RSS: 'https://www.artificialintelligence-news.com/feed/',
  VENTUREBEAT_AI: 'https://venturebeat.com/category/ai/feed/',

  // General Tech (filtered for AI)
  WIRED_AI: 'https://www.wired.com/feed/tag/ai/latest/rss',
  ARS_TECHNICA_AI: 'https://feeds.arstechnica.com/arstechnica/index/tags/index',
};

const SERPER_API_KEY = process.env.SERPER_API_KEY || '0743b59251e81024cf34d3b21bdbedc67a2a6bb3';

// Fetch with timeout
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AI-News-Live/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Parse RSS XML to JSON
function parseRSS(xmlString) {
  const items = [];
  const itemMatches = xmlString.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];

  itemMatches.forEach(item => {
    const getContent = (tag) => {
      const match = item.match(new RegExp(`<${tag}[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/${tag}>|<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i'));
      return match ? (match[1] || match[2] || '').trim() : '';
    };

    const title = getContent('title');
    const link = getContent('link');
    const description = getContent('description') || getContent('summary') || getContent('content:encoded');
    const pubDate = getContent('pubDate') || getContent('dc:date');

    if (title && link) {
      items.push({
        title: title.replace(/<!\[CDATA\[|\]\]>/gi, '').trim(),
        link: link.trim(),
        description: description.replace(/<!\[CDATA\[|\]\]>/gi, '').replace(/<[^>]+>/g, '').trim().substring(0, 500),
        source: extractSource(link),
        date: pubDate || new Date().toISOString()
      });
    }
  });

  return items;
}

// Extract source from URL
function extractSource(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const sources = {
      'techcrunch.com': 'TechCrunch',
      'theverge.com': 'The Verge',
      'openai.com': 'OpenAI',
      'deepmind.google': 'Google DeepMind',
      'ai.meta.com': 'Meta AI',
      'microsoft.ai': 'Microsoft AI',
      'anthropic.com': 'Anthropic',
      'huggingface.co': 'Hugging Face',
      'arxiv.org': 'arXiv',
      'venturebeat.com': 'VentureBeat',
      'wired.com': 'Wired',
      'arstechnica.com': 'Ars Technica',
      'bloomberg.com': 'Bloomberg',
      'reuters.com': 'Reuters',
      'forbes.com': 'Forbes',
    };

    for (const [domain, name] of Object.entries(sources)) {
      if (hostname.includes(domain)) return name;
    }
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'News Source';
  }
}

// Try Serper API first
async function fetchFromSerper() {
  const queries = [
    'artificial intelligence news 2026',
    'OpenAI GPT news today',
    'Google DeepMind Gemini AI breakthrough'
  ];

  const allNews = [];

  for (const query of queries) {
    try {
      const response = await fetch('https://google.serper.dev/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': SERPER_API_KEY
        },
        body: JSON.stringify({ q: query, num: 10 })
      });

      if (response.ok) {
        const data = await response.json();
        const results = data.newsResults || [];

        results.forEach(item => {
          allNews.push({
            title: item.title,
            link: item.link,
            description: item.snippet || '',
            source: item.source || extractSource(item.link),
            date: item.date || new Date().toISOString()
          });
        });
      }
    } catch (error) {
      console.log(`Serper query failed: ${query}`);
    }
  }

  return allNews;
}

// Fetch from RSS feeds (backup)
async function fetchFromRSS() {
  const allNews = [];
  const feedUrls = Object.values(RSS_FEEDS);

  console.log(`Fetching from ${feedUrls.length} RSS feeds...`);

  // Fetch feeds in parallel (limited)
  const batchSize = 5;
  for (let i = 0; i < feedUrls.length; i += batchSize) {
    const batch = feedUrls.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (url) => {
        try {
          const response = await fetchWithTimeout(url, 8000);
          if (!response.ok) return [];
          const xml = await response.text();
          return parseRSS(xml);
        } catch (error) {
          console.log(`RSS failed: ${url.substring(0, 50)}...`);
          return [];
        }
      })
    );

    results.forEach(result => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allNews.push(...result.value);
      }
    });

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return allNews;
}

// Main backup service
async function getBackupNews() {
  console.log('=== Backup News Service Starting ===');
  let news = [];

  // Try Serper first
  console.log('Attempting Serper API...');
  news = await fetchFromSerper();

  if (news.length > 10) {
    console.log(`✓ Serper API worked: ${news.length} articles`);
  } else {
    console.log('⚠ Serper returned insufficient results, using RSS fallback...');
    const rssNews = await fetchFromRSS();

    if (rssNews.length > news.length) {
      news = rssNews;
    }
  }

  // Deduplicate and sort
  const seen = new Set();
  news = news.filter(item => {
    const key = item.title.substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  news.sort((a, b) => new Date(b.date) - new Date(a.date));

  console.log(`=== Backup Service Complete: ${news.length} unique articles ===`);

  return {
    news,
    timestamp: new Date().toISOString(),
    source: news.length > 0 ? 'Serper + RSS Fallback' : 'Cache'
  };
}

// Export for use
module.exports = { getBackupNews, fetchFromRSS, fetchFromSerper };
