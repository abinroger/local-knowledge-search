import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import type { DocumentMetadata, ProcessingResult } from './types';
import { SUPPORTED_FILE_TYPES } from './types';
import { generateId } from './utils';
import { chunkText } from './textChunker';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text content from PDF files using PDF.js
 */
async function extractFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text content from DOCX files using mammoth.js
 */
async function extractFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }

    return result.value.trim();
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text content from plain text files
 */
async function extractFromText(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    throw new Error(`Text file reading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text content from markdown files
 */
async function extractFromMarkdown(file: File): Promise<string> {
  try {
    const text = await file.text();
    // For now, return raw markdown. In future, could strip markdown syntax
    return text.trim();
  } catch (error) {
    throw new Error(`Markdown file reading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate file type and size
 */
function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const fileType = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES];
  if (!fileType) {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.type}. Supported types: PDF, DOCX, TXT, MD`
    };
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size: 50MB`
    };
  }

  return { isValid: true };
}

/**
 * Main text extraction function that handles all supported file types
 */
export async function extractTextFromFile(file: File): Promise<ProcessingResult> {
  const startTime = Date.now();

  // Validate file
  const validation = validateFile(file);
  if (!validation.isValid) {
    const metadata: DocumentMetadata = {
      id: generateId(),
      filename: file.name,
      fileSize: file.size,
      fileType: 'txt', // fallback
      uploadedAt: new Date(),
      lastIndexed: new Date(),
      chunkCount: 0,
      errorMessage: validation.error
    };

    return {
      success: false,
      metadata,
      chunks: [],
      error: validation.error
    };
  }

  const fileType = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES];

  try {
    let extractedText: string;

    // Extract text based on file type
    switch (fileType) {
      case 'pdf':
        extractedText = await extractFromPDF(file);
        break;
      case 'docx':
        extractedText = await extractFromDOCX(file);
        break;
      case 'txt':
        extractedText = await extractFromText(file);
        break;
      case 'md':
        extractedText = await extractFromMarkdown(file);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Validate extracted text
    if (!extractedText || extractedText.length < 10) {
      throw new Error('No readable text content found in file');
    }

    // Generate document chunks
    const documentId = generateId();
    const chunks = chunkText(extractedText, documentId);

    // Create metadata
    const metadata: DocumentMetadata = {
      id: documentId,
      filename: file.name,
      fileSize: file.size,
      fileType,
      uploadedAt: new Date(),
      lastIndexed: new Date(),
      chunkCount: chunks.length,
      extractedText
    };

    return {
      success: true,
      metadata,
      chunks
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown extraction error';

    const metadata: DocumentMetadata = {
      id: generateId(),
      filename: file.name,
      fileSize: file.size,
      fileType,
      uploadedAt: new Date(),
      lastIndexed: new Date(),
      chunkCount: 0,
      errorMessage
    };

    console.error('Text extraction failed:', {
      filename: file.name,
      fileType,
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return {
      success: false,
      metadata,
      chunks: [],
      error: errorMessage
    };
  }
}