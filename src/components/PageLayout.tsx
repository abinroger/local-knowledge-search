import React from 'react';
import { TABS, type TabType } from '../constants';

interface PageLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  className = '',
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div
            className="p-2.5 rounded-xl shadow-lg"
            style={{ background: 'linear-gradient(to bottom right, #6366f1, #4f46e5)' }}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} />
            </svg>
          </div>
        )}
        <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-neutral-600 text-lg ml-0.5">{subtitle}</p>
      )}
    </div>
  );
};

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  activeTab,
  className = '',
}) => {
  // Page-specific configurations
  const pageConfig = {
    [TABS.UPLOAD]: {
      title: 'Upload Documents',
      subtitle: 'Add new documents to your knowledge base for intelligent search.',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    },
    [TABS.DOCUMENTS]: {
      title: 'Document Manager',
      subtitle: 'Organize, view, and manage your uploaded documents.',
      icon: 'M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17H9v-2.5A3.5 3.5 0 0112.5 11H15v6z',
    },
    [TABS.SEARCH]: {
      title: 'Knowledge Search',
      subtitle: 'Search your documents using natural language queries.',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    }
  };

  const config = pageConfig[activeTab];

  return (
    <main className={`flex-1 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={config.title}
          subtitle={config.subtitle}
          icon={config.icon}
        />
        <div className="mt-6">
          {children}
        </div>
      </div>
    </main>
  );
};