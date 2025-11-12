import React, { useState, useCallback, useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { AppNavigation, type TabType } from './components/AppNavigation';
import { PageLayout } from './components/PageLayout';
import { EmptyState, FeatureGrid } from './components/EmptyStates';
import { DocumentUpload } from './components/DocumentUpload';
import { ProcessingProgress } from './components/ProcessingProgress';
import { SearchInterface } from './components/SearchInterface';
import { SearchResults } from './components/SearchResults';
import { DocumentManager } from './components/DocumentManager';
import { mockKnowledgeSearchService, createDemoData, type MockSearchResult } from './lib/mockServices';
import type { DocumentMetadata } from './lib/types';
import './App.css';

interface AppState {
  activeTab: TabType;
  documents: DocumentMetadata[];
  searchResults: MockSearchResult[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
  processingStage: string;
  processingProgress: number;
  processingFile: string;
  searchLoading: boolean;
  searchQuery: string;
}

const initialState: AppState = {
  activeTab: 'upload',
  documents: [],
  searchResults: [],
  isInitialized: false,
  isLoading: false,
  isProcessing: false,
  processingFile: '',
  processingProgress: 0,
  processingStage: '',
  searchQuery: '',
  searchLoading: false,
  error: null,
};

export default function App() {
    const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        await mockKnowledgeSearchService.initialize();

        await createDemoData();

        const docs = await mockKnowledgeSearchService.getDocuments();
        const documents = docs.map(doc => ({
          id: doc.documentId,
          filename: doc.filename,
          fileType: doc.fileType as 'pdf' | 'docx' | 'txt' | 'md',
          chunkCount: doc.chunkCount,
          uploadedAt: new Date(doc.createdAt),
          lastIndexed: new Date(doc.createdAt),
          fileSize: 1024
        }));

      setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          documents,
          activeTab: documents.length > 0 ? 'search' : 'upload'
        }));
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize the application'
        }));
      }
    };

    initializeApp();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-white to-neutral-100">
      <AppHeader documentsCount={state.documents.length} />

      <AppNavigation
        activeTab={state.activeTab}
        documentsCount={state.documents.length}
        onTabChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}
      />

      <PageLayout activeTab={state.activeTab}>
        <AppContent state={state} setState={setState} />
      </PageLayout>
    </div>
  );
}

interface AppContentProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

function AppContent({ state, setState }: AppContentProps) {
  const handleFileUpload = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      processingFile: file.name,
      processingProgress: 0,
      processingStage: 'Starting...',
      error: null
    }));

    try {
      await mockKnowledgeSearchService.processDocument(
        file,
        (stage: string, progress: number) => {
          setState(prev => ({
            ...prev,
            processingStage: stage,
            processingProgress: progress
          }));
        }
      );

      const docs = await mockKnowledgeSearchService.getDocuments();
      const documents = docs.map(doc => ({
        id: doc.documentId,
        filename: doc.filename,
        fileType: doc.fileType as 'pdf' | 'docx' | 'txt' | 'md',
        chunkCount: doc.chunkCount,
        uploadedAt: new Date(doc.createdAt),
        lastIndexed: new Date(doc.createdAt),
        fileSize: 1024
      }));

      setState(prev => ({
        ...prev,
        isProcessing: false,
        documents,
        activeTab: 'search'
      }));
    } catch (err) {
      console.error('Failed to process document:', err);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: 'Failed to process document'
      }));
    }
  }, [setState]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, searchResults: [], searchQuery: '' }));
      return;
    }

    setState(prev => ({
      ...prev,
      searchLoading: true,
      searchQuery: query,
      error: null
    }));

    try {
      const results = await mockKnowledgeSearchService.search(query);
      setState(prev => ({
        ...prev,
        searchResults: results,
        searchLoading: false
      }));
    } catch (err) {
      console.error('Search failed:', err);
      setState(prev => ({
        ...prev,
        searchLoading: false,
        error: 'Search failed'
      }));
    }
  }, [setState]);

  const handleResultClick = useCallback((_result: MockSearchResult) => {
    // Handle result click
  }, []);

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    try {
      await mockKnowledgeSearchService.deleteDocument(documentId);
      const docs = await mockKnowledgeSearchService.getDocuments();
      const documents = docs.map(doc => ({
        id: doc.documentId,
        filename: doc.filename,
        fileType: doc.fileType as 'pdf' | 'docx' | 'txt' | 'md',
        chunkCount: doc.chunkCount,
        uploadedAt: new Date(doc.createdAt),
        lastIndexed: new Date(doc.createdAt),
        fileSize: 1024
      }));

      setState(prev => ({ ...prev, documents }));
    } catch (err) {
      console.error('Failed to delete document:', err);
      setState(prev => ({ ...prev, error: 'Failed to delete document' }));
    }
  }, [setState]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{state.error}</div>
        <button
          onClick={() => setState(prev => ({ ...prev, error: null }))}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (state.activeTab === 'upload') {
    return (
      <>
        {state.isProcessing && (
          <ProcessingProgress
            stage={state.processingStage}
            progress={state.processingProgress}
            details={`Processing ${state.processingFile}...`}
          />
        )}

        {!state.isProcessing && (
          <div className="space-y-8">
            <DocumentUpload onFileSelect={handleFileUpload} />
            <FeatureGrid />
          </div>
        )}
      </>
    );
  }

  if (state.activeTab === 'documents') {
    if (state.documents.length === 0) {
      return (
        <EmptyState
          title="No documents uploaded yet"
          description="Upload some documents to start building your knowledge base and enable semantic search."
          icon="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          actionLabel="Upload Documents"
          onAction={() => setState(prev => ({ ...prev, activeTab: 'upload' }))}
        />
      );
    }

    return (
      <DocumentManager
        documents={state.documents.map(doc => ({
          documentId: doc.id,
          filename: doc.filename,
          fileType: doc.fileType,
          chunkCount: doc.chunkCount,
          createdAt: doc.uploadedAt.toISOString()
        }))}
        onDeleteDocument={handleDeleteDocument}
      />
    );
  }

  if (state.activeTab === 'search') {
    if (state.documents.length === 0) {
      return (
        <EmptyState
          title="No documents to search"
          description="Upload some documents first to enable semantic search across your knowledge base."
          icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          actionLabel="Upload Documents"
          onAction={() => setState(prev => ({ ...prev, activeTab: 'upload' }))}
        />
      );
    }

    return (
      <div className="space-y-6">
        <SearchInterface
          onSearch={handleSearch}
          isSearching={state.searchLoading}
          placeholder="Search your knowledge base..."
        />

        {state.searchQuery && state.searchResults.length === 0 && !state.searchLoading && (
          <EmptyState
            title="No results found"
            description={`No documents match your search for "${state.searchQuery}". Try different keywords or upload more relevant documents.`}
            icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        )}

        {state.searchResults.length > 0 && (
          <SearchResults
            results={state.searchResults}
            isLoading={state.searchLoading}
            query={state.searchQuery}
            onResultClick={handleResultClick}
          />
        )}
      </div>
    );
  }

  return null;
}