'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  color?: string;
}

const vertexShader = `
  uniform float uTime;
  
  attribute vec3 aRandomScale;
  attribute vec3 aSpeed;
  attribute vec3 aOffset;
  
  varying float vAlpha;
  
  void main() {
    vec3 pos = position;
    
    // Brownian motion simulation with sin/cos
    pos.x += sin(uTime * aSpeed.x + aOffset.x) * aRandomScale.x;
    pos.y += cos(uTime * aSpeed.y + aOffset.y) * aRandomScale.y;
    pos.z += sin(uTime * aSpeed.z + aOffset.z) * aRandomScale.z;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = 15.0 * (1.0 / -mvPosition.z);
    
    // Fade out based on distance
    vAlpha = smoothstep(20.0, 5.0, length(mvPosition.xyz));
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  
  varying float vAlpha;
  
  void main() {
    // Soft circle
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    // Smooth edges for soft glow effect
    float alpha = smoothstep(0.5, 0.1, dist) * 0.3 * vAlpha;
    
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export const ParticleField: React.FC<ParticleFieldProps> = ({ 
  count = 150, 
  color = '#E0FFFF' // subtle cyan/white glow by default
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const [positions, randomScales, speeds, offsets] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const rs = new Float32Array(count * 3);
    const sp = new Float32Array(count * 3);
    const off = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Scatter randomly in a 20x20x20 volume
      p[i3] = (Math.random() - 0.5) * 20;
      p[i3 + 1] = (Math.random() - 0.5) * 20;
      p[i3 + 2] = (Math.random() - 0.5) * 20;
      
      // Drift scale
      rs[i3] = Math.random() * 2;
      rs[i3 + 1] = Math.random() * 2;
      rs[i3 + 2] = Math.random() * 2;
      
      // Drift speed
      sp[i3] = 0.1 + Math.random() * 0.2;
      sp[i3 + 1] = 0.1 + Math.random() * 0.2;
      sp[i3 + 2] = 0.1 + Math.random() * 0.2;
      
      // Phase offsets
      off[i3] = Math.random() * Math.PI * 2;
      off[i3 + 1] = Math.random() * Math.PI * 2;
      off[i3 + 2] = Math.random() * Math.PI * 2;
    }
    
    return [p, rs, sp, off];
  }, [count]);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) }
  }), [color]);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          
          args={[positions, 
          3]}
        />
        <bufferAttribute
          attach="attributes-aRandomScale"
          
          args={[randomScales, 
          3]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          
          args={[speeds, 
          3]}
        />
        <bufferAttribute
          attach="attributes-aOffset"
          
          args={[offsets, 
          3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
