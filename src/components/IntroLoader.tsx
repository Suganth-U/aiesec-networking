'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroLoader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show full loading sequence if not played this session
    const hasPlayed = sessionStorage.getItem('introLoaded');
    
    // Determine which video to preload
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const videoUrl = isMobile ? '/portraitMobile.mp4' : '/landscapePC.mp4';

    const req = new XMLHttpRequest();
    req.open('GET', videoUrl, true);
    req.responseType = 'blob'; // Download as blob to force browser caching of the entire video

    req.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(percentComplete);
      } else {
        // Fallback using exact file sizes if server omits Content-Length
        const total = isMobile ? 6564895 : 6754041;
        const percentComplete = (event.loaded / total) * 100;
        setProgress(Math.min(percentComplete, 99)); // Cap at 99 until finished
      }
    };

    req.onload = () => {
      if (req.status === 200 || req.status === 304) {
        setProgress(100);
        sessionStorage.setItem('introLoaded', 'true');
        setTimeout(() => setIsVisible(false), 800); // Hold at 100% for a moment
      }
    };

    req.onerror = () => {
      // Fallback if XHR fails, just let them in
      setProgress(100);
      setTimeout(() => setIsVisible(false), 400);
    };

    req.send();
    
    return () => req.abort();
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#E1DCC9]"
        >
          <div className="relative z-10 flex flex-col items-center">
            {/* Page Loader PNG - Increased Size */}
            <motion.img 
              src="/pageloader.png" 
              alt="Loading..." 
              className="w-64 md:w-96 lg:w-[28rem] h-auto mb-12 drop-shadow-2xl"
              animate={{ opacity: [0.75, 1, 0.75], scale: [0.98, 1, 0.98] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Progress Bar Container */}
            <div className="w-64 md:w-80 h-[2px] bg-black/10 rounded-full overflow-hidden relative mb-4">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-black"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </div>
            
            {/* Percentage Text */}
            <div className="font-mono text-black font-bold tracking-widest text-sm">
              {Math.round(progress)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
