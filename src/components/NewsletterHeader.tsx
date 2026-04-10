import React from 'react';
import { Newsletter } from '../types/newsletter';

interface NewsletterHeaderProps {
  newsletter: Newsletter;
}

export const NewsletterHeader: React.FC<NewsletterHeaderProps> = ({ newsletter }) => {
  return (
    <header className="mb-16">
      <p className="text-sm text-gray-500 mb-2 tracking-wide">{newsletter.date}</p>
      <h1 className="text-4xl font-bold text-black mb-6 leading-tight">
        {newsletter.title}
      </h1>
      <p className="text-lg text-gray-700 leading-relaxed max-w-[800px]">
        {newsletter.introduction}
      </p>
    </header>
  );
};
