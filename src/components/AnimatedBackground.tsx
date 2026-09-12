'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  
  // Mouse tracking values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse movement
  const springConfig = { damping: 30, stiffness: 100, mass: 2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax layers (different depths)
  const layer1X = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const layer1Y = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);
  
  const layer2X = useTransform(smoothX, [-0.5, 0.5], [-40, 40]);
  const layer2Y = useTransform(smoothY, [-0.5, 0.5], [-40, 40]);
  
  const layer3X = useTransform(smoothX, [-0.5, 0.5], [-70, 70]);
  const layer3Y = useTransform(smoothY, [-0.5, 0.5], [-70, 70]);
  
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to [-0.5, 0.5]
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" style={{ perspective: '1000px' }}>
      
      {/* 3D Container that rotates with mouse */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* === LAYER 1: Deep Background Blobs === */}
        <motion.div className="absolute inset-0" style={{ x: layer1X, y: layer1Y, translateZ: -200 }}>
          {/* Water */}
          <motion.div
            animate={{ scale: [1, 1.2, 0.9, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[120px]"
          />
          {/* Fire */}
          <motion.div
            animate={{ scale: [1, 0.8, 1.3, 1], rotate: [0, -90, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] bg-red-600/20 rounded-full blur-[120px]"
          />
        </motion.div>

        {/* === LAYER 2: Mid-ground Elements === */}
        <motion.div className="absolute inset-0" style={{ x: layer2X, y: layer2Y, translateZ: 0 }}>
          {/* Earth */}
          <motion.div
            animate={{ scale: [1, 1.1, 0.9, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[15%] left-[20%] w-[45vw] h-[45vw] bg-emerald-600/15 rounded-full blur-[100px]"
          />
          {/* Air */}
          <motion.div
            animate={{ scale: [1, 0.9, 1.1, 1], rotate: [0, -45, 0] }}
            transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] bg-orange-500/15 rounded-full blur-[100px]"
          />
          
          {/* Mid-ground Stars */}
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={`star-mid-${i}`}
              className="absolute w-1 h-1 rounded-full bg-white/40 shadow-[0_0_8px_2px_rgba(255,255,255,0.4)]"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 5 }}
            />
          ))}
        </motion.div>

        {/* === LAYER 3: Foreground Interactive Elements === */}
        <motion.div className="absolute inset-0" style={{ x: layer3X, y: layer3Y, translateZ: 100 }}>
          {/* Floating element particles */}
          {['💧', '🔥', '🪨', '🌀', '💧', '🔥', '🪨', '🌀'].map((emoji, i) => (
            <motion.div
              key={`emoji-${i}`}
              className="absolute text-3xl opacity-40 drop-shadow-2xl"
              style={{ left: `${10 + (i * 11)}%`, top: `${15 + ((i * 23) % 70)}%` }}
              animate={{
                y: [-40, 40, -40],
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 6 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            >
              {emoji}
            </motion.div>
          ))}
          
          {/* Glowing Orbs representing the 4 elements */}
          <motion.div className="absolute top-[20%] left-[25%] w-12 h-12 rounded-full bg-blue-400 shadow-[0_0_40px_10px_rgba(59,130,246,0.6)]" 
            animate={{ y: [-20, 20, -20], scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
          
          <motion.div className="absolute top-[30%] right-[25%] w-10 h-10 rounded-full bg-red-500 shadow-[0_0_40px_10px_rgba(239,68,68,0.6)]" 
            animate={{ y: [20, -20, 20], scale: [1, 1.3, 1] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
            
          <motion.div className="absolute bottom-[30%] left-[30%] w-14 h-14 rounded-full bg-emerald-400 shadow-[0_0_40px_10px_rgba(52,211,153,0.6)]" 
            animate={{ y: [-15, 15, -15], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
            
          <motion.div className="absolute bottom-[25%] right-[30%] w-12 h-12 rounded-full bg-orange-400 shadow-[0_0_40px_10px_rgba(251,146,60,0.6)]" 
            animate={{ y: [15, -15, 15], scale: [1, 1.2, 1] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
        </motion.div>
      </motion.div>
      
      {/* Light noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-screen pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
    </div>
  );
}
