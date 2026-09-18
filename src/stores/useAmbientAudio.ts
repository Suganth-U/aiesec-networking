'use client';

import { useEffect, useRef } from 'react';
import { useSceneState } from './useSceneState';

export function useAmbientAudio() {
  const { currentPage, isUrgent, roundTransition } = useSceneState();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const humOscRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    // Ambient Hum
    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    
    humOsc.type = 'sine';
    humOsc.frequency.value = 55; // Low A
    
    humOsc.connect(humGain);
    humGain.connect(ctx.destination);
    
    humGain.gain.value = 0; // start silent
    humOsc.start();

    humOscRef.current = humOsc;
    humGainRef.current = humGain;
  };

  useEffect(() => {
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  // Control the hum based on state
  useEffect(() => {
    if (!audioCtxRef.current || !humGainRef.current || !humOscRef.current) return;
    
    const ctx = audioCtxRef.current;
    const gain = humGainRef.current.gain;
    const osc = humOscRef.current.frequency;
    
    // Resume context if suspended
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    if (roundTransition) {
      // Intense convergence hum
      gain.setTargetAtTime(0.15, now, 0.1);
      osc.setTargetAtTime(110, now, 0.1); // Pitch up
    } else if (currentPage === 'complete') {
      // Harmonic resolution
      gain.setTargetAtTime(0.1, now, 1.0);
      osc.setTargetAtTime(88, now, 1.0);
    } else if (isUrgent) {
      // Tense rumbling
      gain.setTargetAtTime(0.08, now, 0.5);
      osc.setTargetAtTime(50, now, 0.5);
    } else if (currentPage === 'network') {
      // Subtle background hum
      gain.setTargetAtTime(0.03, now, 2.0);
      osc.setTargetAtTime(65, now, 2.0);
    } else {
      // Fade out on other pages
      gain.setTargetAtTime(0, now, 1.0);
      osc.setTargetAtTime(55, now, 1.0);
    }
  }, [currentPage, isUrgent, roundTransition]);

  return null;
}
