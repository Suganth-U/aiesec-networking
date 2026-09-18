'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useAmbientAudio } from '@/stores/useAmbientAudio';

const SceneCanvas = dynamic(() => import('@/components/3d/SceneCanvas'), {
  ssr: false,
});

export default function SceneCanvasWrapper() {
  const pathname = usePathname();
  useAmbientAudio();
  
  if (pathname === '/' || pathname?.startsWith('/admin') || pathname?.startsWith('/network')) {
    return null;
  }
  
  return <SceneCanvas />;
}
