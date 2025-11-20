/**
 * PDF Generator
 *
 * Utilities for generating PDF documents from CV and cover letter data
 */

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { CVModern } from './templates/cv-modern';
import { CoverLetter } from './templates/cover-letter';

export interface CVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    date: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    date: string;
  }>;
  skills: string[];
}

export interface CoverLetterData {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  date: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  jobTitle: string;
  paragraphs: string[];
}

/**
 * Parse AI-generated CV text into structured data
 */
export function parseCVText(text: string): Partial<CVData> {
  // Simple parser - in production, you'd use more sophisticated parsing
  const lines = text.split('\n').filter(line => line.trim());

  const data: Partial<CVData> = {
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: '(123) 456-7890',
    location: 'City, State',
    summary: '',
    experience: [],
    education: [],
    skills: [],
  };

  // Extract name (usually first line or after "NAME:")
  const nameLine = lines.find(l => l.includes('NAME:') || l.includes('Name:'));
  if (nameLine) {
    data.name = nameLine.replace(/NAME:|Name:/gi, '').trim();
  } else if (lines[0] && !lines[0].includes(':')) {
    data.name = lines[0].trim();
  }

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    data.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    data.phone = phoneMatch[0];
  }

  // Extract summary
  const summaryMatch = text.match(/SUMMARY:?\s*([\s\S]*?)(?=EXPERIENCE:|EDUCATION:|SKILLS:|$)/i);
  if (summaryMatch) {
    data.summary = summaryMatch[1].trim().split('\n')[0];
  }

  // Extract experience (simplified)
  const expMatch = text.match(/EXPERIENCE:?\s*([\s\S]*?)(?=EDUCATION:|SKILLS:|$)/i);
  if (expMatch) {
    const expText = expMatch[1];
    // This is simplified - you'd want more sophisticated parsing
    data.experience = [{
      title: 'Position Title',
      company: 'Company Name',
      date: '2020 - Present',
      description: expText.split('\n').filter(l => l.trim()).slice(0, 3),
    }];
  }

  // Extract skills
  const skillsMatch = text.match(/SKILLS:?\s*([\s\S]*?)$/i);
  if (skillsMatch) {
    data.skills = skillsMatch[1]
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s && s.length < 30)
      .slice(0, 15);
  }

  return data;
}

/**
 * Parse AI-generated cover letter into structured data
 */
export function parseCoverLetterText(
  text: string,
  senderName: string,
  senderEmail: string,
  companyName: string,
  jobTitle: string
): CoverLetterData {
  const paragraphs = text
    .split('\n\n')
    .filter(p => p.trim() && !p.toLowerCase().includes('dear') && !p.toLowerCase().includes('sincerely'))
    .map(p => p.trim())
    .slice(0, 4); // Usually 3-4 paragraphs

  return {
    senderName,
    senderEmail,
    senderPhone: '(123) 456-7890',
    senderAddress: 'Your Address',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    recipientName: 'Hiring Manager',
    recipientTitle: 'Talent Acquisition',
    companyName: companyName || 'Company',
    companyAddress: '',
    jobTitle,
    paragraphs,
  };
}

/**
 * Generate CV PDF as buffer
 */
export async function generateCVPDF(data: CVData): Promise<Buffer> {
  const doc = React.createElement(CVModern, { data }) as any;
  const buffer = await renderToBuffer(doc);
  return buffer as Buffer;
}

/**
 * Generate Cover Letter PDF as buffer
 */
export async function generateCoverLetterPDF(data: CoverLetterData): Promise<Buffer> {
  const doc = React.createElement(CoverLetter, { data }) as any;
  const buffer = await renderToBuffer(doc);
  return buffer as Buffer;
}

/**
 * Generate both PDFs from AI output
 */
export async function generateAllPDFs(
  cvText: string,
  coverLetterText: string,
  userData: {
    name: string;
    email: string;
    companyName?: string;
    jobTitle: string;
  }
) {
  const cvData = parseCVText(cvText);
  const coverLetterData = parseCoverLetterText(
    coverLetterText,
    userData.name,
    userData.email,
    userData.companyName || 'the company',
    userData.jobTitle
  );

  const [cvPDF, coverLetterPDF] = await Promise.all([
    generateCVPDF(cvData as CVData),
    generateCoverLetterPDF(coverLetterData),
  ]);

  return {
    cvPDF,
    coverLetterPDF,
  };
}
