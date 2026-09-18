'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroLoader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show full loading sequence if not played this session
    const hasPlayed = sessionStorage.getItem('introLoaded');
    if (hasPlayed) {
      setIsVisible(false);
      return;
    }
    
    // Build list of assets to preload
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const landingVideo = isMobile ? '/portraitMobile.mp4' : '/landscapePC.mp4';
    
    const assets = [
      landingVideo,
      '/bgVideo.mp4',
      '/Game sound.mp3',
      '/Toph.png', '/Aang.png', '/zuko.png', '/katara.png',
      '/earth-bg.jpg', '/water-bg.jpg', '/air-bg.jpg', '/fire-bg.jpg',
      '/mobile-bg.png', '/desktop-bg.png'
    ];

    const progressMap = new Map<string, number>();
    let isCancelled = false;

    const loadAsset = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = 'blob';

        req.onprogress = (event) => {
          if (isCancelled) return;
          if (event.lengthComputable) {
            progressMap.set(url, event.loaded / event.total);
          } else {
            // Rough fallback if total size is unknown
            progressMap.set(url, 0.5);
          }
          
          // Calculate overall progress
          let totalProgress = 0;
          progressMap.forEach((val) => totalProgress += val);
          const overall = (totalProgress / assets.length) * 100;
          setProgress(Math.min(overall, 99));
        };

        req.onload = () => {
          if (req.status === 200 || req.status === 304) {
            progressMap.set(url, 1);
            resolve();
          } else {
            progressMap.set(url, 1); // Skip on error so we don't hang
            resolve();
          }
        };

        req.onerror = () => {
          progressMap.set(url, 1); // Skip on error
          resolve();
        };

        req.send();
      });
    };

    // Load everything in parallel
    Promise.all(assets.map(url => {
      progressMap.set(url, 0);
      return loadAsset(url);
    })).then(() => {
      if (isCancelled) return;
      setProgress(100);
      sessionStorage.setItem('introLoaded', 'true');
      setTimeout(() => setIsVisible(false), 800);
    });
    
    return () => {
      isCancelled = true;
    };
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
