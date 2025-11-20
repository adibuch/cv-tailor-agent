'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface UploadSectionProps {
  onGenerate: (cvText: string, jobDescription: string, jobTitle: string, companyName?: string) => void;
}

export default function UploadSection({ onGenerate }: UploadSectionProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await handleFile(file);
    } else {
      alert('Please upload a PDF file');
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    setCvFile(file);
    setIsExtracting(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse PDF');
      }

      const result = await response.json();
      setCvText(result.text);
      setUploadProgress(100);
      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      alert('Failed to parse PDF. Please try another file.');
      setCvFile(null);
      setUploadProgress(0);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = () => {
    if (!cvText || !jobDescription || !jobTitle) {
      alert('Please fill in all required fields');
      return;
    }

    onGenerate(cvText, jobDescription, jobTitle, companyName);
  };

  const isValid = cvText && jobDescription && jobTitle;

  return (
    <section id="upload-section" className="py-20 px-4 bg-gradient-to-b from-slate-950 to-indigo-950/20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-5xl mx-auto"
      >
        {/* Floating glass card */}
        <div className="relative backdrop-blur-2xl bg-black/40 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl shadow-purple-500/10">
          {/* Gradient glow behind card */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl opacity-20 blur-2xl -z-10" />

          {/* Upload CV */}
          <div className="mb-8">
            <label className="block text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              📄 Upload Your CV
            </label>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10 scale-[1.02] shadow-lg shadow-purple-500/50'
                  : cvFile
                  ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/30'
                  : 'border-gray-600/50 hover:border-purple-500/70 hover:bg-purple-500/5'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {/* Gradient border effect */}
              {!cvFile && !isDragging && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              )}

              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />

              {!cvFile ? (
                <div className="space-y-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-7xl"
                  >
                    📤
                  </motion.div>
                  <p className="text-xl text-gray-200 font-semibold">
                    Drag & drop your CV here or click to browse
                  </p>
                  <p className="text-sm text-gray-400">PDF only, max 10MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-7xl"
                  >
                    ✓
                  </motion.div>
                  <p className="text-xl text-green-300 font-bold">
                    {cvFile.name}
                  </p>
                  {uploadProgress < 100 && (
                    <div className="max-w-md mx-auto">
                      <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden border border-gray-600">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/50"
                        />
                      </div>
                      <p className="text-sm text-gray-300 mt-3 font-semibold">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Job Title */}
          <div className="mb-8">
            <label className="block text-xl font-bold mb-4 text-gray-200">
              💼 Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Engineer"
              className="w-full px-6 py-5 bg-slate-900/80 border-2 border-purple-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 outline-none hover:border-purple-500/50 shadow-lg"
            />
          </div>

          {/* Company Name */}
          <div className="mb-8">
            <label className="block text-xl font-bold mb-4 text-gray-200">
              🏢 Company Name <span className="text-sm text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google"
              className="w-full px-6 py-5 bg-slate-900/80 border-2 border-purple-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 outline-none hover:border-purple-500/50 shadow-lg"
            />
          </div>

          {/* Job Description */}
          <div className="mb-8">
            <label className="block text-xl font-bold mb-4 text-gray-200">
              📋 Job Description or URL <span className="text-red-400">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting or LinkedIn URL here..."
              rows={12}
              className="w-full px-6 py-5 bg-slate-900/80 border-2 border-purple-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 outline-none resize-none hover:border-purple-500/50 shadow-lg"
            />
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            onClick={handleGenerate}
            disabled={!isValid || isExtracting}
            className={`relative w-full py-7 text-2xl font-bold rounded-2xl transition-all duration-300 overflow-hidden ${
              isValid && !isExtracting
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 cursor-pointer'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border-2 border-gray-600/50'
            }`}
          >
            {isValid && !isExtracting && (
              <>
                {/* Shimmer effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'linear',
                    repeatDelay: 1,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                />
                {/* Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 blur-2xl -z-10" />
              </>
            )}

            <span className="relative flex items-center justify-center gap-3">
              <span className="text-3xl">🚀</span>
              Generate Tailored CV
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </motion.button>

          <p className="text-center text-gray-400 text-sm mt-6">
            Your data is processed securely and never stored. 🔒
          </p>
        </div>
      </motion.div>
    </section>
  );
}
