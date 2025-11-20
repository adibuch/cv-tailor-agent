'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ProcessingSection() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Analyzing your CV', icon: '📄', color: 'indigo' },
    { label: 'Understanding job requirements', icon: '🔍', color: 'purple' },
    { label: 'Tailoring content with AI', icon: '✨', color: 'blue' },
    { label: 'Generating cover letter', icon: '📝', color: 'pink' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-indigo-950/20 to-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Floating glass card */}
        <div className="relative backdrop-blur-2xl bg-black/40 border border-white/20 rounded-3xl p-12 shadow-2xl shadow-purple-500/10">
          {/* Gradient glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-3xl opacity-20 blur-2xl -z-10" />

          {/* Pulsing brain */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
            }}
            className="text-9xl mb-8"
          >
            🧠
          </motion.div>

          {/* Main status */}
          <motion.h2
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
          >
            {steps[currentStep].label}
          </motion.h2>

          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-xl text-gray-400 mb-12"
          >
            Our AI is working its magic...
          </motion.p>

          {/* Step indicators - Linear.app style */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 ${
                    index < currentStep
                      ? 'bg-green-500/10 border-2 border-green-500/50'
                      : index === currentStep
                      ? 'bg-purple-500/10 border-2 border-purple-500/50 scale-105'
                      : 'bg-gray-800/30 border-2 border-gray-700/30'
                  }`}
                >
                  {/* Step icon/checkmark */}
                  <div
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${
                      index < currentStep
                        ? 'bg-green-500 scale-110'
                        : index === currentStep
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 scale-125'
                        : 'bg-gray-700'
                    }`}
                  >
                    {index < currentStep ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-white font-bold"
                      >
                        ✓
                      </motion.span>
                    ) : (
                      step.icon
                    )}

                    {/* Active pulse */}
                    {index === currentStep && (
                      <motion.div
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.7, 0, 0.7],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                        }}
                        className="absolute inset-0 rounded-full bg-purple-500"
                      />
                    )}
                  </div>

                  {/* Step label */}
                  <p
                    className={`text-left text-lg font-semibold transition-all duration-300 ${
                      index <= currentStep ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </p>

                  {/* Active spinner */}
                  {index === currentStep && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="ml-auto"
                    >
                      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden border border-gray-700/50">
            <motion.div
              initial={{ width: '0%' }}
              animate={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/50"
            />
          </div>

          {/* Percentage */}
          <motion.p
            key={`percent-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-2xl font-bold text-purple-400"
          >
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
