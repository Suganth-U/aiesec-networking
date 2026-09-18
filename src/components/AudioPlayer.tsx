'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AudioPlayer() {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Hide the music toggle button and mute music on admin page
  const isHidden = pathname?.startsWith('/admin');

  // Global Button Click Sound Effect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if clicked element is a button, a link, or has role="button"
      const isClickable = target.closest('button') || target.closest('a') || target.closest('[role="button"]');
      
      if (isClickable && clickAudioRef.current) {
        // Reset time so rapid clicks don't get ignored
        clickAudioRef.current.currentTime = 0;
        // The click sound ignores the music's mute state
        clickAudioRef.current.volume = 0.5; // Set a reasonable volume for clicks
        clickAudioRef.current.play().catch(() => {
          // Ignore autoplay restrictions for click (usually fine since it's a user interaction)
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Try to autoplay background music on mount or route change
  useEffect(() => {
    if (audioRef.current && !isHidden) {
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
    } else if (audioRef.current && isHidden) {
       audioRef.current.pause();
       setIsPlaying(false);
    }
  }, [isHidden, pathname]);

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

  return (
    <>
      <audio ref={audioRef} src="/Game sound.mp3" loop />
      <audio ref={clickAudioRef} src="/click.mp3" />
      
      {!isHidden && (
        <button
          onClick={togglePlay}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 transition-all"
          title="Toggle Music"
        >
          {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      )}
    </>
  );
}
