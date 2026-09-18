'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AudioPlayer() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const shouldHide = pathname === '/' || pathname?.startsWith('/network') || pathname?.startsWith('/admin');

  // Try to autoplay on mount
  useEffect(() => {
    if (audioRef.current && !shouldHide) {
      audioRef.current.volume = 0.3; // 30% volume so it's not too loud
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Auto-play prevented by browser, require user interaction
          setIsPlaying(false);
        });
      }
    }
  }, [shouldHide]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (shouldHide) return null;

  return (
    <>
      <audio ref={audioRef} src="/Game sound.mp3" loop />
      <button
        onClick={togglePlay}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 transition-all"
        title="Toggle Music"
      >
        {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>
    </>
  );
}
