import { connect } from '@lancedb/lancedb';
import type { DocumentChunk, DocumentMetadata } from './types';
import type { EmbeddingResult } from './embeddingService';
import { generateId } from './utils';

/**
 * LanceDB database interface
 */
interface LanceDatabase {
  tableNames(): Promise<string[]>;
  openTable(name: string): Promise<LanceTable>;
  createTable(name: string, data: VectorRecord[]): Promise<LanceTable>;
}

/**
 * LanceDB table interface
 */
interface LanceTable {
  add(data: VectorRecord[]): Promise<void>;
  delete(predicate: string): Promise<void>;
  search(vector: number[] | []): LanceSearchQuery;
  countRows(): Promise<number>;
}

/**
 * LanceDB search query interface
 */
interface LanceSearchQuery {
  limit(n: number): LanceSearchQuery;
  where(predicate: string): LanceSearchQuery;
  select(columns: string[]): LanceSearchQuery;
  toArray(): Promise<LanceSearchResult[]>;
}

/**
 * LanceDB search result interface
 */
interface LanceSearchResult {
  id: string;
  documentId: string;
  chunkId: string;
  chunkIndex: number;
  text: string;
  vector: number[];
  metadata: VectorRecord['metadata'];
  _distance: number;
}

/**
 * Vector record interface for LanceDB
 */
export interface VectorRecord {
  id: string;
  documentId: string;
  chunkId: string;
  chunkIndex: number;
  text: string;
  vector: number[];
  metadata: {
    documentFilename: string;
    documentType: string;
    wordCount: number;
    startPosition: number;
    endPosition: number;
    createdAt: string;
  };
}

/**
 * Search result interface
 */
export interface SearchResult {
  chunkId: string;
  documentId: string;
  documentFilename: string;
  text: string;
  score: number;
  chunkIndex: number;
  metadata: VectorRecord['metadata'];
}

/**
 * Search options interface
 */
export interface SearchOptions {
  limit?: number;
  minScore?: number;
  documentIds?: string[];
  includeMetadata?: boolean;
}

/**
 * Storage statistics interface
 */
export interface StorageStats {
  totalDocuments: number;
  totalChunks: number;
  totalVectors: number;
  databaseSizeKB: number;
  lastUpdated: Date;
}

/**
 * Vector storage service using LanceDB with IndexedDB persistence
 */
export class VectorStorageService {
  private db: LanceDatabase | null = null;
  private table: LanceTable | null = null;
  private isInitialized = false;
  private readonly dbPath = '/tmp/lancedb'; // Virtual path for IndexedDB
  private readonly tableName = 'document_embeddings';

