/**
 * ChromaDB Client for ephemeral RAG storage
 * Runs in-memory for Vercel serverless compatibility
 */

import { ChromaClient } from 'chromadb';
import type { CVDocument, QueryResult, ChromaClientConfig } from './types';

/**
 * Create and configure ChromaDB client (ephemeral/in-memory)
 *
 * 📚 LEARNING: Simplified approach without external embeddings
 * ChromaDB will use its default embedding function
 */
export async function createChromaClient(config: ChromaClientConfig) {
  const { sessionId, collectionName = `cv_session_${sessionId}` } = config;

  // Initialize client (ephemeral mode - no persistence needed)
  const client = new ChromaClient();

  // Get or create collection with default embeddings
  // 📚 LEARNING: Using ChromaDB's built-in embeddings
  // No need for external API calls!
  try {
    const collection = await client.getOrCreateCollection({
      name: collectionName,
      metadata: { sessionId, createdAt: new Date().toISOString() },
    });

    return { client, collection };
  } catch (error) {
    console.error('[ChromaDB] Error creating collection:', error);
    throw new Error('Failed to initialize ChromaDB collection');
  }
}

/**
 * Add CV documents to ChromaDB collection
 */
export async function addDocuments(
  collection: any,
  documents: CVDocument[]
) {
  try {
    const ids = documents.map((doc) => doc.id);
    const contents = documents.map((doc) => doc.content);
    const metadatas = documents.map((doc) => doc.metadata);

    await collection.add({
      ids,
      documents: contents,
      metadatas,
    });

    console.log(`[ChromaDB] Added ${documents.length} documents to collection`);
    return { success: true, count: documents.length };
  } catch (error) {
    console.error('[ChromaDB] Error adding documents:', error);
    throw new Error('Failed to add documents to ChromaDB');
  }
}

/**
 * Query ChromaDB collection for relevant CV sections
 */
export async function queryDocuments(
  collection: any,
  query: string,
  nResults: number = 5
): Promise<QueryResult[]> {
  try {
    const results = await collection.query({
      queryTexts: [query],
      nResults,
    });

    // Transform results to QueryResult format
    const documents: QueryResult[] = [];

    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        documents.push({
          document: results.documents[0][i],
          metadata: results.metadatas?.[0]?.[i] || {},
          distance: results.distances?.[0]?.[i] || 0,
        });
      }
    }

    console.log(`[ChromaDB] Query returned ${documents.length} results`);
    return documents;
  } catch (error) {
    console.error('[ChromaDB] Error querying documents:', error);
    throw new Error('Failed to query ChromaDB collection');
  }
}

/**
 * Delete a ChromaDB collection (cleanup)
 */
export async function deleteCollection(
  client: ChromaClient,
  collectionName: string
) {
  try {
    await client.deleteCollection({ name: collectionName });
    console.log(`[ChromaDB] Deleted collection: ${collectionName}`);
    return { success: true };
  } catch (error) {
    console.error('[ChromaDB] Error deleting collection:', error);
    // Don't throw - collection might not exist
    return { success: false, error };
  }
}

/**
 * Get collection stats
 */
export async function getCollectionStats(collection: any) {
  try {
    const count = await collection.count();
    return {
      documentCount: count,
      name: collection.name,
    };
  } catch (error) {
    console.error('[ChromaDB] Error getting collection stats:', error);
    return { documentCount: 0, name: collection.name };
  }
}
