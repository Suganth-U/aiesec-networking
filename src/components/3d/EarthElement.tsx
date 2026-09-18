'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

interface EarthElementProps {
  active?: boolean; position?: [number, number, number];
  intensity?: number;
}

export default function EarthElement({ active = false, intensity = 1, position }: EarthElementProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.InstancedMesh>(null);
  const numCrystals = 10;
  const numDust = 50;

  const crystalData = useMemo(() => {
    return Array.from({ length: numCrystals }).map(() => ({
      position: [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 2
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ] as [number, number, number],
      scale: 0.15 + Math.random() * 0.3
    }));
  }, []);

  const dustData = useMemo(() => {
    const dummy = new THREE.Object3D();
    const data = Array.from({ length: numDust }).map(() => {
      return {
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 3
        ),
        speed: 0.5 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2,
        orbitRadius: 1.0 + Math.random() * 1.5
      };
    });
    return { data, dummy };
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const currentSpeed = active ? 2 * intensity : 0.5;

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1 * currentSpeed;
    }

    if (dustRef.current) {
      dustData.data.forEach((d, i) => {
        const t = time * d.speed * currentSpeed + d.offset;
        dustData.dummy.position.set(
          Math.cos(t) * d.orbitRadius + d.pos.x * 0.3,
          d.pos.y + Math.sin(t * 2.0) * 0.2,
          Math.sin(t) * d.orbitRadius + d.pos.z * 0.3
        );
        dustData.dummy.scale.setScalar(0.02 + Math.sin(t * 5.0) * 0.01);
        dustData.dummy.updateMatrix();
        dustRef.current!.setMatrixAt(i, dustData.dummy.matrix);
      });
      dustRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={position || [-2, -1, -3]}>
      <group ref={groupRef}>
        <Instances limit={numCrystals}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color="#15803D" 
            emissive="#22C55E"
            emissiveIntensity={active ? 1.5 * intensity : 0.5}
            roughness={0.9}
            metalness={0.1}
          />
          {crystalData.map((data, i) => (
            <Float 
              key={i} 
              speed={active ? 3 * intensity : 1.5} 
              rotationIntensity={active ? 2 : 1} 
              floatIntensity={active ? 1.5 : 0.8}
            >
              <Instance
                position={data.position}
                rotation={data.rotation}
                scale={data.scale}
              />
            </Float>
          ))}
        </Instances>
      </group>

      <instancedMesh ref={dustRef} args={[undefined, undefined, numDust]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#22C55E" transparent opacity={0.6} />
      </instancedMesh>

      <pointLight color="#22C55E" intensity={active ? 1.5 * intensity : 0.5} distance={5} />
    </group>
  );
}
