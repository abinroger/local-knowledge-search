import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockKnowledgeSearchService, createDemoData } from '../mockServices';

describe('MockKnowledgeSearchService', () => {
  beforeEach(async () => {
    // Reset service state before each test by clearing internal storage
    mockKnowledgeSearchService.clearData();
    await mockKnowledgeSearchService.initialize();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const result = await mockKnowledgeSearchService.initialize();
      expect(result).toBeUndefined(); // Should not throw
    });
  });

  describe('document processing', () => {
    it('should process a document successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const progressCallback = vi.fn();

      const result = await mockKnowledgeSearchService.processDocument(mockFile, progressCallback);

      expect(result.success).toBe(true);
      expect(result.documentId).toBeDefined();
      expect(progressCallback).toHaveBeenCalledWith('Reading file...', 20);
      expect(progressCallback).toHaveBeenCalledWith('Storing data...', 100);
    });

    it('should call progress callback with correct stages', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const progressCallback = vi.fn();

      await mockKnowledgeSearchService.processDocument(mockFile, progressCallback);

      const expectedStages = [
        'Reading file...',
        'Extracting text...',
        'Creating chunks...',
        'Generating embeddings...',
        'Storing data...'
      ];

      expectedStages.forEach(stage => {
        expect(progressCallback).toHaveBeenCalledWith(stage, expect.any(Number));
      });
    });

    it('should handle different file types', async () => {
      const testFiles = [
        { name: 'test.pdf', type: 'application/pdf', expectedType: 'pdf' },
        { name: 'test.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', expectedType: 'docx' },
        { name: 'test.md', type: 'text/markdown', expectedType: 'md' },
        { name: 'test.txt', type: 'text/plain', expectedType: 'txt' }
      ];

      // Process all files
      for (const fileInfo of testFiles) {
        const mockFile = new File(['test content'], fileInfo.name, { type: fileInfo.type });
        const result = await mockKnowledgeSearchService.processDocument(mockFile);

        expect(result.success).toBe(true);
        expect(result.documentId).toBeDefined();
      }

      // Check all files were processed with correct types
      const docs = await mockKnowledgeSearchService.getDocuments();
      expect(docs).toHaveLength(testFiles.length);

      for (const fileInfo of testFiles) {
        const processedDoc = docs.find(doc => doc.filename === fileInfo.name);
        expect(processedDoc).toBeDefined();
        expect(processedDoc?.fileType).toBe(fileInfo.expectedType);
      }
    });
  });

  describe('document retrieval', () => {
    it('should return empty list initially', async () => {
      const docs = await mockKnowledgeSearchService.getDocuments();
      expect(docs).toEqual([]);
    });

    it('should return processed documents', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      await mockKnowledgeSearchService.processDocument(mockFile);

      const docs = await mockKnowledgeSearchService.getDocuments();

      expect(docs).toHaveLength(1);
      expect(docs[0]).toMatchObject({
        documentId: expect.any(String),
        filename: 'test.txt',
        fileType: 'txt',
        chunkCount: 3,
        createdAt: expect.any(String)
      });
    });
  });

  describe('search functionality', () => {
    it('should return empty results for empty query', async () => {
      const results = await mockKnowledgeSearchService.search('');
      expect(results).toEqual([]);
    });

    it('should return empty results for whitespace query', async () => {
      const results = await mockKnowledgeSearchService.search('   ');
      expect(results).toEqual([]);
    });

    it('should find relevant documents', async () => {
      // Add test document for this specific test
      const mockFile = new File(['This is a sample document about machine learning'], 'ml-doc.txt', { type: 'text/plain' });
      await mockKnowledgeSearchService.processDocument(mockFile);

      const results = await mockKnowledgeSearchService.search('sample');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toMatchObject({
        chunkId: expect.any(String),
        documentId: expect.any(String),
        documentFilename: 'ml-doc.txt',
        text: expect.stringContaining('sample'),
        score: expect.any(Number),
        chunkIndex: expect.any(Number),
        metadata: {
          documentFilename: 'ml-doc.txt',
          documentType: 'txt',
          wordCount: expect.any(Number),
          startPosition: expect.any(Number),
          endPosition: expect.any(Number),
          createdAt: expect.any(String)
        },
        relevanceReason: expect.stringContaining('sample'),
        snippet: expect.any(String)
      });
    });

    it('should return results sorted by score', async () => {
      // Add test documents for this test
      const mockFile1 = new File(['This is a sample document about machine learning'], 'ml-doc.txt', { type: 'text/plain' });
      await mockKnowledgeSearchService.processDocument(mockFile1);

      const mockFile2 = new File(['This document mentions learning'], 'learning-doc.txt', { type: 'text/plain' });
      await mockKnowledgeSearchService.processDocument(mockFile2);

      const results = await mockKnowledgeSearchService.search('learning');

      expect(results.length).toBeGreaterThan(0);

      // Verify results are sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should respect search options limit', async () => {
      // Add test document for this specific test
      const mockFile = new File(['This is a sample document about machine learning'], 'ml-doc.txt', { type: 'text/plain' });
      await mockKnowledgeSearchService.processDocument(mockFile);

      const results = await mockKnowledgeSearchService.search('sample', { limit: 1 });
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should handle case insensitive search', async () => {
      // Add test document for this specific test
      const mockFile = new File(['This is a sample document about machine learning'], 'ml-doc.txt', { type: 'text/plain' });
      await mockKnowledgeSearchService.processDocument(mockFile);

      const results = await mockKnowledgeSearchService.search('SAMPLE');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('document deletion', () => {
    it('should delete a document successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const result = await mockKnowledgeSearchService.processDocument(mockFile);

      // Verify document exists
      let docs = await mockKnowledgeSearchService.getDocuments();
      expect(docs).toHaveLength(1);

      // Delete document
      await mockKnowledgeSearchService.deleteDocument(result.documentId!);

      // Verify document is deleted
      docs = await mockKnowledgeSearchService.getDocuments();
      expect(docs).toHaveLength(0);
    });

    it('should handle deletion of non-existent document', async () => {
      // Should not throw error
      await expect(mockKnowledgeSearchService.deleteDocument('non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('demo data creation', () => {
    it('should create demo data successfully', async () => {
      await createDemoData();

      const docs = await mockKnowledgeSearchService.getDocuments();
      expect(docs.length).toBeGreaterThan(0);

      // Verify we can search demo data
      const results = await mockKnowledgeSearchService.search('machine learning');
      expect(results.length).toBeGreaterThan(0);
    });
  });
});