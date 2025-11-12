import { pipeline, env } from '@xenova/transformers';
import type { DocumentChunk } from './types';

// Configure Transformers.js to use local models for privacy
env.allowRemoteModels = false;
env.allowLocalModels = true;

/**
 * Type for the Transformers.js pipeline function
 */
type EmbeddingPipeline = (
  text: string,
  options?: { pooling?: 'none' | 'mean' | 'cls'; normalize?: boolean }
) => Promise<{ data: Float32Array }>;

/**
 * Configuration for the embedding model
 */
export const EMBEDDING_CONFIG = {
  model: 'Xenova/all-MiniLM-L6-v2',
  maxTokens: 384, // Model's maximum sequence length
  dimensions: 384, // Embedding vector dimensions
  batchSize: 5, // Process chunks in batches to manage memory
} as const;

/**
 * Result of embedding generation
 */
export interface EmbeddingResult {
  chunkId: string;
  embedding: number[];
  tokenCount: number;
  processingTimeMs: number;
}

/**
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
  results: EmbeddingResult[];
  totalProcessingTimeMs: number;
  successCount: number;
  errors: Array<{
    chunkId: string;
    error: string;
  }>;
}

/**
 * Service for generating embeddings using Transformers.js in the browser
 */
export class EmbeddingService {
  private pipeline: EmbeddingPipeline | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize the embedding pipeline
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializePipeline();
    await this.initializationPromise;
  }

  private async _initializePipeline(): Promise<void> {
    try {
      this.pipeline = (await pipeline(
        'feature-extraction',
        EMBEDDING_CONFIG.model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      )) as any; // Type assertion for Transformers.js compatibility

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize embedding pipeline:', error);
      this.initializationPromise = null;
      throw new Error(`Embedding service initialization failed: ${error}`);
    }
  }

  /**
   * Generate embedding for a single text chunk
   */
  async generateEmbedding(text: string, chunkId: string): Promise<EmbeddingResult> {
    await this.initialize();

    if (!this.pipeline) {
      throw new Error('Embedding pipeline not initialized');
    }

    const startTime = Date.now();

    try {
      // Truncate text if it exceeds model limits
      const truncatedText = this.truncateText(text);

      // Generate embedding
      const output = await this.pipeline(truncatedText, {
        pooling: 'mean',
        normalize: true,
      });

      // Extract embedding array from tensor
      const embedding = Array.from(output.data) as number[];

      const processingTime = Date.now() - startTime;

      return {
        chunkId,
        embedding,
        tokenCount: this.estimateTokenCount(truncatedText),
        processingTimeMs: processingTime,
      };
    } catch (error) {
      console.error(`Failed to generate embedding for chunk ${chunkId}:`, error);

      throw new Error(`Embedding generation failed: ${error}`);
    }
  }

  /**
   * Generate embeddings for multiple document chunks in batches
   */
  async generateBatchEmbeddings(chunks: DocumentChunk[]): Promise<BatchEmbeddingResult> {
    await this.initialize();

    const startTime = Date.now();
    const results: EmbeddingResult[] = [];
    const errors: Array<{ chunkId: string; error: string }> = [];

    // Process chunks in batches to manage memory usage
    for (let i = 0; i < chunks.length; i += EMBEDDING_CONFIG.batchSize) {
      const batch = chunks.slice(i, i + EMBEDDING_CONFIG.batchSize);

      // Process batch concurrently but with controlled parallelism
      const batchPromises = batch.map(async (chunk) => {
        try {
          const result = await this.generateEmbedding(chunk.text, chunk.id);
          return { success: true as const, result };
        } catch (error) {
          return {
            success: false as const,
            error: {
              chunkId: chunk.id,
              error: error instanceof Error ? error.message : String(error),
            },
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      // Collect results and errors
      for (const batchResult of batchResults) {
        if (batchResult.success) {
          results.push(batchResult.result);
        } else {
          errors.push(batchResult.error);
        }
      }

      // Add small delay between batches to prevent memory pressure
      if (i + EMBEDDING_CONFIG.batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const totalProcessingTime = Date.now() - startTime;

    return {
      results,
      totalProcessingTimeMs: totalProcessingTime,
      successCount: results.length,
      errors,
    };
  }

  /**
   * Truncate text to fit within model token limits
   */
  private truncateText(text: string): string {
    // Rough estimation: ~4 characters per token
    const maxChars = EMBEDDING_CONFIG.maxTokens * 4;

    if (text.length <= maxChars) {
      return text;
    }

    // Truncate at word boundary
    const truncated = text.slice(0, maxChars);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    return lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) : truncated;
  }

  /**
   * Estimate token count for text (rough approximation)
   */
  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if the service is ready for use
   */
  isReady(): boolean {
    return this.isInitialized && this.pipeline !== null;
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model: EMBEDDING_CONFIG.model,
      maxTokens: EMBEDDING_CONFIG.maxTokens,
      dimensions: EMBEDDING_CONFIG.dimensions,
      isReady: this.isReady(),
    };
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();