'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const waterVertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  attribute float aPhase;
  attribute float aOffset;
  
  varying float vAlpha;
  
  void main() {
    vec3 pos = position;
    
    // Animate along Y and spiral
    float t = uTime * uSpeed + aPhase * 10.0;
    
    float radius = 0.5 + sin(t * 0.5) * 0.2;
    pos.x += cos(t + aOffset) * radius;
    pos.z += sin(t + aOffset) * radius;
    pos.y += sin(t * 1.5 + aPhase) * 1.5;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (15.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    vAlpha = smoothstep(-1.5, 1.5, pos.y) * smoothstep(1.5, -1.5, pos.y);
  }
`;

const waterFragmentShader = `
  uniform vec3 uColorMain;
  uniform vec3 uColorHighlight;
  
  varying float vAlpha;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    float intensity = 1.0 - (dist * 2.0);
    intensity = pow(intensity, 1.5);
    
    vec3 color = mix(uColorMain, uColorHighlight, intensity);
    gl_FragColor = vec4(color, intensity * vAlpha * 0.8);
  }
`;

interface WaterElementProps {
  active?: boolean; position?: [number, number, number];
  intensity?: number;
}

export default function WaterElement({ active = false, intensity = 1, position }: WaterElementProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  
  const particleCount = 150;
  
  const [positions, phases, offsets] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const p = new Float32Array(particleCount);
    const o = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3.0; // Y spread
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      
      p[i] = Math.random() * Math.PI * 2;
      o[i] = Math.random() * Math.PI * 2;
    }
    
    return [pos, p, o];
  }, [particleCount]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: 1.0 },
    uColorMain: { value: new THREE.Color('#3B82F6') },
    uColorHighlight: { value: new THREE.Color('#93C5FD') }
  }), []);

  useFrame((state) => {
    if (uniforms.uTime) {
      uniforms.uTime.value = state.clock.elapsedTime;
      const targetSpeed = active ? 2.0 * intensity : 0.5;
      uniforms.uSpeed.value = THREE.MathUtils.lerp(uniforms.uSpeed.value, targetSpeed, 0.05);
    }
    if (rippleRef.current) {
      const positionAttribute = rippleRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const time = state.clock.elapsedTime;
      const speed = active ? 3.0 : 1.0;
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        const z = Math.sin(dist * 5.0 - time * speed) * 0.1;
        positionAttribute.setZ(i, z);
      }
      positionAttribute.needsUpdate = true;
    }
  });

  return (
    <group position={position || [-3, 0, -2]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            
            args={[positions, 
            3]}
          />
          <bufferAttribute
            attach="attributes-aPhase"
            
            args={[phases, 
            1]}
          />
          <bufferAttribute
            attach="attributes-aOffset"
            
            args={[offsets, 
            1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={uniforms}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={rippleRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[3, 3, 32, 32]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.3} wireframe={true} />
      </mesh>
    </group>
  );
}
