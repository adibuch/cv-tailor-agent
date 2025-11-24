/**
 * PDF Generation API Route
 *
 * Generates PDF documents from CV and cover letter text
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCVPDF, generateCoverLetterPDF, parseCVText, parseCoverLetterText } from '@/lib/pdf/simple-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, cvText, coverLetterText, userData } = body;

    if (!type || !userData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type === 'cv') {
      if (!cvText) {
        return NextResponse.json(
          { success: false, error: 'CV text is required' },
          { status: 400 }
        );
      }

      const cvData = parseCVText(cvText);
      const pdfBuffer = await generateCVPDF(cvData as any);

      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="tailored-cv-${Date.now()}.pdf"`,
        },
      });
    }

    if (type === 'cover-letter') {
      if (!coverLetterText) {
        return NextResponse.json(
          { success: false, error: 'Cover letter text is required' },
          { status: 400 }
        );
      }

      const coverLetterData = parseCoverLetterText(
        coverLetterText,
        userData.name,
        userData.email,
        userData.companyName || 'the company',
        userData.jobTitle
      );
      const pdfBuffer = await generateCoverLetterPDF(coverLetterData);

      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="cover-letter-${Date.now()}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type. Must be "cv" or "cover-letter"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API /generate-pdf] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      },
      { status: 500 }
    );
  }
}
