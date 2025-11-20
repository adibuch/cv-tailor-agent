/**
 * Unit tests for PDF Parser
 */

import { describe, expect, test } from 'bun:test';
import { validatePDFFile } from '@/lib/pdf/parser';
import { cleanPDFText, formatFileSize } from '@/lib/utils';

describe('PDF Parser', () => {
  test('should validate PDF file correctly', () => {
    const validFile = new File(['test'], 'resume.pdf', {
      type: 'application/pdf',
    });
    const validation = validatePDFFile(validFile);
    expect(validation.valid).toBe(true);
    expect(validation.error).toBeUndefined();
  });

  test('should reject non-PDF files', () => {
    const invalidFile = new File(['test'], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const validation = validatePDFFile(invalidFile);
    expect(validation.valid).toBe(false);
    expect(validation.error).toBeDefined();
  });

  test('should reject files without .pdf extension', () => {
    const invalidFile = new File(['test'], 'resume.txt', {
      type: 'application/pdf',
    });
    const validation = validatePDFFile(invalidFile);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('extension');
  });

  test('should clean PDF text correctly', () => {
    const dirtyText = '   Multiple    spaces   \n\n\nExtra\nlines\n\n   ';
    const cleaned = cleanPDFText(dirtyText);

    expect(cleaned).not.toContain('    '); // No multiple spaces
    expect(cleaned.trim()).toBe(cleaned); // Trimmed
  });

  test('should format file size correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(1536 * 1024)).toBe('1.5 MB');
  });
});
