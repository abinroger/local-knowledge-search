import React, { useState, useCallback, useRef, useEffect } from 'react';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  isSearching = false,
  disabled = false,
  placeholder = "Search your documents...",
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search submission
  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery || disabled || isSearching) return;

    onSearch(trimmedQuery);
  }, [query, onSearch, disabled, isSearching]);

  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  // Handle clear button
  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  // Focus input on mount
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const isDisabled = disabled || isSearching;
  const hasQuery = query.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      role="search"
      aria-label="Document search"
    >
      <div className="relative">
        {/* Search input container */}
        <div
          className={`
            relative flex items-center w-full border rounded-lg transition-all duration-200
            ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'}
            ${isDisabled ? 'bg-gray-50 opacity-60' : 'bg-white'}
          `}
        >
          {/* Search icon */}
          <div className="flex-shrink-0 pl-3">
            <svg
              className={`h-5 w-5 ${isSearching ? 'text-blue-500' : 'text-gray-400'}`}
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
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isSearching ? "Searching..." : placeholder}
            disabled={isDisabled}
            className={`
              flex-1 w-full py-3 px-3 text-gray-900 placeholder-gray-500 border-0 rounded-l-lg focus:outline-none focus:ring-0
              ${isDisabled ? 'cursor-not-allowed' : ''}
            `}
            aria-label="Search query"
            aria-describedby={hasQuery ? "search-hint" : undefined}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Loading spinner or clear button */}
          <div className="flex-shrink-0 pr-3">
            {isSearching ? (
              <div
                className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"
                aria-label="Searching"
                role="status"
              />
            ) : hasQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                aria-label="Clear search"
                disabled={isDisabled}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={!hasQuery || isDisabled}
          className={`
            absolute right-1 top-1 bottom-1 px-4 text-sm font-medium rounded-md transition-all duration-200
            ${hasQuery && !isDisabled
              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label="Submit search"
        >
          Search
        </button>
      </div>

      {/* Search hint */}
      {hasQuery && (
        <p
          id="search-hint"
          className="mt-2 text-xs text-gray-500"
        >
          Press Enter or click Search to find documents containing "{query.trim()}"
        </p>
      )}

      {/* Keyboard shortcuts hint */}
      {!hasQuery && !isDisabled && (
        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
              Enter
            </kbd>
            <span>to search</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
              Esc
            </kbd>
            <span>to clear</span>
          </div>
        </div>
      )}
    </form>
  );
};