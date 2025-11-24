'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { parseLLMResponse } from '@/lib/utils';

interface ResultsSectionProps {
  result: {
    content: string;
    tokensUsed: number;
    model: string;
  };
  onReset: () => void;
  userData?: {
    name: string;
    email: string;
    jobTitle: string;
    companyName?: string;
  };
}

export default function ResultsSection({ result, onReset, userData }: ResultsSectionProps) {
  const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Parse the LLM response to separate CV and Cover Letter
  const { cv, coverLetter } = parseLLMResponse(result.content);

  const handleDownloadPDF = async (type: 'cv' | 'cover-letter') => {
    setIsGeneratingPDF(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          cvText: cv,
          coverLetterText: coverLetter,
          userData: userData || {
            name: 'Your Name',
            email: 'your.email@example.com',
            jobTitle: 'Position',
            companyName: 'Company',
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'cv' ? `tailored-cv-${Date.now()}.pdf` : `cover-letter-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF. Please try again. ${error instanceof Error ? error.message : ''}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadText = (type: 'cv' | 'letter') => {
    const content = type === 'cv' ? cv : coverLetter;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'cv' ? 'tailored-cv.txt' : 'cover-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-950 to-indigo-950/20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        {/* Success celebration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-12"
        >
          <div className="text-9xl mb-6">🎉</div>
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Your CV is Ready!
          </h2>
          <p className="text-xl text-gray-400">
            Generated in seconds • {result.tokensUsed} tokens • Powered by {result.model}
          </p>
        </motion.div>

        {/* Side-by-side download cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* CV Download Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative backdrop-blur-2xl bg-black/40 border-2 border-purple-500/30 hover:border-purple-500/70 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/30 transition-all duration-300"
          >
            {/* Gradient glow on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl -z-10 transition-opacity duration-300" />

            {/* PDF Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50"
              >
                <span className="text-5xl">📄</span>
              </motion.div>
            </div>

            <h3 className="text-3xl font-bold mb-3 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Tailored CV
            </h3>

            <p className="text-gray-400 text-center mb-6">
              Your resume optimized for this specific job
            </p>

            {/* Download buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleDownloadPDF('cv')}
                disabled={isGeneratingPDF}
                className="w-full relative px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-xl text-white font-bold text-center hover:shadow-lg hover:shadow-purple-500/50 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Shimmer */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <span className="relative flex items-center justify-center gap-2">
                  {isGeneratingPDF ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </span>
              </button>

              <button
                onClick={() => handleDownloadText('cv')}
                className="w-full px-6 py-3 bg-white/5 border-2 border-purple-500/30 rounded-xl text-gray-300 font-semibold text-center hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
              >
                <span className="flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download TXT
                </span>
              </button>
            </div>
          </motion.div>

          {/* Cover Letter Download Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative backdrop-blur-2xl bg-black/40 border-2 border-blue-500/30 hover:border-blue-500/70 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
          >
            {/* Gradient glow on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl -z-10 transition-opacity duration-300" />

            {/* Email Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50"
              >
                <span className="text-5xl">✉️</span>
              </motion.div>
            </div>

            <h3 className="text-3xl font-bold mb-3 text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Cover Letter
            </h3>

            <p className="text-gray-400 text-center mb-6">
              Personalized letter highlighting your fit
            </p>

            {/* Download buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleDownloadPDF('cover-letter')}
                disabled={isGeneratingPDF}
                className="w-full relative px-6 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl text-white font-bold text-center hover:shadow-lg hover:shadow-blue-500/50 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Shimmer */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <span className="relative flex items-center justify-center gap-2">
                  {isGeneratingPDF ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </span>
              </button>

              <button
                onClick={() => handleDownloadText('letter')}
                className="w-full px-6 py-3 bg-white/5 border-2 border-blue-500/30 rounded-xl text-gray-300 font-semibold text-center hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
              >
                <span className="flex items-center justify-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download TXT
                </span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Preview section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative backdrop-blur-2xl bg-black/40 border border-white/20 rounded-3xl p-8 shadow-2xl shadow-purple-500/10 mb-8"
        >
          {/* Gradient glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl opacity-20 blur-2xl -z-10" />

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Preview</h3>

            {/* Tab switcher */}
            <div className="flex gap-2 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
              <button
                onClick={() => setActiveTab('cv')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'cv'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📄 CV
              </button>
              <button
                onClick={() => setActiveTab('letter')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === 'letter'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ✉️ Letter
              </button>
            </div>
          </div>

          {/* Content preview */}
          <div className="bg-slate-900/80 rounded-2xl p-6 max-h-96 overflow-y-auto border border-gray-700/50">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {activeTab === 'cv' ? cv : coverLetter}
            </pre>
          </div>
        </motion.div>

        {/* Start over button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="w-full max-w-md mx-auto block px-8 py-5 bg-white/5 border-2 border-gray-700/50 rounded-2xl text-white font-bold hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-3 text-lg">
            🔄 Create Another CV
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
}
