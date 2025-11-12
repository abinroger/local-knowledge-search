// Mock services for development/demo
import type { DocumentMetadata, DocumentChunk } from './types';
import type { EnhancedSearchResult } from './knowledgeSearchService';

// Use the standard EnhancedSearchResult type for consistency
export type MockSearchResult = EnhancedSearchResult;

// Mock in-memory storage
const mockDocuments: Map<string, DocumentMetadata> = new Map();
const mockChunks: Map<string, DocumentChunk[]> = new Map();

export const mockKnowledgeSearchService = {
  async initialize() {
    // Mock initialization
  },

  // Add method to clear all data for testing
  clearData() {
    mockDocuments.clear();
    mockChunks.clear();
  },

  async processDocument(
    file: File,
    progressCallback?: (stage: string, progress: number) => void
  ) {
    // Simulate processing stages with shorter delays for testing
    const delay = process.env.NODE_ENV === 'test' ? 50 : 500;

    progressCallback?.('Reading file...', 20);
    await new Promise(resolve => setTimeout(resolve, delay));

    progressCallback?.('Extracting text...', 40);
    await new Promise(resolve => setTimeout(resolve, delay));

    progressCallback?.('Creating chunks...', 60);
    await new Promise(resolve => setTimeout(resolve, delay));

    progressCallback?.('Generating embeddings...', 80);
    await new Promise(resolve => setTimeout(resolve, delay * 2));

    progressCallback?.('Storing data...', 100);
    await new Promise(resolve => setTimeout(resolve, delay / 2));

    // Create mock document
    const docId = `doc_${Date.now()}`;
    const doc: DocumentMetadata = {
      id: docId,
      filename: file.name,
      fileSize: file.size,
      fileType: file.name.endsWith('.pdf') ? 'pdf' :
                file.name.endsWith('.docx') ? 'docx' :
                file.name.endsWith('.md') ? 'md' : 'txt',
      uploadedAt: new Date(),
      lastIndexed: new Date(),
      chunkCount: 3
    };

    mockDocuments.set(docId, doc);

    // Create mock chunks
    const chunks: DocumentChunk[] = [
      {
        id: `chunk_${docId}_1`,
        documentId: docId,
        chunkIndex: 0,
        text: `This is a sample chunk from ${file.name}. It contains important information about the document content.`,
        wordCount: 17,
        startPosition: 0,
        endPosition: 100
      },
      {
        id: `chunk_${docId}_2`,
        documentId: docId,
        chunkIndex: 1,
        text: `Second chunk of the document discusses key concepts and main ideas presented in the file.`,
        wordCount: 16,
        startPosition: 100,
        endPosition: 200
      },
      {
        id: `chunk_${docId}_3`,
        documentId: docId,
        chunkIndex: 2,
        text: `Final section covers conclusions and summary of all the important points discussed throughout.`,
        wordCount: 15,
        startPosition: 200,
        endPosition: 300
      }
    ];

    mockChunks.set(docId, chunks);

    return { success: true, documentId: docId };
  },

  async getDocuments(): Promise<Array<{
    documentId: string;
    filename: string;
    fileType: string;
    chunkCount: number;
    createdAt: string;
  }>> {
    return Array.from(mockDocuments.values()).map(doc => ({
      documentId: doc.id,
      filename: doc.filename,
      fileType: doc.fileType,
      chunkCount: doc.chunkCount,
      createdAt: doc.uploadedAt.toISOString()
    }));
  },

  async search(query: string, options?: { limit?: number; minScore?: number }): Promise<MockSearchResult[]> {
    if (!query.trim()) return [];

    // Mock search - find chunks that contain query words
    const results: MockSearchResult[] = [];
    const queryLower = query.toLowerCase();

    for (const [docId, chunks] of mockChunks.entries()) {
      const doc = mockDocuments.get(docId);
      if (!doc) continue;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkLower = chunk.text.toLowerCase();

        // Simple text matching
        if (chunkLower.includes(queryLower)) {
          results.push({
            chunkId: chunk.id,
            documentId: docId,
            documentFilename: doc.filename,
            text: chunk.text,
            score: 0.8 - (i * 0.1), // Mock relevance scoring
            chunkIndex: chunk.chunkIndex,
            metadata: {
              documentFilename: doc.filename,
              documentType: doc.fileType,
              wordCount: chunk.wordCount,
              startPosition: chunk.startPosition,
              endPosition: chunk.endPosition,
              createdAt: doc.uploadedAt.toISOString()
            },
            relevanceReason: `Contains "${query}"`,
            snippet: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : '')
          });
        }
      }
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    const limit = options?.limit || 20;
    return results.slice(0, limit);
  },

  async deleteDocument(documentId: string) {
    mockDocuments.delete(documentId);
    mockChunks.delete(documentId);
  }
};

// Demo data
export const createDemoData = async () => {
  // Add sample documents for demonstration
  const demoDoc1: DocumentMetadata = {
    id: 'demo_doc_1',
    filename: 'Sample Research Paper.pdf',
    fileSize: 1024000,
    fileType: 'pdf',
    uploadedAt: new Date(Date.now() - 86400000), // 1 day ago
    lastIndexed: new Date(Date.now() - 86400000),
    chunkCount: 5
  };

  const demoDoc2: DocumentMetadata = {
    id: 'demo_doc_2',
    filename: 'Project Documentation.docx',
    fileSize: 512000,
    fileType: 'docx',
    uploadedAt: new Date(Date.now() - 3600000), // 1 hour ago
    lastIndexed: new Date(Date.now() - 3600000),
    chunkCount: 3
  };

  mockDocuments.set(demoDoc1.id, demoDoc1);
  mockDocuments.set(demoDoc2.id, demoDoc2);

  // Demo chunks for search
  mockChunks.set('demo_doc_1', [
    {
      id: 'chunk_demo_1_1',
      documentId: 'demo_doc_1',
      chunkIndex: 0,
      text: 'Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data.',
      wordCount: 30,
      startPosition: 0,
      endPosition: 150
    },
    {
      id: 'chunk_demo_1_2',
      documentId: 'demo_doc_1',
      chunkIndex: 1,
      text: 'Neural networks are computing systems inspired by biological neural networks. They can recognize patterns and solve common problems in artificial intelligence, machine learning and data mining.',
      wordCount: 28,
      startPosition: 150,
      endPosition: 300
    },
    {
      id: 'chunk_demo_1_3',
      documentId: 'demo_doc_1',
      chunkIndex: 2,
      text: 'Deep learning is part of a broader family of machine learning methods based on artificial neural networks with representation learning.',
      wordCount: 21,
      startPosition: 300,
      endPosition: 400
    }
  ]);

  mockChunks.set('demo_doc_2', [
    {
      id: 'chunk_demo_2_1',
      documentId: 'demo_doc_2',
      chunkIndex: 0,
      text: 'This project aims to create a user-friendly interface for document management. The system will allow users to upload, organize, and search through their documents efficiently.',
      wordCount: 27,
      startPosition: 0,
      endPosition: 140
    },
    {
      id: 'chunk_demo_2_2',
      documentId: 'demo_doc_2',
      chunkIndex: 1,
      text: 'The application features include drag-and-drop upload, automatic text extraction, and semantic search capabilities powered by modern AI technologies.',
      wordCount: 22,
      startPosition: 140,
      endPosition: 250
    }
  ]);
};