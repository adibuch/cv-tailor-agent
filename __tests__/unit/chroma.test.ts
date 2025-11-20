/**
 * Unit tests for ChromaDB client
 */

import { describe, expect, test, beforeAll } from 'bun:test';
import {
  createChromaClient,
  addDocuments,
  queryDocuments,
  getCollectionStats,
} from '@/lib/chroma/client';
import { createCVDocuments, chunkText } from '@/lib/utils';

describe('ChromaDB Client', () => {
  const sessionId = 'test_session_123';
  let client: any;
  let collection: any;

  beforeAll(async () => {
    // Note: This test requires GROQ_API_KEY to be set
    // Skip if not available in test environment
    if (!process.env.GROQ_API_KEY) {
      console.log('Skipping ChromaDB tests - GROQ_API_KEY not set');
      return;
    }

    const setup = await createChromaClient({ sessionId });
    client = setup.client;
    collection = setup.collection;
  });

  test('should create ChromaDB collection', async () => {
    if (!process.env.GROQ_API_KEY) return;

    expect(collection).toBeDefined();
    expect(collection.name).toContain(sessionId);
  });

  test('should add documents to collection', async () => {
    if (!process.env.GROQ_API_KEY) return;

    const sampleCV = `
      John Doe
      Software Engineer

      EXPERIENCE:
      - Senior Developer at Tech Corp (2020-2023)
      - Built scalable microservices with Node.js
      - Led team of 5 engineers

      SKILLS:
      - JavaScript, TypeScript, React
      - Node.js, Python
      - AWS, Docker, Kubernetes
    `;

    const chunks = chunkText(sampleCV, 200, 50);
    const documents = createCVDocuments(chunks, sessionId);

    const result = await addDocuments(collection, documents);

    expect(result.success).toBe(true);
    expect(result.count).toBe(documents.length);
  });

  test('should query documents from collection', async () => {
    if (!process.env.GROQ_API_KEY) return;

    const query = 'What programming languages does the candidate know?';
    const results = await queryDocuments(collection, query, 3);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Check result structure
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('document');
      expect(results[0]).toHaveProperty('metadata');
      expect(results[0]).toHaveProperty('distance');
    }
  });

  test('should get collection stats', async () => {
    if (!process.env.GROQ_API_KEY) return;

    const stats = await getCollectionStats(collection);

    expect(stats).toBeDefined();
    expect(stats.documentCount).toBeGreaterThan(0);
    expect(stats.name).toContain(sessionId);
  });
});

describe('Utility Functions', () => {
  test('should chunk text correctly', () => {
    const text = 'A'.repeat(1000);
    const chunks = chunkText(text, 300, 50);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(300);
  });

  test('should create CV documents with metadata', () => {
    const chunks = ['Experience section', 'Skills section'];
    const sessionId = 'test123';
    const docs = createCVDocuments(chunks, sessionId);

    expect(docs.length).toBe(2);
    expect(docs[0].metadata.sessionId).toBe(sessionId);
    expect(docs[0].metadata.chunkIndex).toBe(0);
    expect(docs[0].metadata.totalChunks).toBe(2);
  });
});
