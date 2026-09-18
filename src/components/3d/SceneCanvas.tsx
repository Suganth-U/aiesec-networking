'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useCallback } from 'react';
import { useSceneState } from '@/stores/useSceneState';

// Lazy imports for code splitting - these will be created by subagents
import dynamic from 'next/dynamic';

const Scene3DContent = dynamic(() => import('./Scene3DContent'), { ssr: false });

export default function SceneCanvas() {
  const setMousePosition = useSceneState((s) => s.setMousePosition);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Normalize to -1 to 1
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePosition(x, y);
  }, [setMousePosition]);

  // Gyroscope support for mobile
  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma !== null && e.beta !== null) {
      const x = Math.max(-1, Math.min(1, (e.gamma || 0) / 45));
      const y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 45));
      setMousePosition(x, y);
    }
  }, [setMousePosition]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [handleMouseMove, handleDeviceOrientation]);

  return (
    <div 
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene3DContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
