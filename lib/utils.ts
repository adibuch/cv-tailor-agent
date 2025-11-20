/**
 * Utility functions for CV Tailor Agent
 */

import { nanoid } from 'nanoid';
import type { CVDocument } from './chroma/types';

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${nanoid(12)}`;
}

/**
 * Chunk text into smaller pieces for better RAG performance
 * @param text - The text to chunk
 * @param chunkSize - Maximum characters per chunk
 * @param overlap - Number of characters to overlap between chunks
 */
export function chunkText(
  text: string,
  chunkSize: number = 800,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
}

/**
 * Detect section type from text content
 */
export function detectSection(text: string): string {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('experience') || lowerText.includes('work history')) {
    return 'experience';
  }
  if (lowerText.includes('education') || lowerText.includes('degree')) {
    return 'education';
  }
  if (lowerText.includes('skills') || lowerText.includes('technologies')) {
    return 'skills';
  }
  if (lowerText.includes('certification') || lowerText.includes('certificate')) {
    return 'certifications';
  }
  if (lowerText.includes('project')) {
    return 'projects';
  }

  return 'general';
}

/**
 * Convert text chunks to CV documents for ChromaDB
 */
export function createCVDocuments(
  chunks: string[],
  sessionId: string
): CVDocument[] {
  return chunks.map((chunk, index) => ({
    id: `doc_${nanoid(10)}`,
    content: chunk,
    metadata: {
      section: detectSection(chunk),
      chunkIndex: index,
      totalChunks: chunks.length,
      sessionId,
    },
  }));
}

/**
 * Clean and normalize text extracted from PDF
 */
export function cleanPDFText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[\r\n]+/g, '\n') // Normalize line breaks
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .trim();
}

/**
 * Validate file type
 */
export function isValidPDFFile(file: File): boolean {
  return file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024; // 10MB limit
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
