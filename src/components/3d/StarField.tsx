'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface StarFieldProps {
  intensity?: number;
}

export const StarField: React.FC<StarFieldProps> = ({ intensity = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Rotate completely over 120 seconds (2 * PI / 120)
      const speed = (2 * Math.PI) / 120;
      groupRef.current.rotation.y = state.clock.elapsedTime * speed;
      groupRef.current.rotation.x = state.clock.elapsedTime * (speed * 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      <Stars 
        radius={50} 
        depth={50} 
        count={500} 
        factor={4} 
        saturation={0.5} // Slight desaturation for warm white / blue tint
        fade 
        speed={1} 
      />
      {/* 
        The Stars component creates points with a specific shader. 
        We use it directly for a nice optimized starfield.
      */}
    </group>
  );
};
