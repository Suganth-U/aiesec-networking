'use client';

import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-zinc-50">
      {/* AIESEC Blue Blob */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-400/30 rounded-full blur-[80px] mix-blend-multiply"
      />

      {/* AIESEC Orange/Yellow Blob */}
      <motion.div
        animate={{
          x: [0, -80, 100, 0],
          y: [0, 120, -60, 0],
          scale: [1, 0.9, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-orange-400/30 rounded-full blur-[80px] mix-blend-multiply"
      />

      {/* AIESEC Green Blob */}
      <motion.div
        animate={{
          x: [0, 120, -100, 0],
          y: [0, -80, 100, 0],
          scale: [1, 1.4, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute bottom-[10%] left-[20%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-emerald-400/20 rounded-full blur-[80px] mix-blend-multiply"
      />

      {/* Purple/Pink Accent Blob */}
      <motion.div
        animate={{
          x: [0, -150, 50, 0],
          y: [0, 50, -120, 0],
          scale: [1, 1.1, 0.8, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-purple-400/20 rounded-full blur-[80px] mix-blend-multiply"
      />
      
      {/* Light noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
    </div>
  );
}
