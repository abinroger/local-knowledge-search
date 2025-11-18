import React from 'react';

interface AppHeaderProps {
  documentsCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ documentsCount }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Enhanced Logo with gradient icon */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(to bottom right, #6366f1, #4f46e5, #7c3aed)' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-primary-500/20 rounded-xl blur-md -z-10" />
            </div>

            <div>
              <h1
                className="text-xl sm:text-2xl font-bold"
                style={{
                  background: 'linear-gradient(to right, #171717, #404040)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Knowledge Search
              </h1>
              <p className="hidden sm:block text-xs text-neutral-500 font-medium">
                AI-powered • Privacy-first
              </p>
            </div>
          </div>

          {/* Stats with better visual hierarchy */}
          <div className="flex items-center gap-3 sm:gap-6">
            {documentsCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-green-700">
                  {documentsCount} indexed
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold">100% Private</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};