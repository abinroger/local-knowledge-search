import type { DocumentChunk } from '../lib/types';
import type { EmbeddingResult, BatchEmbeddingResult } from '../lib/embeddingService';
import type {
  EmbeddingWorkerMessage,
  EmbeddingWorkerResponse
} from '../workers/embeddingWorker';

/**
 * Progress callback type
 */
export type WorkerProgressCallback = (stage: string, progress: number, details?: string) => void;

/**
 * Pending request interface
 */
interface PendingRequest {
  resolve: (value: EmbeddingWorkerResponse) => void;
  reject: (error: Error) => void;
  timeout?: NodeJS.Timeout;
}/**
 * Worker manager that handles communication with the embedding Web Worker
 */
export class EmbeddingWorkerManager {
  private worker: Worker | null = null;
  private isInitialized = false;
  private messageId = 0;
  private pendingRequests = new Map<number, PendingRequest>();
  private currentProgressCallback?: WorkerProgressCallback;

  /**
   * Initialize the Web Worker
   */
  async initialize(onProgress?: WorkerProgressCallback): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      // Create the Web Worker
      this.worker = new Worker(
        new URL('../workers/embeddingWorker.ts', import.meta.url),
        { type: 'module' }
      );

      // Set up message handling
      this.worker.onmessage = (event: MessageEvent<EmbeddingWorkerResponse>) => {
        this.handleWorkerMessage(event.data, onProgress);
      };

      this.worker.onerror = (error) => {
        console.error('Embedding worker error:', error);
        this.rejectAllPending(new Error('Worker error'));
      };

      // Initialize the worker
      onProgress?.('Starting AI model...', 0);
      const initResponse = await this.sendMessage({ type: 'INITIALIZE' });

      if (initResponse.type === 'INITIALIZED') {
        this.isInitialized = true;
        onProgress?.('AI model ready', 100, 'Embedding service initialized');
      } else if (initResponse.type === 'INITIALIZATION_ERROR') {
        throw new Error(initResponse.payload.error);
      }
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to initialize embedding worker: ${error}`);
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string, chunkId: string): Promise<EmbeddingResult> {
    if (!this.isInitialized || !this.worker) {
      throw new Error('Embedding worker not initialized');
    }

    const response = await this.sendMessage({
      type: 'GENERATE_SINGLE',
      payload: { text, chunkId }
    });

    if (response.type === 'SINGLE_RESULT') {
      return response.payload;
    } else if (response.type === 'SINGLE_ERROR') {
      throw new Error(response.payload.error);
    } else {
      throw new Error('Unexpected response type');
    }
  }

  /**
   * Generate embeddings for multiple chunks
   */
  async generateBatchEmbeddings(
    chunks: DocumentChunk[],
    onProgress?: WorkerProgressCallback
  ): Promise<BatchEmbeddingResult> {
    if (!this.isInitialized || !this.worker) {
      throw new Error('Embedding worker not initialized');
    }

    // Store progress callback for worker messages
    this.currentProgressCallback = onProgress;

    const response = await this.sendMessage({
      type: 'GENERATE_BATCH',
      payload: { chunks }
    });

    // Clear progress callback
    this.currentProgressCallback = undefined;

    if (response.type === 'BATCH_RESULT') {
      return response.payload;
    } else if (response.type === 'BATCH_ERROR') {
      throw new Error(response.payload.error);
    } else {
      throw new Error('Unexpected response type');
    }
  }

  /**
   * Get worker status
   */
  async getStatus() {
    if (!this.worker) {
      return { isReady: false, modelInfo: null };
    }

    const response = await this.sendMessage({ type: 'GET_STATUS' });

    if (response.type === 'STATUS') {
      return response.payload;
    } else {
      return { isReady: false, modelInfo: null };
    }
  }

  /**
   * Check if worker is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    this.cleanup();
  }

  /**
   * Send message to worker and return response
   */
  private sendMessage(
    message: EmbeddingWorkerMessage
  ): Promise<EmbeddingWorkerResponse> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      const messageId = ++this.messageId;
      const messageWithId = { ...message, id: messageId };

      // Store the promise resolvers
      const pendingRequest: PendingRequest = { resolve, reject };

      // Set timeout for long-running operations
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(messageId);
        reject(new Error('Worker request timed out'));
      }, 300000); // 5 minutes timeout

      // Store timeout in the pending request
      pendingRequest.timeout = timeout;
      this.pendingRequests.set(messageId, pendingRequest);

      // Send message to worker
      this.worker.postMessage(messageWithId);
    });
  }

  /**
   * Handle messages from worker
   */
  private handleWorkerMessage(
    response: EmbeddingWorkerResponse & { id?: number },
    initProgressCallback?: WorkerProgressCallback
  ): void {
    // Handle progress messages separately
    if (response.type === 'PROGRESS') {
      const progressCallback = this.currentProgressCallback || initProgressCallback;
      progressCallback?.(
        response.payload.stage,
        response.payload.progress,
        response.payload.details
      );
      return;
    }

    // Handle status messages without ID
    if (response.type === 'STATUS' && !('id' in response)) {
      // Initial status message, ignore
      return;
    }

    // Find matching request
    const responseWithId = response as EmbeddingWorkerResponse & { id?: number };
    const messageId = responseWithId.id;
    if (!messageId) {
      console.warn('Received worker response without message ID:', response);
      return;
    }

    const pendingRequest = this.pendingRequests.get(messageId);
    if (!pendingRequest) {
      console.warn('Received response for unknown message ID:', messageId);
      return;
    }

    // Clean up
    this.pendingRequests.delete(messageId);
    if (pendingRequest.timeout) {
      clearTimeout(pendingRequest.timeout);
    }

    // Resolve or reject
    if (response.type.includes('ERROR')) {
      const errorResponse = response as { payload: { error: string } };
      pendingRequest.reject(new Error(errorResponse.payload.error));
    } else {
      pendingRequest.resolve(response);
    }
  }

  /**
   * Reject all pending requests
   */
  private rejectAllPending(error: Error): void {
    for (const [, request] of this.pendingRequests) {
      request.reject(error);
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
    }
    this.pendingRequests.clear();
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.isInitialized = false;
    this.rejectAllPending(new Error('Worker terminated'));
  }
}

// Export singleton instance
export const embeddingWorkerManager = new EmbeddingWorkerManager();