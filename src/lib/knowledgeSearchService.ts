import type { DocumentMetadata, DocumentChunk, ProcessingResult } from './types';
import { extractTextFromFile } from './textExtractor';
import { embeddingService } from './embeddingService';
import { vectorStorageService } from './vectorStorageService';
import type { EmbeddingResult, BatchEmbeddingResult } from './embeddingService';
import type { SearchResult, SearchOptions } from './vectorStorageService';

/**
 * Progress callback type for processing updates
 */
export type ProgressCallback = (stage: string, progress: number, details?: string) => void;

/**
 * Complete processing result including embeddings and storage
 */
export interface CompleteProcessingResult {
  metadata: DocumentMetadata;
  chunks: DocumentChunk[];
  embeddings: EmbeddingResult[];
  success: boolean;
  error?: string;
  processingTimeMs: number;
}

/**
 * Document search query
 */
export interface DocumentSearchQuery {
  query: string;
  options?: SearchOptions;
}

/**
 * Search result with enhanced metadata
 */
export interface EnhancedSearchResult extends SearchResult {
  relevanceReason?: string;
  snippet?: string;
}

/**
 * Knowledge search service that orchestrates the complete document processing pipeline
 */
export class KnowledgeSearchService {
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize all underlying services
   */
  async initialize(onProgress?: ProgressCallback): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializeServices(onProgress);
    await this.initializationPromise;
  }

  private async _initializeServices(onProgress?: ProgressCallback): Promise<void> {
    try {
      onProgress?.('Initializing AI models...', 10);

      // Initialize embedding service (loads AI model)
      await embeddingService.initialize();
      onProgress?.('AI models loaded', 50);

      // Initialize vector storage
      await vectorStorageService.initialize();
      onProgress?.('Vector database ready', 80);

      this.isInitialized = true;
      onProgress?.('System ready', 100);
    } catch (error) {
      this.initializationPromise = null;
      throw new Error(`Knowledge search service initialization failed: ${error}`);
    }
  }

  /**
   * Process a document file completely: extract text, chunk, generate embeddings, and store
   */
  async processDocument(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<CompleteProcessingResult> {
    await this.initialize();

    const startTime = Date.now();

    try {
      onProgress?.('Processing document...', 0, 'Extracting text');

      // Step 1: Extract text and create chunks
      const extractionResult: ProcessingResult = await extractTextFromFile(file);

      if (!extractionResult.success) {
        return {
          metadata: extractionResult.metadata,
          chunks: [],
          embeddings: [],
          success: false,
          error: extractionResult.error,
          processingTimeMs: Date.now() - startTime,
        };
      }

      onProgress?.('Text extracted successfully', 20, `${extractionResult.chunks.length} chunks created`);

      // Step 2: Generate embeddings for all chunks
      onProgress?.('Generating embeddings...', 30, 'Processing with AI model');

      const embeddingResult: BatchEmbeddingResult = await embeddingService.generateBatchEmbeddings(
        extractionResult.chunks
      );

      if (embeddingResult.errors.length > 0) {
        console.warn(`Embedding generation had ${embeddingResult.errors.length} errors:`, embeddingResult.errors);
      }

      const successRate = (embeddingResult.successCount / extractionResult.chunks.length) * 100;
      onProgress?.('Embeddings generated', 70, `${embeddingResult.successCount}/${extractionResult.chunks.length} chunks (${successRate.toFixed(0)}%)`);

      // Step 3: Store embeddings in vector database
      if (embeddingResult.results.length > 0) {
        onProgress?.('Storing in vector database...', 80, 'Indexing for search');

        await vectorStorageService.storeEmbeddings(
          extractionResult.chunks,
          embeddingResult.results,
          extractionResult.metadata
        );

        onProgress?.('Storage complete', 100, 'Document ready for search');
      }

      const totalTime = Date.now() - startTime;

      return {
        metadata: extractionResult.metadata,
        chunks: extractionResult.chunks,
        embeddings: embeddingResult.results,
        success: true,
        processingTimeMs: totalTime,
      };

    } catch (error) {
      console.error('Document processing failed:', error);

      // Create minimal metadata for error case
      const errorMetadata: DocumentMetadata = {
        id: `error_${Date.now()}`,
        filename: file.name,
        fileSize: file.size,
        fileType: this.getFileTypeFromFile(file),
        uploadedAt: new Date(),
        lastIndexed: new Date(),
        chunkCount: 0,
        errorMessage: error instanceof Error ? error.message : String(error),
      };

      return {
        metadata: errorMetadata,
        chunks: [],
        embeddings: [],
        success: false,
        error: error instanceof Error ? error.message : String(error),
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Search for documents using natural language queries
   */
  async search(
    query: string,
    options?: SearchOptions
  ): Promise<EnhancedSearchResult[]> {
    await this.initialize();

    if (!query.trim()) {
      return [];
    }

    try {
      // Generate embedding for search query
      const queryEmbedding = await embeddingService.generateEmbedding(
        query.trim(),
        `query_${Date.now()}`
      );

      // Search vector database
      const searchResults = await vectorStorageService.search(
        queryEmbedding.embedding,
        {
          limit: options?.limit || 10,
          minScore: options?.minScore || 0.3,
          documentIds: options?.documentIds,
          includeMetadata: options?.includeMetadata !== false,
        }
      );

      // Enhance results with snippets and relevance reasoning
      const enhancedResults: EnhancedSearchResult[] = searchResults.map(result => ({
        ...result,
        snippet: this.generateSnippet(result.text, query),
        relevanceReason: this.generateRelevanceReason(result.score),
      }));

      return enhancedResults;

    } catch (error) {
      console.error('Search failed:', error);
      throw new Error(`Search failed: ${error}`);
    }
  }

  /**
   * Get list of all processed documents
   */
  async getDocuments(): Promise<Array<{
    documentId: string;
    filename: string;
    fileType: string;
    chunkCount: number;
    createdAt: string;
  }>> {
    await this.initialize();
    return vectorStorageService.listDocuments();
  }

  /**
   * Delete a document and all its embeddings
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.initialize();
    await vectorStorageService.deleteDocument(documentId);
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    await this.initialize();
    const storageStats = await vectorStorageService.getStats();

    return {
      ...storageStats,
      embeddingModel: embeddingService.getModelInfo(),
      isReady: this.isReady(),
    };
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    await this.initialize();
    await vectorStorageService.clearAll();
  }

  /**
   * Check if the service is ready for use
   */
  isReady(): boolean {
    return (
      this.isInitialized &&
      embeddingService.isReady() &&
      vectorStorageService.isReady()
    );
  }

  /**
   * Generate a snippet from text highlighting relevant parts
   */
  private generateSnippet(text: string, query: string, maxLength: number = 150): string {
    const words = text.split(/\s+/);
    const queryWords = query.toLowerCase().split(/\s+/);

    // Find the best starting position (where most query words appear)
    let bestStart = 0;
    let bestScore = 0;

    for (let i = 0; i < Math.max(0, words.length - 20); i++) {
      const window = words.slice(i, i + 20).join(' ').toLowerCase();
      const score = queryWords.reduce((acc, qWord) =>
        acc + (window.includes(qWord) ? 1 : 0), 0
      );

      if (score > bestScore) {
        bestScore = score;
        bestStart = i;
      }
    }

    // Create snippet around best position
    const snippetWords = words.slice(bestStart, bestStart + 25);
    let snippet = snippetWords.join(' ');

    if (snippet.length > maxLength) {
      snippet = snippet.slice(0, maxLength) + '...';
    }

    if (bestStart > 0) {
      snippet = '...' + snippet;
    }

    return snippet;
  }

  /**
   * Generate a human-readable relevance reason based on similarity score
   */
  private generateRelevanceReason(score: number): string {
    if (score >= 0.8) {
      return 'Very high relevance';
    } else if (score >= 0.7) {
      return 'High relevance';
    } else if (score >= 0.6) {
      return 'Good relevance';
    } else if (score >= 0.5) {
      return 'Moderate relevance';
    } else {
      return 'Low relevance';
    }
  }

  /**
   * Determine file type from File object
   */
  private getFileTypeFromFile(file: File): 'pdf' | 'docx' | 'txt' | 'md' {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
        return 'docx';
      case 'md':
      case 'markdown':
        return 'md';
      default:
        return 'txt';
    }
  }
}

// Export singleton instance
export const knowledgeSearchService = new KnowledgeSearchService();