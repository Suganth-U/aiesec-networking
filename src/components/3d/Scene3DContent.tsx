'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneState } from '@/stores/useSceneState';
import * as THREE from 'three';

// Element components
import WaterElement from './WaterElement';
import FireElement from './FireElement';
import EarthElement from './EarthElement';
import { AirElement } from './AirElement';
import { ElementOrb } from './ElementOrb';
import { StarField } from './StarField';
import { ParticleField } from './ParticleField';

const ELEMENT_ORDER: Array<'water' | 'earth' | 'fire' | 'air'> = ['water', 'earth', 'fire', 'air'];

// Orb positions for each page state
const ORB_POSITIONS = {
  landing: {
    water: [0, 0, 15] as [number, number, number],
    earth: [0, 0, 5] as [number, number, number],
    fire:  [0, 0, -5] as [number, number, number],
    air:   [0, 0, -15] as [number, number, number],
  },
  join: {
    water: [-3, 1, -3] as [number, number, number],
    earth: [3, 1, -3] as [number, number, number],
    fire:  [3, -1, -3] as [number, number, number],
    air:   [-3, -1, -3] as [number, number, number],
  },
  network: {
    water: [-4, 0, -4] as [number, number, number],
    earth: [4, 0, -4] as [number, number, number],
    fire:  [0, 3, -4] as [number, number, number],
    air:   [0, -3, -4] as [number, number, number],
  },
  complete: {
    water: [0, 0, -2] as [number, number, number],
    earth: [0, 0, -2] as [number, number, number],
    fire:  [0, 0, -2] as [number, number, number],
    air:   [0, 0, -2] as [number, number, number],
  },
};

export default function Scene3DContent() {
  const groupRef = useRef<THREE.Group>(null);
  const { 
    currentPage, 
    activeElement, 
    targetElement, 
    carouselElement,
    isUrgent, 
    mouseX, 
    mouseY,
    scrollProgress
  } = useSceneState();

  // Handle camera and mouse parallax
  useFrame((state, delta) => {
    // 1. Camera Forward/Backward Movement
    if (currentPage === 'landing') {
      // scrollProgress goes from 0 to 4. We map this to Z positions: 18 -> 8 -> -2 -> -12 -> -22
      const targetZ = 18 - scrollProgress * 10;
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 1.5);
    } else {
      // Default camera position for other pages
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 8, delta * 2);
    }

    // 2. Mouse Parallax (Global Rotation)
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseX * 0.15,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouseY * 0.1,
        0.05
      );
    }
  });

  // Determine which elements are "active" based on page
  const getElementActive = (element: typeof ELEMENT_ORDER[number]) => {
    if (currentPage === 'landing') return element === carouselElement;
    if (currentPage === 'join') return element === activeElement;
    if (currentPage === 'network') return element === activeElement || element === targetElement;
    if (currentPage === 'complete') return true; // All glow on completion
    return false;
  };

  const getOrbPosition = (element: typeof ELEMENT_ORDER[number]) => {
    return ORB_POSITIONS[currentPage]?.[element] || ORB_POSITIONS.landing[element];
  };

  const getElementIntensity = (element: typeof ELEMENT_ORDER[number]) => {
    if (currentPage === 'complete') return 1.5;
    if (isUrgent && (element === activeElement || element === targetElement)) return 1.8;
    if (getElementActive(element)) return 1.2;
    return 0.3;
  };

  return (
    <group ref={groupRef}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 5]} intensity={0.3} color="#ffffff" />
      
      {/* Deep fog for depth */}
      <fog attach="fog" args={['#020617', 5, 25]} />

      {/* Background stars */}
      <StarField intensity={currentPage === 'complete' ? 1.5 : 0.8} />

      {/* Ambient floating particles */}
      <ParticleField count={120} color="#67e8f9" />

      {/* Elemental effects */}
      <WaterElement position={getOrbPosition('water')} active={getElementActive('water')} intensity={getElementIntensity('water')} />
      <FireElement position={getOrbPosition('fire')} active={getElementActive('fire')} intensity={getElementIntensity('fire')} />
      <EarthElement position={getOrbPosition('earth')} active={getElementActive('earth')} intensity={getElementIntensity('earth')} />
      <AirElement position={getOrbPosition('air')} active={getElementActive('air')} intensity={getElementIntensity('air')} />

      {/* Elemental orbs */}
      {ELEMENT_ORDER.map((element) => (
        <ElementOrb
          key={element}
          element={element}
          position={getOrbPosition(element)}
          active={getElementActive(element)}
          scale={getElementActive(element) ? 1.2 : 0.6}
        />
      ))}
    </group>
  );
}
