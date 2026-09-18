'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AudioPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  const isHidden = pathname?.startsWith('/admin');

  // We initialize isGlobalMuted to false so it plays by default.
  // However, browsers block autoplay until the user interacts with the page.
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Listen for the very first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Global Button Click Sound Effect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button') || target.closest('a') || target.closest('[role="button"]');
      
      if (isClickable && clickAudioRef.current && !isGlobalMuted) {
        clickAudioRef.current.currentTime = 0;
        clickAudioRef.current.volume = 0.5;
        clickAudioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isGlobalMuted]);

  // Manage Game sound.mp3 playback
  useEffect(() => {
    if (!audioRef.current) return;
    
    // We play Game sound.mp3 everywhere EXCEPT admin page, and ONLY if NOT muted AND user has interacted
    if (!isHidden && !isGlobalMuted && hasInteracted) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // Autoplay failed even after interaction, fallback to muted state
        setIsGlobalMuted(true);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isHidden, isGlobalMuted, hasInteracted]);

  // Sync global mute state with window for other components (like video in page.tsx)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('globalMuteChange', { detail: { isMuted: isGlobalMuted } }));
  }, [isGlobalMuted]);

  const toggleMute = () => {
    setIsGlobalMuted(prev => !prev);
  };

  return (
    <>
      <audio ref={audioRef} src="/Game sound.mp3" loop />
      <audio ref={clickAudioRef} src="/click.mp3" />
      
      {!isHidden && (
        <button
          onClick={toggleMute}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 transition-all"
          title={isGlobalMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isGlobalMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      )}
    </>
  );
}
