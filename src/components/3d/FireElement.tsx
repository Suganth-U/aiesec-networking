'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const fireVertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  attribute float aDelay;
  attribute float aSpeed;
  attribute float aXOffset;
  
  varying float vProgress;
  
  void main() {
    vec3 pos = position;
    
    float t = uTime * uSpeed * aSpeed + aDelay;
    float progress = fract(t * 0.5);
    
    // Rise up
    pos.y = -1.0 + progress * 3.0;
    
    // Wiggle
    pos.x += sin(progress * 10.0 + aXOffset) * 0.2 * progress;
    pos.z += cos(progress * 8.0 + aDelay) * 0.2 * progress;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Size attenuates as it goes up
    gl_PointSize = (25.0 * (1.0 - progress)) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    
    vProgress = progress;
  }
`;

const fireFragmentShader = `
  uniform vec3 uColorCenter;
  uniform vec3 uColorEdge;
  
  varying float vProgress;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    float alpha = 1.0 - (dist * 2.0);
    alpha = pow(alpha, 1.5) * (1.0 - vProgress);
    
    vec3 color = mix(uColorCenter, uColorEdge, dist * 2.0 + vProgress * 0.5);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

interface FireElementProps {
  active?: boolean; position?: [number, number, number];
  intensity?: number;
}

export default function FireElement({ active = false, intensity = 1, position }: FireElementProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const [positions, delays, speeds, xOffsets] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const del = new Float32Array(particleCount);
    const spd = new Float32Array(particleCount);
    const xOff = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      
      del[i] = Math.random() * 10.0;
      spd[i] = 0.5 + Math.random() * 1.5;
      xOff[i] = Math.random() * Math.PI * 2;
    }
    
    return [pos, del, spd, xOff];
  }, [particleCount]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: 1.0 },
    uColorCenter: { value: new THREE.Color('#FCA5A5') },
    uColorEdge: { value: new THREE.Color('#EF4444') }
  }), []);

  useFrame((state) => {
    if (uniforms.uTime) {
      uniforms.uTime.value = state.clock.elapsedTime;
      const targetSpeed = active ? 2.5 * intensity : 1.0;
      uniforms.uSpeed.value = THREE.MathUtils.lerp(uniforms.uSpeed.value, targetSpeed, 0.1);
    }
  });

  return (
    <group position={position || [3, -1, -2]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            
            args={[positions, 
            3]}
          />
          <bufferAttribute
            attach="attributes-aDelay"
            
            args={[delays, 
            1]}
          />
          <bufferAttribute
            attach="attributes-aSpeed"
            
            args={[speeds, 
            1]}
          />
          <bufferAttribute
            attach="attributes-aXOffset"
            
            args={[xOffsets, 
            1]}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={fireVertexShader}
          fragmentShader={fireFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <pointLight color="#F97316" intensity={active ? 2 * intensity : 1} distance={6} />
    </group>
  );
}
