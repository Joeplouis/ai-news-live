import React, { useState } from 'react';

interface NavbarProps {
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title = 'Daily AI Newsletter' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-medium text-black">{title}</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#top-stories" className="text-sm text-gray-500 hover:text-black transition-colors">
              Stories
            </a>
            <a href="#tools" className="text-sm text-gray-500 hover:text-black transition-colors">
              Tools
            </a>
            <a href="#research" className="text-sm text-gray-500 hover:text-black transition-colors">
              Research
            </a>
            <a href="#insights" className="text-sm text-gray-500 hover:text-black transition-colors">
              Insights
            </a>
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {isMenuOpen ? (
                <path d="M15 5L5 15M5 5l10 10" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-6 py-4 space-y-3">
            <a href="#top-stories" className="block text-sm text-gray-500 hover:text-black transition-colors">
              Stories
            </a>
            <a href="#tools" className="block text-sm text-gray-500 hover:text-black transition-colors">
              Tools
            </a>
            <a href="#research" className="block text-sm text-gray-500 hover:text-black transition-colors">
              Research
            </a>
            <a href="#insights" className="block text-sm text-gray-500 hover:text-black transition-colors">
              Insights
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
