// Real-time AI News Fetcher with Automatic Failover
// Priority: Serper API → Multiple RSS Feeds → Cached Data

const SERPER_API_KEY = '0743b59251e81024cf34d3b21bdbedc67a2a6bb3';

// Multiple RSS Feed Sources (Free backup)
const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'https://openai.com/blog/rss.xml',
  'https://deepmind.google/blog/rss.xml',
  'https://ai.meta.com/blog/rss/',
  'https://huggingface.co/blog/feed.xml',
  'https://venturebeat.com/category/ai/feed/',
];

// Multiple search queries for Serper
const SEARCH_QUERIES = [
  'artificial intelligence news 2026',
  'OpenAI GPT latest news',
  'Google DeepMind Gemini AI',
  'Meta AI Llama updates',
  'Anthropic Claude news',
  'Microsoft Copilot AI',
  'AI startup funding 2026',
  'machine learning breakthroughs',
];

interface NewsItem {
  title: string;
  summary: string;
  link: string;
  source: string;
  date: string;
}

// Cache for offline fallback
let cachedNews: NewsItem[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Search using Serper API
async function searchSerper(query: string): Promise<any[]> {
  try {
    const response = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': SERPER_API_KEY
      },
      body: JSON.stringify({ q: query, num: 10 })
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.newsResults || [];
  } catch {
    return [];
  }
}

// Fetch from RSS (no API key needed)
async function fetchRSS(feedUrl: string): Promise<any[]> {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch {
    return [];
  }
}

// Alternative RSS fetch without API key
async function fetchRSSDirect(feedUrl: string): Promise<any[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'AI-News-Live/1.0' }
    });
    if (!response.ok) return [];

    const text = await response.text();
    return parseRSSSimple(text);
  } catch {
    return [];
  }
}

// Simple RSS parser
function parseRSSSimple(xml: string): any[] {
  const items: any[] = [];
  const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];

  itemMatches.forEach(item => {
    const getTag = (tag: string) => {
      const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? match[1].trim() : '';
    };

    const title = getTag('title');
    const link = getTag('link');
    const description = getTag('description') || getTag('content:encoded');
    const pubDate = getTag('pubDate');

    if (title && link) {
      items.push({
        title: title.replace(/<!\[CDATA\[|\]\]>/gi, ''),
        link,
        description: description.replace(/<[^>]+>/g, '').substring(0, 300),
        pubDate: pubDate || new Date().toISOString()
      });
    }
  });

  return items;
}

// Extract source name from URL
function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const sources: Record<string, string> = {
      'techcrunch.com': 'TechCrunch',
      'theverge.com': 'The Verge',
      'openai.com': 'OpenAI',
      'deepmind.google': 'Google DeepMind',
      'ai.meta.com': 'Meta AI',
      'microsoft': 'Microsoft',
      'anthropic.com': 'Anthropic',
      'huggingface.co': 'Hugging Face',
      'venturebeat.com': 'VentureBeat',
      'wired.com': 'Wired',
      'arstechnica.com': 'Ars Technica',
      'bloomberg.com': 'Bloomberg',
      'forbes.com': 'Forbes',
    };

    for (const [domain, name] of Object.entries(sources)) {
      if (hostname.includes(domain)) return name;
    }
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'AI News';
  }
}

// Main function with automatic failover
export async function fetchAINews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];
  const seenUrls = new Set<string>();

  console.log('=== Fetching AI News ===');

  // Strategy 1: Try Serper API
  console.log('Trying Serper API...');
  for (const query of SEARCH_QUERIES) {
    try {
      const results = await searchSerper(query);

      results.forEach((item: any) => {
        if (item.link && !seenUrls.has(item.link)) {
          seenUrls.add(item.link);
          allNews.push({
            title: item.title || '',
            summary: (item.snippet || item.description || '').substring(0, 300),
            link: item.link,
            source: item.source || extractSource(item.link),
            date: item.date || new Date().toISOString()
          });
        }
      });

      await new Promise(resolve => setTimeout(resolve, 150));
    } catch (e) {
      console.log(`Query failed: ${query}`);
    }
  }

  // Strategy 2: If Serper failed or returned few results, use RSS feeds
  if (allNews.length < 5) {
    console.log(`Serper returned only ${allNews.length} results, using RSS fallback...`);

    for (const feed of RSS_FEEDS) {
      try {
        const items = await fetchRSSDirect(feed);

        items.forEach((item: any) => {
          if (item.link && !seenUrls.has(item.link)) {
            seenUrls.add(item.link);
            allNews.push({
              title: item.title || '',
              summary: item.description || '',
              link: item.link,
              source: extractSource(item.link),
              date: item.pubDate || new Date().toISOString()
            });
          }
        });

        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.log(`RSS failed: ${feed.substring(0, 50)}`);
      }
    }
  }

  // Strategy 3: Use cached data if still no results
  if (allNews.length < 3) {
    console.log('Using cached news data...');
    return cachedNews.length > 0 ? cachedNews : generateDefaultNews();
  }

  // Sort and deduplicate
  allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const unique = allNews.filter((item, index, self) =>
    index === self.findIndex(t =>
      t.title.substring(0, 50) === item.title.substring(0, 50)
    )
  );

  // Cache the results
  cachedNews = unique.slice(0, 30);
  lastFetchTime = Date.now();

  console.log(`=== Found ${unique.length} unique articles ===`);
  return unique.slice(0, 30);
}

// Generate default news if everything fails
function generateDefaultNews(): NewsItem[] {
  return [
    {
      title: 'AI News Loading...',
      summary: 'Fetching latest AI news from multiple sources. Please refresh the page.',
      link: 'https://techcrunch.com/category/artificial-intelligence/',
      source: 'TechCrunch',
      date: new Date().toISOString()
    },
    {
      title: 'OpenAI News',
      summary: 'Visit OpenAI blog for the latest updates on GPT and AI research.',
      link: 'https://openai.com/blog',
      source: 'OpenAI',
      date: new Date().toISOString()
    },
    {
      title: 'Google DeepMind Research',
      summary: 'Latest breakthroughs from Google DeepMind in AI and machine learning.',
      link: 'https://deepmind.google/blog',
      source: 'Google DeepMind',
      date: new Date().toISOString()
    }
  ];
}
