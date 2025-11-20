'use client';

/**
 * CV Tailor Agent - Main Landing Page
 *
 * A stunning single-page application with:
 * - Hero section with gradient animations
 * - Glassmorphic upload form
 * - Animated processing steps
 * - Beautiful result cards
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/HeroSection';
import UploadSection from '@/components/UploadSection';
import ProcessingSection from '@/components/ProcessingSection';
import ResultsSection from '@/components/ResultsSection';

export default function Home() {
  const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [result, setResult] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  const handleGenerate = async (cvText: string, jobDescription: string, jobTitle: string, companyName?: string) => {
    setStep('processing');

    // Store user data for PDF generation
    setUserData({
      name: 'Your Name', // In production, extract from CV
      email: 'your.email@example.com',
      jobTitle,
      companyName,
    });

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvText,
          jobDescription,
          jobTitle,
          companyName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        setStep('results');
      } else {
        alert('Error: ' + data.error);
        setStep('upload');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate CV. Please try again.');
      setStep('upload');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Hero Section - Always visible at top */}
      <HeroSection />

      {/* Upload Section - Main form */}
      {step === 'upload' && (
        <UploadSection onGenerate={handleGenerate} />
      )}

      {/* Processing Section - Shows during API call */}
      {step === 'processing' && (
        <ProcessingSection />
      )}

      {/* Results Section - Shows tailored CV */}
      {step === 'results' && result && (
        <ResultsSection result={result} onReset={handleReset} userData={userData} />
      )}

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-gray-400 text-sm mb-4">
            Built by <span className="text-purple-400 font-semibold">Adi Buchris</span> •{' '}
            Powered by <span className="text-indigo-400 font-semibold">Mastra</span> +{' '}
            <span className="text-blue-400 font-semibold">Groq</span>
          </p>
          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
            <a
              href="https://github.com/yourusername/cv-tailor-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Open Source
            </a>
            <span className="text-gray-700">•</span>
            <p>Privacy-first AI 🔒</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
