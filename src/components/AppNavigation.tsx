import React from 'react';
import { TABS, type TabType } from '../constants';

interface NavigationTab {
  key: TabType;
  label: string;
  icon: string;
}

interface AppNavigationProps {
  activeTab: TabType;
  documentsCount: number;
  onTabChange: (tab: TabType) => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  activeTab,
  documentsCount,
  onTabChange,
}) => {
  const tabs: NavigationTab[] = [
    {
      key: TABS.UPLOAD,
      label: 'Upload Documents',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
    },
    {
      key: TABS.DOCUMENTS,
      label: `Manage Documents (${documentsCount})`,
      icon: 'M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17H9v-2.5A3.5 3.5 0 0112.5 11H15v6z'
    },
    {
      key: TABS.SEARCH,
      label: 'Search Knowledge Base',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    }
  ];

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                relative py-4 px-4 flex items-center gap-2.5 font-medium text-sm transition-all duration-200
                ${activeTab === tab.key
                  ? 'text-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }
                rounded-t-lg
              `}
            >
              <svg className={`w-4 h-4 ${activeTab === tab.key ? 'text-primary-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.key && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-primary-600 rounded-t" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};