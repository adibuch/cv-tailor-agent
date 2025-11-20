/**
 * PDF Parsing API Route
 *
 * Handles PDF file upload and text extraction on the server side.
 * This runs in Node.js environment where pdf-parse can access fs module.
 */

import { NextRequest, NextResponse } from 'next/server';
import { parsePDF } from '@/lib/pdf/parser';

export async function POST(request: NextRequest) {
  try {
    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    const result = await parsePDF(buffer);

    return NextResponse.json({
      success: true,
      text: result.text,
      pages: result.pages,
    });

  } catch (error) {
    console.error('[API /parse-pdf] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse PDF',
      },
      { status: 500 }
    );
  }
}
