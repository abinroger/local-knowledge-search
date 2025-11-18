/**
 * Document processing stage constants
 */
export const PROCESSING_STAGES = {
  READING: 'Reading file...',
  EXTRACTING: 'Extracting text...',
  CHUNKING: 'Creating chunks...',
  EMBEDDING: 'Generating embeddings...',
  STORING: 'Storing data...',
  STARTING: 'Starting...',
} as const;

export type ProcessingStage = typeof PROCESSING_STAGES[keyof typeof PROCESSING_STAGES];
