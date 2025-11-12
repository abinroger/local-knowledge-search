import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      <div className="w-16 h-16 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 max-w-md leading-relaxed mb-6">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className = '',
}) => {
  return (
    <div className={`bg-white/50 backdrop-blur border border-neutral-200/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary-300/50 ${className}`}>
      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <h4 className="font-semibold text-neutral-900 mb-2">{title}</h4>
      <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
    </div>
  );
};

interface FeatureGridProps {
  className?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ className = '' }) => {
  const features = [
    {
      title: 'Smart Document Processing',
      description: 'Advanced text extraction and intelligent chunking for optimal search performance.',
      icon: 'M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17H9v-2.5A3.5 3.5 0 0112.5 11H15v6z'
    },
    {
      title: 'Semantic Search',
      description: 'Find information using natural language queries, not just exact keyword matches.',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    },
    {
      title: 'Privacy-First Design',
      description: 'All processing happens locally in your browser. Your documents never leave your device.',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      title: 'Instant Results',
      description: 'Lightning-fast search with intelligent ranking and relevant snippet highlighting.',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
        />
      ))}
    </div>
  );
};