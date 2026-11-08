import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';
import type { HorrorIntensity } from '../../tokens/types';

export interface ExcavationLoader3DProps {
  message?: string;
  speed?: 'slow' | 'normal' | 'fast';
  intensity?: HorrorIntensity;
  scale?: number;
}

const SPEED_FACTORS = {
  slow: 0.6,
  normal: 1.0,
  fast: 1.6,
};

/**
 * SkeletalHand - Anatomical finger bones clawing upward
 * Five distinct phalanges with joint articulation
 */
function SkeletalHand({ speedMultiplier }: { speedMultiplier: number }) {
  const handRef = useRef<Group>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (handRef.current) {
      // Clawing upward motion with trembling
      const claw = Math.sin(t * speedMultiplier * 1.2) * 0.15;
      const tremble = Math.sin(t * speedMultiplier * 8.0) * 0.008;
      handRef.current.position.y = -0.35 + claw + tremble;
      handRef.current.rotation.z = Math.sin(t * speedMultiplier * 0.5) * 0.06;
    }
  });
  
  // Anatomical finger positions and rotations
  const fingers = [
    { x: -0.20, rot: -0.25, scale: 0.9 },  // Pinky
    { x: -0.10, rot: -0.12, scale: 1.0 },  // Ring
    { x: 0.00, rot: 0.0, scale: 1.05 },    // Middle (longest)
    { x: 0.10, rot: 0.10, scale: 0.98 },   // Index
    { x: 0.22, rot: 0.30, scale: 0.85 },   // Thumb
  ];
  
  return (
    <group ref={handRef} position={[0, -0.35, 0.3]} rotation={[0.4, 0, 0]}>
      {/* Wrist bone base */}
      <mesh position={[0, -0.15, 0]} rotation={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.10, 0.25, 12]} />
        <meshStandardMaterial 
          color="#cbd5e1" 
          roughness={0.7} 
          metalness={0.1}
          emissive="#4AF2A1"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Five finger bones with phalanges */}
      {fingers.map((finger, i) => (
        <group key={i} position={[finger.x, 0, 0]} rotation={[0, 0, finger.rot]}>
          {/* Proximal phalanx (base) */}
          <mesh position={[0, 0.10 * finger.scale, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.030, 0.20 * finger.scale, 10]} />
            <meshStandardMaterial 
              color="#cbd5e1" 
              roughness={0.7}
              emissive="#4AF2A1"
              emissiveIntensity={0.25}
            />
          </mesh>
          
          {/* Middle phalanx */}
          <mesh position={[0, 0.24 * finger.scale, 0]} rotation={[-0.15, 0, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.025, 0.16 * finger.scale, 10]} />
            <meshStandardMaterial 
              color="#cbd5e1" 
              roughness={0.7}
              emissive="#4AF2A1"
              emissiveIntensity={0.25}
            />
          </mesh>
          
          {/* Distal phalanx (fingertip) - sharpened claw */}
          <mesh position={[0, 0.36 * finger.scale, 0]} rotation={[-0.25, 0, 0]} castShadow>
            <coneGeometry args={[0.020, 0.12 * finger.scale, 10]} />
            <meshStandardMaterial 
              color="#94a3b8" 
              roughness={0.6}
              emissive="#4AF2A1"
              emissiveIntensity={0.3}
            />
          </mesh>
          
          {/* Knuckle joints */}
          <mesh position={[0, 0.19 * finger.scale, 0]} castShadow>
            <sphereGeometry args={[0.028, 10, 10]} />
            <meshStandardMaterial 
              color="#94a3b8" 
              roughness={0.7}
              emissive="#4AF2A1"
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}
      
      {/* Marrow phosphor glow emanating from hand */}
      <pointLight
        position={[0, 0.1, 0]}
        color="#4AF2A1"
        intensity={1.2}
        distance={2.0}
        decay={2}
      />
    </group>
  );
}

/**
 * DirtParticleSystem - Compacted earth particles displaced by clawing
 * Parabolic ejection physics with moisture clumping
 */
