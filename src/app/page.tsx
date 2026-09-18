'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const CHAPTERS = [

  {
    eyebrow: 'Chapter 01 · Water',
    title: 'THE FLOW OF CHANGE',
    subtitle: 'Adapt & Overcome',
    description: 'Like the ocean, relationships must flow and adapt. Discover the fluidity and healing energy of the Water Tribe.',
    position: 'bottom-28 left-8 md:bottom-32 md:left-24 text-left',
    bgDesktop: '/bg_water.jpg',
    bgMobile: '/bg_water_mobile.jpg'
  },
  {
    eyebrow: 'Chapter 02 · Earth',
    title: 'STAND YOUR GROUND',
    subtitle: 'Unbreakable Foundations',
    description: 'Build solid, unshakeable connections. Embrace the resilience, strength, and unwavering stance of the Earth Kingdom.',
    position: 'top-32 right-8 md:top-1/3 md:right-24 text-right',
    bgDesktop: '/bg_earth.jpg',
    bgMobile: '/bg_earth_mobile.jpg'
  },
  {
    eyebrow: 'Chapter 03 · Fire',
    title: 'SPARK THE FLAME',
    subtitle: 'Ignite the Conversation',
    description: 'Fuel the drive for passion and innovation. Forge powerful, lasting bonds with the fierce energy of the Fire Nation.',
    position: 'top-32 left-8 md:top-32 md:left-24 text-left',
    bgDesktop: '/bg_fire.jpg',
    bgMobile: '/bg_fire_mobile.jpg'
  },
  {
    eyebrow: 'Chapter 04 · Air',
    title: 'FIND YOUR FREEDOM',
    subtitle: 'A New Perspective',
    description: 'Let go of earthly tethers and embrace agility. See the world from a higher vantage point alongside the Air Nomads.',
    position: 'bottom-28 right-8 md:bottom-32 md:right-24 text-right',
    bgDesktop: '/bg_air.jpg',
    bgMobile: '/bg_air_mobile.jpg'
  },
  {
    eyebrow: 'The Convergence',
    title: 'MASTER ALL FOUR',
    subtitle: '',
    description: '',
    position: 'inset-0 flex flex-col items-center justify-center text-center',
    isCTA: true,
    bgDesktop: '/desktop-bg.png',
    bgMobile: '/mobile-bg.png'
  }
];

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);

  // Handle Responsive Image Source
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const updateSrc = (e: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    updateSrc(mql);
    mql.addEventListener('change', updateSrc);
    return () => mql.removeEventListener('change', updateSrc);
  }, []);

  const [currentStep, setCurrentStep] = useState(0);
  const [visibleStep, setVisibleStep] = useState(0);

  const isTransitioning = useRef(false);

  const handleDotClick = (index: number) => {
    if (isTransitioning.current || index === currentStep) return;
    isTransitioning.current = true;
    setVisibleStep(-1);
    setCurrentStep(index);
    setTimeout(() => {
      setVisibleStep(index);
      isTransitioning.current = false;
    }, 600);
  };

  // Auto-advance chapters with a time interval
  useEffect(() => {
    // Only auto-advance if we are not at the CTA slide
    if (currentStep >= CHAPTERS.length - 1) return;

    const timer = setInterval(() => {
      if (!isTransitioning.current) {
        isTransitioning.current = true;
        setVisibleStep(-1);
        setCurrentStep(s => s + 1);
        setTimeout(() => {
          setVisibleStep(currentStep + 1);
          isTransitioning.current = false;
        }, 600);
      }
    }, 5000); // 5 seconds per slide

    return () => clearInterval(timer);
  }, [currentStep]);

  return (
    <div className="relative bg-black w-full h-[100dvh] overflow-hidden">
      
      {/* DYNAMIC PHOTO BACKGROUND */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence initial={false}>
          {CHAPTERS.map((chapter, i) => (
            i === currentStep && (
              <motion.img
                key={i}
                src={isMobile ? chapter.bgMobile : chapter.bgDesktop}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.7, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-full h-full object-cover object-center"
                alt={chapter.title}
              />
            )
          ))}
        </AnimatePresence>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)] z-0 pointer-events-none" />
      </div>

      {/* DYNAMIC TEXT LAYER */}
      <div className="absolute inset-0 z-10 pointer-events-none p-8 md:p-16">
        <AnimatePresence mode="wait">
          {CHAPTERS.map((chapter, i) => (
            i === visibleStep && (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute ${chapter.position} w-full ${chapter.isCTA ? 'max-w-none' : 'max-w-[85%] sm:max-w-[70%] md:max-w-md'} ${chapter.isCTA ? 'pointer-events-auto' : ''}`}
              >
                {!chapter.isCTA ? (
                  <>
                    <p className="text-white/60 font-game tracking-[0.3em] text-sm uppercase mb-4 [text-shadow:_0_2px_10px_rgb(0_0_0_/_80%)]">{chapter.eyebrow}</p>
                    <h1 className="text-4xl md:text-5xl font-cinzel font-bold tracking-widest text-white mb-2 leading-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] [text-shadow:_0_4px_20px_rgb(0_0_0_/_100%)]">
                      {chapter.title}
                    </h1>
                    <h2 className="text-xl font-cinzel text-white/70 tracking-wider mb-4 italic drop-shadow-md [text-shadow:_0_2px_15px_rgb(0_0_0_/_80%)]">{chapter.subtitle}</h2>
                    <p className="text-white font-noto font-light tracking-wide leading-relaxed text-sm md:text-base [text-shadow:_0_2px_8px_rgb(0_0_0_/_90%)]">
                      {chapter.description}
                    </p>
                  </>
                ) : (
                  <div className="text-center w-full max-w-lg mx-auto px-4 md:px-6">
                    <p className="text-white/60 font-game tracking-[0.4em] text-base md:text-lg uppercase mb-6 [text-shadow:_0_2px_10px_rgb(0_0_0_/_80%)]">{chapter.eyebrow}</p>
                    <h1 className="text-5xl md:text-7xl font-cinzel font-bold tracking-[0.15em] text-white mb-10 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] [text-shadow:_0_4px_20px_rgb(0_0_0_/_100%)]">
                      {chapter.title}
                    </h1>
                    
                    <Link
                      href="/join"
                      className="group relative inline-flex px-6 py-4 md:px-10 md:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full font-cinzel tracking-[0.15em] md:tracking-[0.2em] text-sm sm:text-base md:text-lg uppercase text-white transition-all overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                      <span className="relative flex items-center gap-3 md:gap-4 group-hover:text-black transition-colors duration-500 text-center">
                        Start Something Unfinished
                        <Play className="w-4 h-4 md:w-5 md:h-5 fill-transparent group-hover:fill-black transition-colors duration-500" />
                      </span>
                    </Link>
                  </div>
                )}
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* SKIP BUTTON */}
      {currentStep < CHAPTERS.length - 1 && (
        <button
          onClick={() => handleDotClick(CHAPTERS.length - 1)}
          className="absolute top-6 right-6 md:top-10 md:right-10 z-50 px-6 py-2.5 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white/80 hover:text-white text-[10px] md:text-xs font-cinzel tracking-widest uppercase transition-all shadow-xl"
        >
          Skip Journey
        </button>
      )}

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 opacity-70">
        <div className="flex gap-3 mb-1 pointer-events-auto">
           {CHAPTERS.map((_, i) => (
             <button 
               key={i} 
               onClick={() => handleDotClick(i)}
               className="p-2 -m-2"
               aria-label={`Go to chapter ${i + 1}`}
             >
               <div className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2.5 bg-white/30 hover:bg-white/60'}`} />
             </button>
           ))}
        </div>
        <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase pointer-events-none">Cinematic Journey</p>
      </div>
    </div>
  );
}
