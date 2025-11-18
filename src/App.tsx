import React, { useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { AppNavigation } from './components/AppNavigation';
import { PageLayout } from './components/PageLayout';
import { EmptyState, FeatureGrid } from './components/EmptyStates';
import { DocumentUpload } from './components/DocumentUpload';
import { ProcessingProgress } from './components/ProcessingProgress';
import { SearchInterface } from './components/SearchInterface';
import { SearchResults } from './components/SearchResults';
import { DocumentManager } from './components/DocumentManager';
import { createDemoData } from './lib/mockServices';
import { useDocuments, useSearch, useActiveTab } from './hooks';
import { TABS } from './constants';
import './App.css';

export default function App() {
  const {
    documents,
    isLoading,
    error: documentsError,
    processingStatus,
    processDocument,
    deleteDocument,
  } = useDocuments();

  const {
    query: searchQuery,
    results: searchResults,
    isSearching,
    search,
  } = useSearch();

  const [activeTab, setActiveTab] = useActiveTab(documents.length);

  // Initialize demo data on mount
  useEffect(() => {
    const initializeDemoData = async () => {
      try {
        await createDemoData();
      } catch (error) {
        console.error('Failed to create demo data:', error);
      }
    };

    initializeDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader documentsCount={documents.length} />

      <AppNavigation
        activeTab={activeTab}
        documentsCount={documents.length}
        onTabChange={setActiveTab}
      />

      <PageLayout activeTab={activeTab}>
        <AppContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          documents={documents}
          isLoading={isLoading}
          documentsError={documentsError}
          processingStatus={processingStatus}
          processDocument={processDocument}
          deleteDocument={deleteDocument}
          searchQuery={searchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          search={search}
        />
      </PageLayout>
    </div>
  );
}

interface AppContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documents: any[];
  isLoading: boolean;
  documentsError: string | null;
  processingStatus: {
    isProcessing: boolean;
    processingFile: string;
    processingStage: string;
    processingProgress: number;
  };
  processDocument: (file: File) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  searchQuery: string;
  searchResults: any[];
  isSearching: boolean;
  search: (query: string) => Promise<void>;
}

function AppContent({
  activeTab,
  setActiveTab,
  documents,
  isLoading,
  documentsError,
  processingStatus,
  processDocument,
  deleteDocument,
  searchQuery,
  searchResults,
  isSearching,
  search,
}: AppContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (documentsError) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{documentsError}</div>
      </div>
    );
  }

  if (activeTab === TABS.UPLOAD) {
    return (
      <>
        {processingStatus.isProcessing && (
          <ProcessingProgress
            stage={processingStatus.processingStage}
            progress={processingStatus.processingProgress}
            details={`Processing ${processingStatus.processingFile}...`}
          />
        )}

        {!processingStatus.isProcessing && (
          <div className="space-y-8">
            <DocumentUpload onFileSelect={processDocument} />
            <FeatureGrid />
          </div>
        )}
      </>
    );
  }

  if (activeTab === TABS.DOCUMENTS) {
    if (documents.length === 0) {
      return (
        <EmptyState
          title="No documents uploaded yet"
          description="Upload some documents to start building your knowledge base and enable semantic search."
          icon="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          actionLabel="Upload Documents"
          onAction={() => setActiveTab(TABS.UPLOAD)}
        />
      );
    }

    return (
      <DocumentManager
        documents={documents.map(doc => ({
          documentId: doc.id,
          filename: doc.filename,
          fileType: doc.fileType,
          chunkCount: doc.chunkCount,
          createdAt: doc.uploadedAt.toISOString()
        }))}
        onDeleteDocument={deleteDocument}
      />
    );
  }

  if (activeTab === TABS.SEARCH) {
    if (documents.length === 0) {
      return (
        <EmptyState
          title="No documents to search"
          description="Upload some documents first to enable semantic search across your knowledge base."
          icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          actionLabel="Upload Documents"
          onAction={() => setActiveTab(TABS.UPLOAD)}
        />
      );
    }

    return (
      <div className="space-y-6">
        <SearchInterface
          onSearch={search}
          isSearching={isSearching}
          placeholder="Search your knowledge base..."
        />

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <EmptyState
            title="No results found"
            description={`No documents match your search for "${searchQuery}". Try different keywords or upload more relevant documents.`}
            icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        )}

        {searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            isLoading={isSearching}
            query={searchQuery}
            onResultClick={() => {}}
          />
        )}
      </div>
    );
  }

  return null;
}