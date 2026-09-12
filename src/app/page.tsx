'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { WaterSymbol, EarthSymbol, FireSymbol, AirSymbol, AvatarCharacter } from '@/components/NationSymbols';

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden relative">

      <motion.div
        className="max-w-lg w-full relative z-10 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Avatar State Glow */}
        <motion.div
          variants={itemVariants}
          className="relative mb-8"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.h1
            className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            style={{ backgroundSize: '200% 200%' }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Network
          </motion.h1>
          <motion.h1
            className="text-5xl sm:text-6xl font-black text-white/90 tracking-tight -mt-1"
          >
            & Bond
          </motion.h1>
          <p className="text-base text-white/50 mt-3">
            The four nations must unite. Find your match, break the ice.
          </p>
        </motion.div>

        {/* 4 Nation Symbols Ring */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
          <motion.div
            className="flex flex-col items-center gap-2"
            whileHover={{ scale: 1.15, y: -5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <WaterSymbol size={50} />
            <span className="text-xs font-bold text-blue-400">Water</span>
          </motion.div>
          <motion.div
            className="flex flex-col items-center gap-2"
            whileHover={{ scale: 1.15, y: -5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <EarthSymbol size={50} />
            <span className="text-xs font-bold text-emerald-400">Earth</span>
          </motion.div>
          <motion.div
            className="flex flex-col items-center gap-2"
            whileHover={{ scale: 1.15, y: -5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <FireSymbol size={50} />
            <span className="text-xs font-bold text-red-400">Fire</span>
          </motion.div>
          <motion.div
            className="flex flex-col items-center gap-2"
            whileHover={{ scale: 1.15, y: -5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <AirSymbol size={50} />
            <span className="text-xs font-bold text-orange-400">Air</span>
          </motion.div>
        </motion.div>

        {/* Animated Bender Characters */}
        <motion.div variants={itemVariants} className="flex items-end justify-center gap-2 mb-8">
          <AvatarCharacter element="water" className="scale-[0.4] -mb-8" />
          <AvatarCharacter element="earth" className="scale-[0.4] -mb-8" />
          <AvatarCharacter element="fire" className="scale-[0.4] -mb-8" />
          <AvatarCharacter element="air" className="scale-[0.4] -mb-8" />
        </motion.div>

        {/* Instructions Card */}
        <motion.div variants={itemVariants} className="w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-6 text-left space-y-5">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 text-lg">💧</div>
            <div>
              <h3 className="text-sm font-bold text-white">Find your match</h3>
              <p className="text-sm text-white/50 mt-0.5">Each nation seeks another. Walk up, introduce yourself.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 text-lg">🔥</div>
            <div>
              <h3 className="text-sm font-bold text-white">Break the ice</h3>
              <p className="text-sm text-white/50 mt-0.5">Spin for conversation starters. Ask, listen, connect.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 text-lg">🌀</div>
            <div>
              <h3 className="text-sm font-bold text-white">Beat the clock</h3>
              <p className="text-sm text-white/50 mt-0.5">Short rounds, fast rotations. 7 rounds, 7 nations met.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="w-full">
          <Link
            href="/join"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-2xl h-14 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-cyan-500/20 group text-base"
          >
            Enter the Arena
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <p className="text-xs text-white/30 mt-4">No account needed · Anonymous & instant</p>
      </motion.div>
    </div>
  );
}
