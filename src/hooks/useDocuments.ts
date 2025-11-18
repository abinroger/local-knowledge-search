import { useState, useCallback, useEffect } from 'react';
import { mockKnowledgeSearchService } from '../lib/mockServices';
import type { DocumentMetadata } from '../lib/types';

interface ProcessingStatus {
  isProcessing: boolean;
  processingFile: string;
  processingStage: string;
  processingProgress: number;
}

interface UseDocumentsReturn {
  documents: DocumentMetadata[];
  isLoading: boolean;
  error: string | null;
  processingStatus: ProcessingStatus;
  processDocument: (file: File) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

/**
 * Custom hook for managing document operations
 * Handles document upload, processing, deletion, and state management
 */
export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    processingFile: '',
    processingStage: '',
    processingProgress: 0,
  });

  // Fetch documents from service and convert to DocumentMetadata format
  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await mockKnowledgeSearchService.getDocuments();
      const documentMetadata: DocumentMetadata[] = docs.map(doc => ({
        id: doc.documentId,
        filename: doc.filename,
        fileType: doc.fileType as 'pdf' | 'docx' | 'txt' | 'md',
        chunkCount: doc.chunkCount,
        uploadedAt: new Date(doc.createdAt),
        lastIndexed: new Date(doc.createdAt),
        fileSize: 1024, // Mock file size
      }));
      setDocuments(documentMetadata);
    } catch (err) {
      console.error('Failed to refresh documents:', err);
      setError('Failed to load documents');
    }
  }, []);

  // Process a new document with progress tracking
  const processDocument = useCallback(async (file: File) => {
    setProcessingStatus({
      isProcessing: true,
      processingFile: file.name,
      processingProgress: 0,
      processingStage: 'Starting...',
    });
    setError(null);

    try {
      await mockKnowledgeSearchService.processDocument(
        file,
        (stage: string, progress: number) => {
          setProcessingStatus(prev => ({
            ...prev,
            processingStage: stage,
            processingProgress: progress,
          }));
        }
      );

      // Refresh document list after successful processing
      await refreshDocuments();

      // Reset processing status
      setProcessingStatus({
        isProcessing: false,
        processingFile: '',
        processingStage: '',
        processingProgress: 0,
      });
    } catch (err) {
      console.error('Failed to process document:', err);
      setError('Failed to process document');
      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: false,
      }));
    }
  }, [refreshDocuments]);

  // Delete a document by ID
  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      await mockKnowledgeSearchService.deleteDocument(documentId);
      await refreshDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError('Failed to delete document');
    }
  }, [refreshDocuments]);

  // Initialize documents on mount
  useEffect(() => {
    const initializeDocuments = async () => {
      try {
        setIsLoading(true);
        await mockKnowledgeSearchService.initialize();
        await refreshDocuments();
      } catch (err) {
        console.error('Failed to initialize documents:', err);
        setError('Failed to initialize the application');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDocuments();
  }, [refreshDocuments]);

  return {
    documents,
    isLoading,
    error,
    processingStatus,
    processDocument,
    deleteDocument,
    refreshDocuments,
  };
}
