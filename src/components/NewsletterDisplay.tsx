import React from 'react';
import { Newsletter } from '../types/newsletter';
import { NewsletterHeader } from './NewsletterHeader';
import { TopStories } from './TopStories';
import { NewTools } from './NewTools';
import { ResearchSection } from './ResearchSection';
import { QuickInsights } from './QuickInsights';

interface NewsletterDisplayProps {
  newsletter: Newsletter;
}

export const NewsletterDisplay: React.FC<NewsletterDisplayProps> = ({ newsletter }) => {
  return (
    <div id="newsletter-content" className="max-w-[800px] mx-auto px-6 py-12 md:py-16">
      <NewsletterHeader newsletter={newsletter} />
      <section id="top-stories">
        <TopStories stories={newsletter.topStories} />
      </section>
      <section id="tools">
        <NewTools tools={newsletter.newTools} />
      </section>
      <section id="research">
        <ResearchSection papers={newsletter.research} />
      </section>
      <section id="insights">
        <QuickInsights insights={newsletter.insights} />
      </section>
    </div>
  );
};
