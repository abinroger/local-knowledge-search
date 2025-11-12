import { embeddingService } from '../lib/embeddingService';
import type { DocumentChunk } from '../lib/types';
import type { EmbeddingResult, BatchEmbeddingResult } from '../lib/embeddingService';

/**
 * Model information type
 */
type ModelInfo = {
  model: string;
  maxTokens: number;
  dimensions: number;
  isReady: boolean;
} | null;

/**
 * Message types for Web Worker communication
 */
export type EmbeddingWorkerMessage =
  | { type: 'INITIALIZE' }
  | { type: 'GENERATE_SINGLE'; payload: { text: string; chunkId: string } }
  | { type: 'GENERATE_BATCH'; payload: { chunks: DocumentChunk[] } }
  | { type: 'GET_STATUS' };

export type EmbeddingWorkerResponse =
  | { type: 'INITIALIZED'; payload: { success: boolean; modelInfo: ModelInfo } }
  | { type: 'INITIALIZATION_ERROR'; payload: { error: string } }
  | { type: 'SINGLE_RESULT'; payload: EmbeddingResult }
  | { type: 'SINGLE_ERROR'; payload: { error: string } }
  | { type: 'BATCH_RESULT'; payload: BatchEmbeddingResult }
  | { type: 'BATCH_ERROR'; payload: { error: string } }
  | { type: 'STATUS'; payload: { isReady: boolean; modelInfo: ModelInfo } }
  | { type: 'PROGRESS'; payload: { stage: string; progress: number; details?: string } };

/**
 * Embedding Web Worker
 * Runs embedding generation in background to avoid blocking the main thread
 */
class EmbeddingWorker {
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      await embeddingService.initialize();
      this.isInitialized = true;
    } catch (error) {
      console.error('[Worker] Failed to initialize embedding service:', error);
      throw error;
    }
  }

  async handleMessage(message: EmbeddingWorkerMessage): Promise<EmbeddingWorkerResponse> {
    try {
      switch (message.type) {
        case 'INITIALIZE': {
          await this.initialize();
          return {
            type: 'INITIALIZED',
            payload: {
              success: true,
              modelInfo: embeddingService.getModelInfo()
            }
          };
        }

        case 'GENERATE_SINGLE': {
          if (!this.isInitialized) {
            throw new Error('Embedding service not initialized');
          }

          const singleResult = await embeddingService.generateEmbedding(
            message.payload.text,
            message.payload.chunkId
          );

          return {
            type: 'SINGLE_RESULT',
            payload: singleResult
          };
        }

        case 'GENERATE_BATCH': {
          if (!this.isInitialized) {
            throw new Error('Embedding service not initialized');
          }

          // Send progress updates during batch processing
          const chunks = message.payload.chunks;
          const batchSize = 5; // Match embedding service batch size

          let processedCount = 0;

          for (let i = 0; i < chunks.length; i += batchSize) {
            const progress = Math.round((processedCount / chunks.length) * 100);

            postMessage({
              type: 'PROGRESS',
              payload: {
                stage: 'Generating embeddings',
                progress,
                details: `Processing ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`
              }
            });

            processedCount = Math.min(i + batchSize, chunks.length);
          }

          const batchResult = await embeddingService.generateBatchEmbeddings(chunks);

          return {
            type: 'BATCH_RESULT',
            payload: batchResult
          };
        }

        case 'GET_STATUS': {
          return {
            type: 'STATUS',
            payload: {
              isReady: this.isInitialized && embeddingService.isReady(),
              modelInfo: embeddingService.getModelInfo()
            }
          };
        }

        default: {
          const exhaustiveCheck: never = message;
          throw new Error(`Unknown message type: ${(exhaustiveCheck as { type: string }).type}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      switch (message.type) {
        case 'INITIALIZE':
          return {
            type: 'INITIALIZATION_ERROR',
            payload: { error: errorMessage }
          };

        case 'GENERATE_SINGLE':
          return {
            type: 'SINGLE_ERROR',
            payload: { error: errorMessage }
          };

        case 'GENERATE_BATCH':
          return {
            type: 'BATCH_ERROR',
            payload: { error: errorMessage }
          };

        default:
          throw error;
      }
    }
  }
}

// Create worker instance
const worker = new EmbeddingWorker();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<EmbeddingWorkerMessage>) => {
  const response = await worker.handleMessage(event.data);
  postMessage(response);
};

// Signal that worker is ready
postMessage({
  type: 'STATUS',
  payload: {
    isReady: false,
    modelInfo: null
  }
});