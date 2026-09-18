'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AirElementProps {
  active: boolean;
  intensity?: number;
}

const vertexShader = `
  uniform float uTime;
  uniform float uIntensity;
  
  attribute float aOffset;
  attribute float aPhase;
  attribute float aRadius;
  attribute float aHeight;
  
  varying float vAlpha;
  
  void main() {
    float t = uTime * 2.0 * uIntensity + aPhase;
    
    // Helix pattern
    float radius = aRadius + sin(t * 0.5) * 0.2;
    float x = cos(t) * radius;
    float z = sin(t) * radius;
    
    // Height variation
    float y = mod(aHeight + t * 0.5, 4.0) - 2.0;
    
    vec3 pos = position + vec3(x, y, z);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Pass alpha based on height (fade at top and bottom)
    vAlpha = smoothstep(-2.0, -1.0, y) * (1.0 - smoothstep(1.0, 2.0, y));
  }
`;

const fragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  
  varying float vAlpha;
  
  void main() {
    // Elongated streak pattern (using xy coordinates of points or just simple gradient)
    // For InstancedMesh with standard geometry, we just color the surface
    
    // Distance from center for soft edges
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    // Actually this is for points, but we're using a geometry for instanced mesh,
    // so we can't use gl_PointCoord easily unless it's a point. We'll assume geometry has UVs.
    
    vec3 color = mix(uColor1, uColor2, vAlpha);
    float alpha = vAlpha * 0.8;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const AirElement: React.FC<AirElementProps> = ({ active = false, intensity = 1, position }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const particleCount = 120;
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.1, 0.4), []);
  
  // Custom attributes for particles
  const offsets = useMemo(() => {
    const arr = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      arr[i] = Math.random();
    }
    return arr;
  }, []);
  
  const phases = useMemo(() => {
    const arr = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      arr[i] = Math.random() * Math.PI * 2;
    }
    return arr;
  }, []);
  
  const radii = useMemo(() => {
    const arr = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      arr[i] = 0.5 + Math.random();
    }
    return arr;
  }, []);
  
  const heights = useMemo(() => {
    const arr = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      arr[i] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: active ? intensity : 0.1 },
    uColor1: { value: new THREE.Color('#F97316') },
    uColor2: { value: new THREE.Color('#FDBA74') }
  }), [active, intensity]);
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uIntensity.value,
        active ? intensity : 0.1,
        0.05
      );
    }
    
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, index) => {
        const speed = (index + 1) * 0.5;
        ring.rotation.x += 0.01 * speed;
        ring.rotation.y += 0.02 * speed;
      });
    }
    
    if (meshRef.current) {
        // billboard effect for particles
        for(let i=0; i<particleCount; i++){
            const dummy = new THREE.Object3D();
            dummy.rotation.copy(state.camera.rotation);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={position || [2, 0, -3]}>
      {/* Vortex Particles */}
      <instancedMesh ref={meshRef} args={[geometry, undefined, particleCount]}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
        <instancedBufferAttribute attach="geometry-attributes-aOffset" args={[offsets, 1]} />
        <instancedBufferAttribute attach="geometry-attributes-aPhase" args={[phases, 1]} />
        <instancedBufferAttribute attach="geometry-attributes-aRadius" args={[radii, 1]} />
        <instancedBufferAttribute attach="geometry-attributes-aHeight" args={[heights, 1]} />
      </instancedMesh>
      
      {/* Wind Rings */}
      <group ref={ringsRef}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
            <torusGeometry args={[1.2 + i * 0.3, 0.02, 16, 64]} />
            <meshBasicMaterial 
              color="#FDBA74" 
              transparent 
              opacity={active ? 0.3 : 0.05} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
