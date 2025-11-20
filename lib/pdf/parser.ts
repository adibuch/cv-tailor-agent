/**
 * PDF Parser - Extract text content from PDF files
 */

import pdf from 'pdf-parse';
import { cleanPDFText } from '../utils';

export interface PDFParseResult {
  text: string;
  pages: number;
  info: {
    Title?: string;
    Author?: string;
    Creator?: string;
  };
}

/**
 * Extract text content from PDF buffer
 * @param buffer - PDF file as Buffer
 * @returns Parsed PDF content with metadata
 */
export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  try {
    const data = await pdf(buffer);

    return {
      text: cleanPDFText(data.text),
      pages: data.numpages,
      info: {
        Title: data.info?.Title,
        Author: data.info?.Author,
        Creator: data.info?.Creator,
      },
    };
  } catch (error) {
    console.error('[PDF Parser] Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file. Please ensure it\'s a valid PDF.');
  }
}

/**
 * Extract text from PDF file (accepts File object)
 * @param file - PDF File object from upload
 * @returns Parsed PDF content
 */
export async function parsePDFFile(file: File): Promise<PDFParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return await parsePDF(buffer);
  } catch (error) {
    console.error('[PDF Parser] Error parsing PDF file:', error);
    throw new Error('Failed to read PDF file');
  }
}

/**
 * Validate PDF file before parsing
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export function validatePDFFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'File must be a PDF',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  // Check file name
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return {
      valid: false,
      error: 'File must have .pdf extension',
    };
  }

  return { valid: true };
}
