// Real-time AI News Fetcher
// Scrapes latest AI news from major sources automatically

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

interface NewsItem {
  title: string;
  summary: string;
  link: string;
  source: string;
  date: string;
}

// Fetch RSS feed and parse
async function fetchRSS(feedUrl: string): Promise<any[]> {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching ${feedUrl}:`, error);
    return [];
  }
}

// Fetch from Google News RSS for AI
async function fetchGoogleNews(): Promise<any[]> {
  const rssUrl = 'https://news.google.com/rss/search?q=artificial+intelligence+OR+AI+OR+OpenAI+OR+Google+DeepMind&hl=en-US&gl=US&ceid=US:en';
  return fetchRSS(rssUrl);
}

// Main function to fetch all AI news
export async function fetchAINews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  // Fetch from Google News (most comprehensive)
  const googleNews = await fetchGoogleNews();
  googleNews.forEach((item: any) => {
    if (item.title && item.link) {
      allNews.push({
        title: item.title,
        summary: item.description || item.content || '',
        link: item.link,
        source: extractSource(item.link) || 'Google News',
        date: item.pubDate || item.isoDate || new Date().toISOString()
      });
    }
  });

  // Sort by date (newest first)
  allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Remove duplicates based on title similarity
  const unique = allNews.filter((item, index, self) =>
    index === self.findIndex(t =>
      t.title.substring(0, 50) === item.title.substring(0, 50)
    )
  );

  return unique.slice(0, 50); // Return top 50 latest
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('techcrunch')) return 'TechCrunch';
    if (hostname.includes('theverge')) return 'The Verge';
    if (hostname.includes('openai')) return 'OpenAI';
    if (hostname.includes('deepmind') || hostname.includes('google')) return 'Google DeepMind';
    if (hostname.includes('meta')) return 'Meta';
    if (hostname.includes('microsoft')) return 'Microsoft';
    if (hostname.includes('anthropic')) return 'Anthropic';
    if (hostname.includes('wired')) return 'Wired';
    if (hostname.includes('arstechnica')) return 'Ars Technica';
    if (hostname.includes('bloomberg')) return 'Bloomberg';
    if (hostname.includes('reuters')) return 'Reuters';
    if (hostname.includes('bbc')) return 'BBC';
    if (hostname.includes('cnn')) return 'CNN';
    if (hostname.includes('venturebeat')) return 'VentureBeat';
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

export { NEWS_SOURCES };
