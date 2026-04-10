import React from 'react';
import { NewsItem } from '../types/newsletter';

interface TopStoriesProps {
  stories: NewsItem[];
}

export const TopStories: React.FC<TopStoriesProps> = ({ stories }) => {
  return (
    <section className="mb-16">
      <h2 className="text-xl font-semibold text-black mb-8 pb-2 border-b border-gray-200">
        Top Stories
      </h2>
      <div className="space-y-12">
        {stories.map((story, index) => (
          <article key={index} className="group">
            <h3 className="text-xl font-medium text-black mb-3 group-hover:text-gray-600 transition-colors">
              {story.headline}
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">{story.summary}</p>
            <ul className="space-y-2 mb-4">
              {story.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-600">
                  <span className="text-gray-400 mt-1.5">
                    <svg width="4" height="4" viewBox="0 0 4 4" fill="currentColor">
                      <circle cx="2" cy="2" r="2" />
                    </svg>
                  </span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
            <a
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-black underline underline-offset-4 transition-colors"
            >
              Learn More →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
