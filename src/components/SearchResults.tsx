import React from 'react';
import type { EnhancedSearchResult } from '../lib/knowledgeSearchService';

interface SearchResultsProps {
  results: EnhancedSearchResult[];
  query: string;
  isLoading?: boolean;
  onResultClick?: (result: EnhancedSearchResult) => void;
}

interface SearchResultItemProps {
  result: EnhancedSearchResult;
  query: string;
  onClick?: (result: EnhancedSearchResult) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  query,
  onClick
}) => {
  const handleClick = () => {
    onClick?.(result);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  // Highlight query terms in text
  const highlightText = (text: string, searchQuery: string): React.ReactElement => {
    if (!searchQuery.trim()) return <>{text}</>;

    const terms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    if (terms.length === 0) return <>{text}</>;

    let highlightedText = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  // Get relevance color based on score
  const getRelevanceColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.7) return 'text-blue-600 bg-blue-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div
      className={`
        border border-gray-200 rounded-lg p-4 transition-all duration-200 cursor-pointer
        ${onClick ? 'hover:border-gray-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}
      `}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'article'}
      aria-label={onClick ? `Open result from ${result.documentFilename}` : undefined}
    >
      <div className="space-y-3">
        {/* Document info and relevance */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {result.documentFilename}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Chunk {result.chunkIndex + 1} • {result.metadata?.wordCount} words
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <span
              className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${getRelevanceColor(result.score)}
              `}
              title={`Relevance score: ${(result.score * 100).toFixed(1)}%`}
            >
              {result.relevanceReason}
            </span>
          </div>
        </div>

        {/* Text content with highlighting */}
        <div className="text-sm text-gray-700 leading-relaxed">
          {result.snippet ? (
            <p className="italic text-gray-600">
              {highlightText(result.snippet, query)}
            </p>
          ) : (
            <p>
              {highlightText(
                result.text.length > 200
                  ? result.text.substring(0, 200) + '...'
                  : result.text,
                query
              )}
            </p>
          )}
        </div>

        {/* Metadata */}
        {result.metadata && (
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Position: {result.metadata.startPosition}-{result.metadata.endPosition}</span>
            <span>•</span>
            <span>Created: {new Date(result.metadata.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  query,
  isLoading = false,
  onResultClick,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <span className="text-sm">Searching your documents...</span>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-700 mb-2">Start Searching</p>
        <p className="text-sm">
          Enter a question or keyword to find relevant information in your documents
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17H9v-2.5A3.5 3.5 0 0112.5 11H15v6z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-700 mb-2">No Results Found</p>
        <p className="text-sm">
          Try rephrasing your search query or uploading more documents
        </p>
        <div className="mt-4 text-xs text-gray-500">
          <p>Searched for: <span className="font-mono bg-gray-100 px-2 py-1 rounded">"{query}"</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Search Results
        </h2>
        <span className="text-sm text-gray-500">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </span>
      </div>

      {/* Results list */}
      <div
        className="space-y-3"
        role="list"
        aria-label={`${results.length} search results`}
      >
        {results.map((result, index) => (
          <div key={`${result.chunkId}-${index}`} role="listitem">
            <SearchResultItem
              result={result}
              query={query}
              onClick={onResultClick}
            />
          </div>
        ))}
      </div>

      {/* Results footer */}
      {results.length > 5 && (
        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Showing {results.length} most relevant results
          </p>
        </div>
      )}
    </div>
  );
};