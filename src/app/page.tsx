'use client';

import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AvatarCharacter } from '@/components/NationSymbols';

const characters = [
  { element: 'water', name: 'Katara', text: "Hi, I'm Katara. Find your match and flow like water." },
  { element: 'earth', name: 'Toph', text: "I'm Toph! Break the ice and stand your ground." },
  { element: 'fire', name: 'Zuko', text: "Zuko here. Spin the wheel to spark a conversation." },
  { element: 'air', name: 'Aang', text: "Hi, I'm Aang! Beat the clock and make new friends." }
] as const;

function Typewriter({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [text]);

  return <span className="font-game text-lg tracking-wide text-white/90">{displayedText}</span>;
}

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % characters.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const currentChar = characters[currentIndex];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <motion.div
        className="max-w-xl w-full relative z-10 flex flex-col items-center text-center mt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="relative mb-6">
          <motion.h1
            className="text-5xl sm:text-7xl font-game font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-widest drop-shadow-lg"
          >
            Network
          </motion.h1>
          <motion.h1
            className="text-5xl sm:text-7xl font-game font-bold text-white tracking-widest -mt-2 drop-shadow-lg"
          >
            & Bond
          </motion.h1>
          <p className="text-lg text-white/70 mt-4 font-game tracking-wider">
            The four nations must unite.
          </p>
        </motion.div>

        {/* Merged Instructions & Character Card */}
        <motion.div variants={itemVariants} className="w-full bg-black/30 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl p-6 sm:p-8 mb-8 flex flex-col gap-8">
          
          {/* Character Showcase with Tooltip */}
          <div className="w-full flex flex-col items-center justify-center min-h-[200px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChar.name}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="flex items-center justify-center gap-4 sm:gap-8 w-full"
              >
                {/* Character Avatar */}
                <div className="relative w-1/3 flex justify-end">
                  <AvatarCharacter element={currentChar.element} className="scale-[1.2] z-10" />
                </div>

                {/* Tooltip Dialog Box */}
                <div className="w-2/3 max-w-[280px] bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] rounded-2xl p-5 text-left relative z-20">
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-black/40 border-t border-l border-white/20 transform -rotate-45 backdrop-blur-xl -translate-y-1/2 clip-path-polygon" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                  <Typewriter text={currentChar.text} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* Instructions List */}
          <div className="text-left space-y-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-2xl drop-shadow-md">💧</div>
              <div>
                <h3 className="text-xl font-game tracking-widest text-white">Find your match</h3>
                <p className="text-sm font-game text-white/50 tracking-wider">Each nation seeks another.</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0 text-2xl drop-shadow-md">🔥</div>
              <div>
                <h3 className="text-xl font-game tracking-widest text-white">Break the ice</h3>
                <p className="text-sm font-game text-white/50 tracking-wider">Spin for conversation starters.</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 text-2xl drop-shadow-md">🌀</div>
              <div>
                <h3 className="text-xl font-game tracking-widest text-white">Beat the clock</h3>
                <p className="text-sm font-game text-white/50 tracking-wider">Short rounds, 4 nations met.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="w-full">
          <Link
            href="/join"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-game text-2xl tracking-widest rounded-2xl h-16 flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30 group"
          >
            START QUEST
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        <p className="text-sm font-game tracking-widest text-white/40 mt-6">Press Start · No Account Needed</p>
      </motion.div>
    </div>
  );
}
