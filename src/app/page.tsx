'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Sparkles, Clock } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-transparent overflow-hidden relative">
      <motion.div
        className="max-w-md w-full relative z-10 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-xl mx-auto border border-zinc-800">
            <Logo />
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-3">
          AIESEC Network
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-base text-zinc-500 mb-10 leading-relaxed">
          Break the ice and build meaningful connections across all front offices.
        </motion.p>

        <motion.div variants={itemVariants} className="w-full bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 mb-8 text-left space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Find your match</h3>
              <p className="text-sm text-zinc-500 mt-1">You'll be assigned a color group. Find your target group to start networking.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Break the ice</h3>
              <p className="text-sm text-zinc-500 mt-1">Spin for random conversation starters to keep the discussion engaging.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Beat the clock</h3>
              <p className="text-sm text-zinc-500 mt-1">Rounds are short. Make connections, tap finished, and get ready to rotate!</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <Link href="/join" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-2xl h-14 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md group">
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
