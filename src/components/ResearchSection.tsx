import React from 'react';
import { ResearchItem } from '../types/newsletter';

interface ResearchSectionProps {
  papers: ResearchItem[];
}

export const ResearchSection: React.FC<ResearchSectionProps> = ({ papers }) => {
  return (
    <section className="mb-16">
      <h2 className="text-xl font-semibold text-black mb-8 pb-2 border-b border-gray-200">
        Cutting-Edge Research
      </h2>
      <div className="space-y-10">
        {papers.map((paper, index) => (
          <article key={index} className="group">
            <h3 className="text-xl font-medium text-black mb-3 group-hover:text-gray-600 transition-colors">
              {paper.title}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Overview
                </h4>
                <p className="text-gray-700 leading-relaxed">{paper.overview}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Significance
                </h4>
                <p className="text-gray-700 leading-relaxed">{paper.significance}</p>
              </div>
            </div>
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-black underline underline-offset-4 transition-colors mt-4 inline-block"
            >
              Read the Paper →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
