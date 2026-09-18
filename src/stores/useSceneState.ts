'use client';

import { create } from 'zustand';

export type ElementType = 'water' | 'earth' | 'fire' | 'air';
export type PageType = 'landing' | 'join' | 'network' | 'complete';

interface SceneState {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;

  activeElement: ElementType | null;
  setActiveElement: (element: ElementType | null) => void;
  targetElement: ElementType | null;
  setTargetElement: (element: ElementType | null) => void;

  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
  isUrgent: boolean;
  roundTransition: boolean;
  triggerRoundTransition: () => void;

  carouselElement: ElementType;
  setCarouselElement: (element: ElementType) => void;

  mouseX: number;
  mouseY: number;
  setMousePosition: (x: number, y: number) => void;

  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
}

export const useSceneState = create<SceneState>((set) => ({
  currentPage: 'landing',
  setCurrentPage: (page) => set({ currentPage: page }),

  activeElement: null,
  setActiveElement: (element) => set({ activeElement: element }),
  targetElement: null,
  setTargetElement: (element) => set({ targetElement: element }),

  timeRemaining: 300,
  setTimeRemaining: (time) => set({ timeRemaining: time, isUrgent: time <= 30 && time > 0 }),
  isUrgent: false,
  roundTransition: false,
  triggerRoundTransition: () => {
    set({ roundTransition: true });
    setTimeout(() => set({ roundTransition: false }), 1500);
  },

  carouselElement: 'water',
  setCarouselElement: (element) => set({ carouselElement: element }),

  mouseX: 0,
  mouseY: 0,
  setMousePosition: (x, y) => set({ mouseX: x, mouseY: y }),

  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
}));

export const ELEMENT_COLORS = {
  water: { primary: '#3B82F6', secondary: '#93C5FD', glow: '#1D4ED8' },
  earth: { primary: '#22C55E', secondary: '#86EFAC', glow: '#15803D' },
  fire:  { primary: '#EF4444', secondary: '#FCA5A5', glow: '#DC2626' },
  air:   { primary: '#F97316', secondary: '#FDBA74', glow: '#EA580C' },
} as const;
