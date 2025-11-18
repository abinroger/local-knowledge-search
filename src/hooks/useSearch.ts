import { useState, useCallback } from 'react';
import { mockKnowledgeSearchService, type MockSearchResult } from '../lib/mockServices';

interface UseSearchReturn {
  query: string;
  results: MockSearchResult[];
  isSearching: boolean;
  error: string | null;
  search: (searchQuery: string) => Promise<void>;
  clearSearch: () => void;
  setQuery: (query: string) => void;
}

/**
 * Custom hook for managing search operations
 * Handles search query, results, loading state, and error handling
 */
export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Perform search with the given query
  const search = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();

    // Clear results if query is empty
    if (!trimmedQuery) {
      setQuery('');
      setResults([]);
      return;
    }

    setQuery(searchQuery);
    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await mockKnowledgeSearchService.search(trimmedQuery);
      setResults(searchResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Clear search results and query
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    isSearching,
    error,
    search,
    clearSearch,
    setQuery,
  };
}