function DirtParticleSystem({ speedMultiplier }: { speedMultiplier: number }) {
  const particlesRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const t = state.clock.elapsedTime;
    
    particlesRef.current.children.forEach((particle, idx) => {
      const offset = idx * 0.4;
      const cycle = (t * speedMultiplier * 2.0 + offset) % 2.5;
      
      // Parabolic trajectory
      const x = -0.4 + cycle * 0.6;
      const y = -0.2 + Math.sin(cycle * Math.PI / 2.5) * 0.8 - (cycle * cycle * 0.15);
      const z = 0.2 + cycle * 0.3;
      
      particle.position.set(x, y, z);
      
      // Shrink as particles disperse
      const scale = Math.max(0.05 - cycle * 0.015, 0.01);
      particle.scale.setScalar(scale);
      
      // Rotate during flight
      particle.rotation.x = cycle * 3.0;
      particle.rotation.y = cycle * 2.0;
    });
  });
  
  return (
    <group ref={particlesRef}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#3a2f2a"
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * ExcavationLoader3D - Skeletal hand clawing through cursed earth
 * 
 * Haunted Terminal Archetype:
 * - Baseline: Deep obsidian earth #0B0E08
 * - Interactive: Phosphor bone marrow #4AF2A1
 * - Trigger: Crimson terror pulse #FF3333
 * 
 * Physics:
 * - Anatomical hand with five-finger phalanges
 * - Parabolic dirt ejection with moisture clumping
 * - Trembling claw motion with joint articulation
 * - Marrow glow emanating from bone core
 */
export function ExcavationLoader3D({
  message = 'Excavating cursed ground...',
  speed = 'normal',
  intensity = 'cursed',
  scale = 1.0,
}: ExcavationLoader3DProps) {
  const groupRef = useRef<Group>(null);
  const earthMoundRef = useRef<Group>(null);
  const speedMultiplier = SPEED_FACTORS[speed];
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Earth displacement ripple from clawing
    if (earthMoundRef.current) {
      const ripple = Math.sin(t * speedMultiplier * 1.5) * 0.02;
      earthMoundRef.current.scale.set(1 + ripple, 1, 1 + ripple);
    }
    
    // Gentle container sway
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.04;
    }
  });
  
  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* High-visibility lighting for clear component view */}
      <ambientLight intensity={0.6} color="#f0f0f0" />
      <directionalLight position={[3, 5, 4]} intensity={1.2} color="#ffffff" castShadow />
      <directionalLight position={[-3, 3, -2]} intensity={0.8} color="#a0c4ff" />
      <pointLight position={[0, 1, 2]} intensity={0.8} color="#4AF2A1" distance={5} decay={2} />
      
      <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.06}>
        {/* Compacted earth mound */}
        <group ref={earthMoundRef} position={[0, -0.65, 0]}>
          <mesh receiveShadow>
            <sphereGeometry args={[1.2, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshStandardMaterial
              color="#2d2419"
              roughness={0.95}
              metalness={0.0}
            />
          </mesh>
        </group>
        
        {/* Skeletal hand breaking through */}
        <SkeletalHand speedMultiplier={speedMultiplier} />
        
        {/* Displaced dirt particles */}
        <DirtParticleSystem speedMultiplier={speedMultiplier} />
        
        {/* Crimson terror pulse on intense excavation */}
        {intensity === 'abyssal' && (
          <pointLight
            position={[0, -0.2, 0.5]}
            color="#FF3333"
            intensity={0.6}
            distance={2.5}
            decay={2}
          />
        )}
        
        {/* Status inscription */}
        {message && (
          <Text
            position={[0, -1.15, 0]}
            fontSize={0.14}
            letterSpacing={0.08}
            color="#4AF2A1"
            outlineWidth={0.01}
            outlineColor="#0a0a0a"
            anchorX="center"
            anchorY="middle"
          >
            {message.toUpperCase()}
          </Text>
        )}
      </Float>
    </group>
  );
}
