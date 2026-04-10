import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { NewsletterDisplay } from './components/NewsletterDisplay';
import { Newsletter } from './types/newsletter';
import { fetchAINews } from './services/newsService';

const App: React.FC = () => {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        // Fetch real-time AI news from Google News RSS
        const newsItems = await fetchAINews();

        if (newsItems.length > 0) {
          // Convert fetched news to newsletter format
          const topStories = newsItems.slice(0, 4).map((item) => ({
            headline: item.title,
            summary: stripHtml(item.summary).substring(0, 300) + '...',
            details: extractKeyPoints(item.summary),
            link: item.link
          }));

          const liveNewsletter: Newsletter = {
            id: new Date().toISOString().split('T')[0],
            title: 'AI News Live - ' + formatDate(new Date()),
            date: formatDateLong(new Date()),
            introduction: `Live AI news aggregated from ${newsItems.length} sources including TechCrunch, The Verge, OpenAI, Google DeepMind, Meta AI, Microsoft, and more. Updated in real-time.`,
            topStories,
            newTools: [],
            research: [],
            insights: generateInsights(newsItems),
            createdAt: new Date().toISOString()
          };

          setNewsletter(liveNewsletter);
        }
      } catch (err) {
        console.error('Error loading news:', err);
        setError('Failed to fetch latest news');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Fetching latest AI news...</p>
        </div>
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Unable to load news</p>
          <p className="text-sm text-gray-400">Please check your connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pb-16">
        <NewsletterDisplay newsletter={newsletter} />
      </main>
      <Footer />
    </div>
  );
};

// Helper functions
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

function extractKeyPoints(text: string): string[] {
  const clean = stripHtml(text);
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 4).map(s => s.trim());
}

function generateInsights(newsItems: any[]): string[] {
  const insights: string[] = [
    `${newsItems.length} AI news articles tracked in real-time`
  ];

  // Count sources
  const sources = new Set(newsItems.map(n => n.source));
  insights.push(`Covering ${sources.size} major AI news sources`);

  // Most recent
  if (newsItems.length > 0) {
    const latest = new Date(newsItems[0].date);
    insights.push(`Latest update: ${formatTimeAgo(latest)}`);
  }

  return insights;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export default App;
