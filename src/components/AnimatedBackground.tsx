'use client';

import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* Water - Blue Blob */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -80, 40, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[5%] left-[5%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] bg-blue-600/15 rounded-full blur-[100px]"
      />

      {/* Fire - Red Blob */}
      <motion.div
        animate={{
          x: [0, -60, 80, 0],
          y: [0, 100, -50, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[15%] right-[5%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] bg-red-600/15 rounded-full blur-[100px]"
      />

      {/* Earth - Green Blob */}
      <motion.div
        animate={{
          x: [0, 100, -80, 0],
          y: [0, -60, 80, 0],
          scale: [1, 1.4, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-[5%] left-[15%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] bg-emerald-600/12 rounded-full blur-[100px]"
      />

      {/* Air - Orange Blob */}
      <motion.div
        animate={{
          x: [0, -120, 40, 0],
          y: [0, 40, -100, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[20%] right-[15%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-orange-500/12 rounded-full blur-[100px]"
      />

      {/* Floating element particles */}
      {['💧', '🔥', '🪨', '🌀', '💧', '🔥', '🪨', '🌀', '✨', '⚡'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-lg opacity-20"
          style={{
            left: `${5 + (i * 9.5)}%`,
            top: `${10 + ((i * 17) % 80)}%`,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-15, 15, -15],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 5 + i * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.8,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Stars / sparkle dots */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}
