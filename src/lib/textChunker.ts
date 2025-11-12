import type { DocumentChunk } from './types';
import { CHUNKING_CONFIG } from './types';
import { generateId } from './utils';

/**
 * Split text into words while preserving positions
 */
function splitIntoWords(text: string): Array<{ word: string; position: number }> {
  const words: Array<{ word: string; position: number }> = [];
  const wordRegex = /\b\w+\b/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(text)) !== null) {
    words.push({
      word: match[0],
      position: match.index
    });
  }

  return words;
}

/**
 * Find the actual character position in original text for a word index
 */
function getCharacterPosition(words: Array<{ word: string; position: number }>, wordIndex: number): number {
  if (wordIndex >= words.length) {
    return words[words.length - 1].position + words[words.length - 1].word.length;
  }
  return words[wordIndex].position;
}

/**
 * Extract text between two character positions
 */
function extractTextBetweenPositions(text: string, startPos: number, endPos: number): string {
  return text.substring(startPos, endPos).trim();
}

/**
 * Chunk text into overlapping segments following the 500-word + 50-word overlap strategy
 */
export function chunkText(text: string, documentId: string): DocumentChunk[] {
  const { maxWordsPerChunk, overlapWords, minChunkWords } = CHUNKING_CONFIG;

  // Split text into words with positions
  const words = splitIntoWords(text);

  // If text is too short, create a single chunk
  if (words.length <= minChunkWords) {
    return [{
      id: generateId(),
      documentId,
      chunkIndex: 0,
      text: text.trim(),
      wordCount: words.length,
      startPosition: 0,
      endPosition: text.length
    }];
  }

  const chunks: DocumentChunk[] = [];
  let currentWordIndex = 0;
  let chunkIndex = 0;

  while (currentWordIndex < words.length) {
    // Determine end word index for this chunk
    const endWordIndex = Math.min(currentWordIndex + maxWordsPerChunk, words.length);

    // Get character positions for this chunk
    const startPosition = getCharacterPosition(words, currentWordIndex);
    const endPosition = getCharacterPosition(words, endWordIndex);

    // Extract chunk text
    const chunkText = extractTextBetweenPositions(text, startPosition, endPosition);
    const actualWordCount = endWordIndex - currentWordIndex;

    // Create chunk
    chunks.push({
      id: generateId(),
      documentId,
      chunkIndex,
      text: chunkText,
      wordCount: actualWordCount,
      startPosition,
      endPosition
    });

    // Move to next chunk with overlap
    // If this is the last chunk, break
    if (endWordIndex >= words.length) {
      break;
    }

    // Move forward by (maxWordsPerChunk - overlapWords) words
    currentWordIndex += Math.max(maxWordsPerChunk - overlapWords, 1);
    chunkIndex++;
  }

  return chunks;
}

/**
 * Validate chunk quality and consistency
 */
export function validateChunks(chunks: DocumentChunk[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for empty chunks
  const emptyChunks = chunks.filter(chunk => !chunk.text.trim());
  if (emptyChunks.length > 0) {
    errors.push(`Found ${emptyChunks.length} empty chunks`);
  }

  // Check for extremely small chunks (except the last one)
  const tinyChunks = chunks
    .slice(0, -1) // Exclude last chunk
    .filter(chunk => chunk.wordCount < CHUNKING_CONFIG.minChunkWords);
  if (tinyChunks.length > 0) {
    errors.push(`Found ${tinyChunks.length} chunks smaller than ${CHUNKING_CONFIG.minChunkWords} words`);
  }

  // Check chunk index sequence
  chunks.forEach((chunk, index) => {
    if (chunk.chunkIndex !== index) {
      errors.push(`Chunk index mismatch at position ${index}: expected ${index}, got ${chunk.chunkIndex}`);
    }
  });

  // Check position consistency
  for (let i = 0; i < chunks.length - 1; i++) {
    const current = chunks[i];
    const next = chunks[i + 1];

    if (current.endPosition > next.startPosition) {
      // This is expected for overlapping chunks, but validate overlap size
      const overlapSize = current.endPosition - next.startPosition;
      if (overlapSize > current.text.length * 0.5) {
        errors.push(`Excessive overlap between chunks ${i} and ${i + 1}: ${overlapSize} characters`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}