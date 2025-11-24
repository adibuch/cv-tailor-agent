/**
 * Simple PDF Generator
 * Fixes the React Error #31 issue by using pdf() instead of renderToBuffer()
 */

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import CVModern from './templates/cv-modern';
import CoverLetter from './templates/cover-letter';

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
export function parseCVText(text: string): CVData {
  const lines = text.split('\n').filter(line => line.trim());

  const data: CVData = {
    name: 'Your Name',
    email: 'your.email@example.com',
    phone: '(123) 456-7890',
    location: 'City, State',
    summary: 'Professional summary',
    experience: [],
    education: [],
    skills: [],
  };

  // Extract name
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
    data.summary = summaryMatch[1].trim().split('\n').filter(l => l.trim()).join(' ') || 'Professional summary';
  }

  // Extract experience
  const expMatch = text.match(/EXPERIENCE:?\s*([\s\S]*?)(?=EDUCATION:|SKILLS:|$)/i);
  if (expMatch) {
    const expText = expMatch[1];
    const bullets = expText.split('\n').filter(l => l.trim()).slice(0, 5);
    data.experience = [{
      title: 'Position Title',
      company: 'Company Name',
      date: '2020 - Present',
      description: bullets.length > 0 ? bullets : ['Professional experience'],
    }];
  }

  // Extract skills
  const skillsMatch = text.match(/SKILLS:?\s*([\s\S]*?)$/i);
  if (skillsMatch) {
    data.skills = skillsMatch[1]
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s && s.length < 30 && s.length > 1)
      .slice(0, 15);
  }

  // Ensure we have at least some skills
  if (data.skills.length === 0) {
    data.skills = ['JavaScript', 'TypeScript', 'React'];
  }

  // Ensure we have education
  if (data.education.length === 0) {
    data.education = [{
      degree: 'Degree',
      school: 'University',
      date: '2015 - 2019',
    }];
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
    .slice(0, 4);

  // Ensure we have at least one paragraph
  if (paragraphs.length === 0) {
    paragraphs.push('Thank you for considering my application.');
  }

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
 * Generate CV PDF as Buffer using pdf() API
 */
export async function generateCVPDF(data: CVData): Promise<Buffer> {
  const doc = <CVModern data={data} />;
  const pdfDoc = pdf(doc);
  const blob = await pdfDoc.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate Cover Letter PDF as Buffer using pdf() API
 */
export async function generateCoverLetterPDF(data: CoverLetterData): Promise<Buffer> {
  const doc = <CoverLetter data={data} />;
  const pdfDoc = pdf(doc);
  const blob = await pdfDoc.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
