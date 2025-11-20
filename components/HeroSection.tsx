'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  const scrollToUpload = () => {
    const uploadSection = document.getElementById('upload-section');
    uploadSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const badges = [
    { icon: '⚡', text: 'AI-Powered' },
    { icon: '🔒', text: 'Privacy First' },
    { icon: '🎉', text: 'Free Forever' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: 'easeInOut',
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500 rounded-full blur-3xl"
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="block text-white mb-4 drop-shadow-2xl">Transform Your CV</span>
            <span className="relative inline-block pb-6">
              <span className="gradient-text drop-shadow-2xl">with AI Magic</span>
              {/* Animated gradient underline */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 origin-left rounded-full shadow-lg shadow-purple-500/50"
              />
            </span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed"
        >
          Get a perfectly tailored resume for any job in seconds.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg md:text-xl text-blue-300 mb-12 max-w-3xl mx-auto"
        >
          Powered by AI, optimized for success.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={scrollToUpload}
          className="group relative px-16 py-7 text-2xl font-bold text-white rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 hover:shadow-3xl transition-all duration-300 overflow-hidden mb-12"
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'linear',
              repeatDelay: 1,
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />

          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 blur-2xl -z-10" />

          <span className="relative flex items-center justify-center gap-4">
            <span className="text-4xl">✨</span>
            Start Tailoring Your CV
            <svg
              className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </motion.button>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {badges.map((badge, index) => (
            <motion.div
              key={badge.text}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group relative px-6 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full shadow-lg hover:shadow-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 blur-xl -z-10" />

              <div className="flex items-center gap-3">
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                  {badge.text}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-3 text-gray-400 cursor-pointer hover:text-purple-400 transition-colors"
            onClick={scrollToUpload}
          >
            <span className="text-sm font-medium">Scroll to begin</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
