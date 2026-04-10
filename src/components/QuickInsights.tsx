import React from 'react';

interface QuickInsightsProps {
  insights: string[];
}

export const QuickInsights: React.FC<QuickInsightsProps> = ({ insights }) => {
  return (
    <section className="mb-16">
      <h2 className="text-xl font-semibold text-black mb-8 pb-2 border-b border-gray-200">
        Quick Insights
      </h2>
      <ul className="space-y-4">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-gray-400 mt-1.5 flex-shrink-0">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="4" cy="4" r="4" />
              </svg>
            </span>
            <span className="text-gray-700 leading-relaxed">{insight}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
