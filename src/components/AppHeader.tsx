import React from 'react';

interface AppHeaderProps {
  documentsCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ documentsCount }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-neutral-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            {/* Logo Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {/* Brand */}
            <div>
              <h1 className="text-2xl font-semibold text-neutral-800 tracking-tight">
                Local Knowledge Search
              </h1>
              <p className="text-sm text-neutral-500 font-medium">
                AI-powered document search, privacy-first
              </p>
            </div>
          </div>

          {/* Header Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-neutral-600">
                {documentsCount} documents indexed
              </span>
            </div>
            <div className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              100% Private
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};