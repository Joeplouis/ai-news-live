import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AI</span>
            </div>
            <span className="text-sm text-gray-500">AI News Live</span>
          </div>

          <p className="text-sm text-gray-400">
            Live news from OpenAI, Google DeepMind, Meta, Microsoft & more
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#ai-tools"
              className="text-sm text-gray-400 hover:text-black transition-colors"
            >
              AI Tools Directory
            </a>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              Coming Soon
            </span>
            <span className="text-gray-300">•</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-black transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
