'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          roughness={0.1}
          metalness={0.8}
          envMapIntensity={1}
        />
      </mesh>
    </Float>
  );
}

export default function Asset3DViewer() {
  return (
    <div className="w-full h-full bg-brand-dark/50 relative overflow-hidden group rounded-3xl border border-white/10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
        
        <RotatingShape />
        
        <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        <Environment preset="city" />
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-black/50 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/10">
          Seret untuk memutar • Scroll untuk zoom
        </span>
      </div>
    </div>
  );
}
