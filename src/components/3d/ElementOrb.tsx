'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ELEMENT_COLORS } from '@/stores/useSceneState';

interface ElementOrbProps {
  element: 'water' | 'earth' | 'fire' | 'air';
  position: [number, number, number];
  active: boolean;
  scale?: number;
}

export const ElementOrb: React.FC<ElementOrbProps> = ({ element, position, active, scale = 1 }) => {
  const orbRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  
  const color = ELEMENT_COLORS[element];
  const particleCount = 10;
  
  // Instance matrices for orbiting particles
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Lerp position and scale for smooth transitions
    if (groupRef.current) {
      groupRef.current.position.lerp(new THREE.Vector3(...position), delta * 2.5);
      
      const currentScale = groupRef.current.scale.x;
      const targetScale = THREE.MathUtils.lerp(currentScale, scale, delta * 3);
      groupRef.current.scale.set(targetScale, targetScale, targetScale);
    }
    
    // Pulse emissive intensity
    if (orbRef.current) {
      const material = orbRef.current.material as THREE.MeshStandardMaterial;
      const baseIntensity = active ? 2.0 : 0.5;
      material.emissiveIntensity = baseIntensity + Math.sin(time * 2) * 0.5;
    }
    
    if (lightRef.current) {
      lightRef.current.intensity = active ? 2 + Math.sin(time * 3) * 0.5 : 0.5;
    }
    
    // Rotate and bob glow sphere
    if (glowRef.current) {
      glowRef.current.rotation.y = time * 0.2;
      glowRef.current.rotation.z = time * 0.1;
      glowRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.05);
    }
    
    // Orbit particles
    if (particlesRef.current) {
      for (let i = 0; i < particleCount; i++) {
        const angle = time * (0.5 + i * 0.1) + (i * Math.PI * 2) / particleCount;
        const radius = 0.6 + Math.sin(time * 2 + i) * 0.1;
        const yOffset = Math.cos(time * 3 + i) * 0.3;
        
        dummy.position.set(
          Math.cos(angle) * radius,
          yOffset,
          Math.sin(angle) * radius
        );
        dummy.rotation.x = time + i;
        dummy.scale.setScalar(active ? 1 : 0.3);
        dummy.updateMatrix();
        
        particlesRef.current.setMatrixAt(i, dummy.matrix);
      }
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner solid sphere */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={color.primary}
          emissive={color.glow}
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Outer transparent glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={color.glow}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Point light */}
      <pointLight ref={lightRef} color={color.primary} distance={5} decay={2} />
      
      {/* Orbiting particles */}
      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={color.secondary} toneMapped={false} />
      </instancedMesh>
    </group>
  );
};
