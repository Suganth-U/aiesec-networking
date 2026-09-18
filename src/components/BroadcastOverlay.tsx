'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone } from 'lucide-react';

export default function BroadcastOverlay({ activeBroadcast }: { activeBroadcast: string | null }) {
  return (
    <AnimatePresence>
      {activeBroadcast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-6 left-4 right-4 z-[100] pointer-events-none flex justify-center"
        >
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 p-[2px] rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.5)]">
            <div className="bg-slate-950/90 backdrop-blur-xl px-6 py-4 rounded-[14px] flex items-center gap-4 max-w-lg w-full border border-white/10">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-0.5">Admin Announcement</p>
                <p className="text-white font-medium text-sm sm:text-base leading-tight">
                  {activeBroadcast}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
