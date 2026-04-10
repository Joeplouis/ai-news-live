import React from 'react';
import { ToolItem } from '../types/newsletter';

interface NewToolsProps {
  tools: ToolItem[];
}

export const NewTools: React.FC<NewToolsProps> = ({ tools }) => {
  return (
    <section className="mb-16">
      <h2 className="text-xl font-semibold text-black mb-8 pb-2 border-b border-gray-200">
        New AI Tools
      </h2>
      <div className="space-y-10">
        {tools.map((tool, index) => (
          <article key={index} className="group">
            <h3 className="text-xl font-medium text-black mb-3 group-hover:text-gray-600 transition-colors">
              {tool.name}
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">{tool.functionality}</p>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Highlights
              </h4>
              <ul className="space-y-2">
                {tool.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                    <span className="text-gray-400 mt-1.5">
                      <svg width="4" height="4" viewBox="0 0 4 4" fill="currentColor">
                        <circle cx="2" cy="2" r="2" />
                      </svg>
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href={tool.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-black underline underline-offset-4 transition-colors"
            >
              Try It Now →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
