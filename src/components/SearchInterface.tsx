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
      <div className="relative group">
        {/* Search input container with enhanced styling */}
        <div className="relative flex items-center">
          {/* Search icon */}
          <div className="absolute left-4 flex items-center pointer-events-none z-10">
            <svg
              className={`h-5 w-5 transition-colors ${
                isFocused ? 'text-primary-600' : 'text-neutral-400'
              }`}
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
              w-full pl-12 pr-32 py-4
              bg-white border-2 rounded-xl
              text-neutral-900 placeholder-neutral-400
              transition-all duration-200
              ${isFocused
                ? 'border-primary-500 ring-4 ring-primary-500/10 shadow-lg'
                : 'border-neutral-200 hover:border-neutral-300'
              }
              ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}
              focus:outline-none
            `}
            aria-label="Search query"
            aria-describedby={hasQuery ? "search-hint" : undefined}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Clear button or loading spinner */}
          <div className="absolute right-24 flex items-center">
            {isSearching ? (
              <div
                className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent"
                aria-label="Searching"
                role="status"
              />
            ) : hasQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors duration-150"
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

          {/* Search button */}
          <button
            type="submit"
            disabled={!hasQuery || isDisabled}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2
              px-6 py-2.5 text-sm font-semibold rounded-lg
              transition-all duration-200
              ${hasQuery && !isDisabled
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            `}
            aria-label="Submit search"
          >
            Search
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      {!hasQuery && !isDisabled && (
        <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded shadow-sm">
              Enter
            </kbd>
            <span>to search</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-100 border border-neutral-300 rounded shadow-sm">
              Esc
            </kbd>
            <span>to clear</span>
          </div>
        </div>
      )}
    </form>
  );
};