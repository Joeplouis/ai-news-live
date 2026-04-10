// Real-time AI News Fetcher with Serper API
// Comprehensive AI news from multiple sources

const SERPER_API_KEY = '0743b59251e81024cf34d3b21bdbedc67a2a6bb3';

const NEWS_SOURCES = {
  OPENAI: {
    name: 'OpenAI',
    blog: 'https://openai.com/blog/rss.xml',
    news: 'https://openai.com/news/rss.xml'
  },
  GOOGLE_DEEPMIND: {
    name: 'Google DeepMind',
    blog: 'https://deepmind.google/blog/rss.xml',
    research: 'https://deepmind.google/blog/feed/basic/'
  },
  META_AI: {
    name: 'Meta AI',
    blog: 'https://ai.meta.com/blog/rss/'
  },
  MICROSOFT: {
    name: 'Microsoft AI',
    blog: 'https://microsoft.ai/news/rss/'
  },
  ANTHROPIC: {
    name: 'Anthropic',
    blog: 'https://www.anthropic.com/news/rss'
  },
  HUGGING_FACE: {
    name: 'Hugging Face',
    blog: 'https://huggingface.co/blog/feed.xml'
  }
};

// Search queries for comprehensive AI coverage
const SEARCH_QUERIES = [
  'latest artificial intelligence news 2026',
  'OpenAI GPT news today',
  'Google DeepMind Gemini AI',
  'Meta AI Llama news',
  'Anthropic Claude news',
  'Microsoft Copilot AI',
  'AI startup funding 2026',
  'AI research breakthroughs',
  'AI tools launch 2026',
  'machine learning news'
];

interface NewsItem {
  title: string;
  summary: string;
  link: string;
  source: string;
  date: string;
}

// Search using Serper API
async function searchSerper(query: string): Promise<any[]> {
  try {
    const response = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': SERPER_API_KEY
      },
      body: JSON.stringify({
        q: query,
        num: 10,
        autocorrect: true
      })
    });

    if (!response.ok) {
      console.error(`Serper API error for "${query}":`, response.status);
      return [];
    }

    const data = await response.json();
    return data.newsResults || [];
  } catch (error) {
    console.error(`Error searching "${query}":`, error);
    return [];
  }
}

// Fetch RSS feed and parse (fallback)
async function fetchRSS(feedUrl: string): Promise<any[]> {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching RSS ${feedUrl}:`, error);
    return [];
  }
}

// Main function to fetch all AI news
export async function fetchAINews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];
  const seenUrls = new Set<string>();

  console.log('Fetching AI news from Serper API...');

  // Search all queries with Serper
  for (const query of SEARCH_QUERIES) {
    try {
      const results = await searchSerper(query);

      results.forEach((item: any) => {
        if (item.link && !seenUrls.has(item.link)) {
          seenUrls.add(item.link);
          allNews.push({
            title: item.title || '',
            summary: item.snippet || item.description || '',
            link: item.link,
            source: item.source || extractSource(item.link) || 'AI News',
            date: item.date || new Date().toISOString()
          });
        }
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error with query "${query}":`, error);
    }
  }

  // If Serper returns nothing, fallback to Google News RSS
  if (allNews.length === 0) {
    console.log('Falling back to Google News RSS...');
    try {
      const rssUrl = 'https://news.google.com/rss/search?q=artificial+intelligence+AI&hl=en-US&gl=US&ceid=US:en';
      const rssResults = await fetchRSS(rssUrl);

      rssResults.forEach((item: any) => {
        if (item.title && item.link && !seenUrls.has(item.link)) {
          seenUrls.add(item.link);
          allNews.push({
            title: item.title,
            summary: item.description || '',
            link: item.link,
            source: extractSource(item.link) || 'Google News',
            date: item.pubDate || item.isoDate || new Date().toISOString()
          });
        }
      });
    } catch (error) {
      console.error('RSS fallback error:', error);
    }
  }

  // Sort by date (newest first)
  allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Remove duplicates based on title similarity
  const unique = allNews.filter((item, index, self) =>
    index === self.findIndex(t =>
      t.title.substring(0, 50) === item.title.substring(0, 50)
    )
  );

  console.log(`Found ${unique.length} unique AI news articles`);
  return unique.slice(0, 30);
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('techcrunch')) return 'TechCrunch';
    if (hostname.includes('theverge')) return 'The Verge';
    if (hostname.includes('openai')) return 'OpenAI';
    if (hostname.includes('deepmind') || hostname.includes('google')) return 'Google DeepMind';
    if (hostname.includes('meta')) return 'Meta AI';
    if (hostname.includes('microsoft')) return 'Microsoft';
    if (hostname.includes('anthropic')) return 'Anthropic';
    if (hostname.includes('wired')) return 'Wired';
    if (hostname.includes('arstechnica')) return 'Ars Technica';
    if (hostname.includes('bloomberg')) return 'Bloomberg';
    if (hostname.includes('reuters')) return 'Reuters';
    if (hostname.includes('bbc')) return 'BBC';
    if (hostname.includes('cnn')) return 'CNN';
    if (hostname.includes('venturebeat')) return 'VentureBeat';
    if (hostname.includes('forbes')) return 'Forbes';
    if (hostname.includes('business')) return 'Business Insider';
    if (hostname.includes('venture')) return 'VentureBeat';
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'AI News';
  }
}

export { NEWS_SOURCES };