  /**
   * Initialize the vector database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing vector storage with LanceDB...');

      // Connect to LanceDB (will use IndexedDB in browser)
      this.db = await connect(this.dbPath) as any; // Type assertion for LanceDB compatibility

      if (!this.db) {
        throw new Error('Failed to connect to LanceDB');
      }

      // Check if table exists, create if not
      const tableNames = await this.db.tableNames();

      if (tableNames.includes(this.tableName)) {
        this.table = await this.db.openTable(this.tableName);
        console.log('Opened existing vector table');
      } else {
        // Create table with sample schema
        const sampleRecord: VectorRecord = {
          id: 'sample',
          documentId: 'sample',
          chunkId: 'sample',
          chunkIndex: 0,
          text: 'sample text',
          vector: new Array(384).fill(0),
          metadata: {
            documentFilename: 'sample.txt',
            documentType: 'txt',
            wordCount: 2,
            startPosition: 0,
            endPosition: 11,
            createdAt: new Date().toISOString(),
          },
        };

        this.table = await this.db.createTable(this.tableName, [sampleRecord]);

        // Remove sample record
        await this.table.delete("id = 'sample'");

        console.log('Created new vector table');
      }

      this.isInitialized = true;
      console.log('Vector storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector storage:', error);
      throw new Error(`Vector storage initialization failed: ${error}`);
    }
  }

  /**
   * Store embeddings for document chunks
   */
  async storeEmbeddings(
    chunks: DocumentChunk[],
    embeddings: EmbeddingResult[],
    documentMetadata: DocumentMetadata
  ): Promise<void> {
    await this.initialize();

    if (!this.table) {
      throw new Error('Vector table not initialized');
    }

    try {
      // Create embedding map for faster lookup
      const embeddingMap = new Map(
        embeddings.map(emb => [emb.chunkId, emb.embedding])
      );

      // Prepare vector records
      const vectorRecords: VectorRecord[] = chunks
        .filter(chunk => embeddingMap.has(chunk.id))
        .map(chunk => {
          const embedding = embeddingMap.get(chunk.id)!;

          return {
            id: generateId(),
            documentId: chunk.documentId,
            chunkId: chunk.id,
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
            vector: embedding,
            metadata: {
              documentFilename: documentMetadata.filename,
              documentType: documentMetadata.fileType,
              wordCount: chunk.wordCount,
              startPosition: chunk.startPosition,
              endPosition: chunk.endPosition,
              createdAt: new Date().toISOString(),
            },
          };
        });

      if (vectorRecords.length === 0) {
        throw new Error('No valid embeddings to store');
      }

      // Insert records into table
      await this.table.add(vectorRecords);

      console.log(`Stored ${vectorRecords.length} vector records for document ${documentMetadata.filename}`);
    } catch (error) {
      console.error('Failed to store embeddings:', error);
      throw new Error(`Embedding storage failed: ${error}`);
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryEmbedding: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    await this.initialize();

    if (!this.table) {
      throw new Error('Vector table not initialized');
    }

    try {
      const {
        limit = 10,
        minScore = 0.0,
        documentIds,
        includeMetadata = true,
      } = options;

      // Build search query
      let query = this.table.search(queryEmbedding).limit(limit);

      // Add document filter if specified
      if (documentIds && documentIds.length > 0) {
        const documentFilter = documentIds.map(id => `'${id}'`).join(', ');
        query = query.where(`documentId IN (${documentFilter})`);
      }

      // Execute search
      const results = await query.toArray();

      // Transform results and apply score filter
      const searchResults: SearchResult[] = results
        .filter((result: LanceSearchResult) => result._distance >= minScore)
        .map((result: LanceSearchResult) => ({
          chunkId: result.chunkId,
          documentId: result.documentId,
          documentFilename: result.metadata.documentFilename,
          text: result.text,
          score: result._distance,
          chunkIndex: result.chunkIndex,
          metadata: includeMetadata ? result.metadata : undefined,
        } as SearchResult))
        .filter((result: SearchResult): result is SearchResult => result !== undefined);

      return searchResults;
    } catch (error) {
      console.error('Vector search failed:', error);
      throw new Error(`Vector search failed: ${error}`);
    }
  }

  /**
   * Delete vectors for a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.initialize();

    if (!this.table) {
      throw new Error('Vector table not initialized');
    }

    try {
      await this.table.delete(`documentId = '${documentId}'`);
      console.log(`Deleted vectors for document ${documentId}`);
    } catch (error) {
      console.error('Failed to delete document vectors:', error);
      throw new Error(`Document vector deletion failed: ${error}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    await this.initialize();

    if (!this.table) {
      throw new Error('Vector table not initialized');
    }

    try {
      // Count total records
      const totalRecords = await this.table.countRows();

      // Get unique documents
      const documentsQuery = await this.table
        .search([])
        .select(['documentId', 'metadata'])
        .limit(10000)
        .toArray();

      // Get unique documents
      const uniqueDocuments = new Set(
        documentsQuery.map((record: LanceSearchResult) => record.documentId)
      ).size;

      // Estimate database size (rough calculation)
      const avgRecordSize = 2000; // bytes per record (text + vector + metadata)
      const estimatedSizeKB = Math.round((totalRecords * avgRecordSize) / 1024);

      return {
        totalDocuments: uniqueDocuments,
        totalChunks: totalRecords,
        totalVectors: totalRecords,
        databaseSizeKB: estimatedSizeKB,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw new Error(`Storage stats failed: ${error}`);
    }
  }

  /**
   * List all stored documents
   */
  async listDocuments(): Promise<Array<{
    documentId: string;
    filename: string;
    fileType: string;
    chunkCount: number;
    createdAt: string;
  }>> {
    await this.initialize();

    if (!this.table) {
      throw new Error('Vector table not initialized');
    }

    try {
      const records = await this.table
        .search([])
        .select(['documentId', 'metadata'])
        .limit(10000)
        .toArray();

      // Group by document
      const documentMap = new Map<string, {
        documentId: string;
        filename: string;
        fileType: string;
        chunkCount: number;
        createdAt: string;
      }>();

      for (const record of records) {
        const docId = record.documentId;
        const metadata = record.metadata;

        if (!documentMap.has(docId)) {
          documentMap.set(docId, {
            documentId: docId,
            filename: metadata.documentFilename,
            fileType: metadata.documentType,
            chunkCount: 1,
            createdAt: metadata.createdAt,
          });
        } else {
          const existing = documentMap.get(docId)!;
          existing.chunkCount++;
          // Keep earliest creation date
          if (metadata.createdAt < existing.createdAt) {
            existing.createdAt = metadata.createdAt;
          }
        }
      }

      return Array.from(documentMap.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to list documents:', error);
      throw new Error(`Document listing failed: ${error}`);
    }
  }

  /**
   * Clear all stored vectors
   */
  async clearAll(): Promise<void> {
    await this.initialize();

    if (!this.table) {
      throw new Error('Vector table not initialized');
    }

    try {
      await this.table.delete('true');
      console.log('Cleared all vector data');
    } catch (error) {
      console.error('Failed to clear vector data:', error);
      throw new Error(`Vector data clearing failed: ${error}`);
    }
  }

  /**
   * Check if storage is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.table !== null;
  }
}

// Export singleton instance
export const vectorStorageService = new VectorStorageService();