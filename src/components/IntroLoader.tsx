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
    const assets = [
      '/bgVideo.mp4',
      '/Game sound.mp3',
      '/Toph.png', '/Aang.png', '/zuko.png', '/katara.png',
      '/earth-bg.jpg', '/water-bg.jpg', '/air-bg.jpg', '/fire-bg.jpg',
      '/bg_water.jpg', '/bg_earth.jpg', '/bg_fire.jpg', '/bg_air.jpg',
      '/bg_water_mobile.jpg', '/bg_earth_mobile.jpg', '/bg_fire_mobile.jpg', '/bg_air_mobile.jpg',
      '/mobile-bg.png', '/desktop-bg.png'
    ];

    const progressMap = new Map<string, number>();
    let isCancelled = false;

    const loadAsset = (url: string) => {
      return new Promise<void>(async (resolve) => {
        // Fallback timer
        const timer = setTimeout(() => {
          progressMap.set(url, 1);
          resolve();
        }, 15000);

        // Simulate progress updates for UI while downloading
        let fakeProgress = 0;
        const interval = setInterval(() => {
          if (isCancelled || fakeProgress >= 0.9) {
            clearInterval(interval);
            return;
          }
          fakeProgress += 0.1;
          progressMap.set(url, fakeProgress);
          
          let totalProgress = 0;
          progressMap.forEach((val) => totalProgress += val);
          const overall = (totalProgress / assets.length) * 100;
          setProgress(Math.min(overall, 99));
        }, 300);

        try {
          const res = await fetch(url);
          if (res.ok) {
            await res.blob(); // fully download to browser cache
          }
        } catch (e) {
          // ignore errors, fallback timer or resolve will handle it
        }

        clearInterval(interval);
        clearTimeout(timer);
        progressMap.set(url, 1);
        resolve();
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
