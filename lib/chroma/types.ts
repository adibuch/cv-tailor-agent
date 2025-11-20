/**
 * Types for ChromaDB integration
 */

export interface CVDocument {
  id: string;
  content: string;
  metadata: {
    section: string; // e.g., "experience", "education", "skills"
    chunkIndex: number;
    totalChunks: number;
    sessionId: string;
  };
}

export interface QueryResult {
  document: string;
  metadata: CVDocument['metadata'];
  distance: number;
}

export interface EmbeddingFunction {
  generate(texts: string[]): Promise<number[][]>;
}

export interface ChromaClientConfig {
  sessionId: string;
  collectionName?: string;
}
