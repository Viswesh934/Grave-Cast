import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';
import { playSound } from '../../audio';
import type { RuneElement } from '../coven/RunicButton/RunicButton';

export interface RunicButton3DProps {
  children?: string;
  element?: RuneElement;
  sigils?: string;
  onClick?: () => void;
  width?: number;
  height?: number;
}

const ELEMENT_COLORS: Record<RuneElement, { glow: string; rune: string; rim: string; light: string }> = {
  blood: { glow: '#ff1744', rune: '#ff4d6d', rim: '#991b1b', light: '#ff1744' },
  spectral: { glow: '#00ff88', rune: '#4ade80', rim: '#047857', light: '#10b981' },
  fire: { glow: '#f97316', rune: '#fdba74', rim: '#c2410c', light: '#ea580c' },
  frost: { glow: '#38bdf8', rune: '#bae6fd', rim: '#0284c7', light: '#0ea5e9' },
};

/**
 * RunicButton3D
 * 
 * An authentic chiseled runic stone tablet button:
 * - Octagonal chamfered granite tablet with forged iron corner brackets
 * - Recessed perimeter runic channel that flares with elemental fire on hover
 * - Carved Elder Futhark rune inlays
 * - Heavy mechanical depression into stone altar cradle on press
 * - Procedural audio tactile feedback
 */
export function RunicButton3D({
  children = 'Invoke Entity',
  element = 'spectral',
  sigils = 'ᚦ ᚨ ᚱ ᚲ ᚷ',
  onClick,
  width = 4.0,
  height = 1.4,
}: RunicButton3DProps) {
  const groupRef = useRef<Group>(null);
  const buttonSlabRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS.spectral;

  useFrame((state) => {
    if (!buttonSlabRef.current) return;
    const t = state.clock.elapsedTime;

    // Levitation & depression into stone altar
    const targetY = pressed ? -0.14 : hovered ? 0.12 : 0;
    buttonSlabRef.current.position.y += (targetY - buttonSlabRef.current.position.y) * 0.22;

    // Subtle tectonic tremor on hover
    if (hovered && !pressed) {
      const tremor = Math.sin(t * 32) * 0.005;
      buttonSlabRef.current.rotation.z = tremor;
      buttonSlabRef.current.rotation.x = tremor * 0.8;
    } else {
      buttonSlabRef.current.rotation.z *= 0.8;
      buttonSlabRef.current.rotation.x *= 0.8;
    }
  });

  const handleClick = () => {
    playSound('boneClick');
    onClick?.();
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#15241b" />
      <directionalLight position={[2, 4, 3]} intensity={0.8} color="#f0fdf4" />
      <pointLight
        position={[0, 0.4, 0.9]}
        intensity={hovered ? 2.2 : 0.9}
        color={colors.light}
        distance={4.0}
        decay={2}
      />

      <Float speed={1.2} rotationIntensity={0.03} floatIntensity={0.08}>
        {/* Grounded Stone Altar Cradle Socket */}
        <mesh position={[0, -0.06, -0.1]} receiveShadow>
          <boxGeometry args={[width + 0.42, height + 0.42, 0.38]} />
          <meshStandardMaterial
            color="#141c17"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
        {/* Recessed Socket Lip Bevel */}
        <mesh position={[0, -0.06, 0.09]}>
          <boxGeometry args={[width + 0.08, height + 0.08, 0.04]} />
          <meshStandardMaterial color="#0b100d" roughness={0.95} />
        </mesh>

        {/* Floating Interactive Chiseled Runestone Slab */}
        <group
          ref={buttonSlabRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => { setHovered(false); setPressed(false); }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => { setPressed(false); handleClick(); }}
        >
          {/* Main Stone Tablet Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, 0.32]} />
            <meshStandardMaterial
              color="#202b24"
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>

          {/* Recessed Stone Channel Border (Carved glowing channel) */}
          {/* Top channel */}
          <mesh position={[0, height * 0.44, 0.165]}>
            <boxGeometry args={[width * 0.88, 0.03, 0.02]} />
            <meshStandardMaterial
              color={colors.glow}
              emissive={colors.glow}
              emissiveIntensity={hovered ? 2.5 : 0.8}
            />
          </mesh>
          {/* Bottom channel */}
          <mesh position={[0, -height * 0.44, 0.165]}>
            <boxGeometry args={[width * 0.88, 0.03, 0.02]} />
            <meshStandardMaterial
              color={colors.glow}
              emissive={colors.glow}
              emissiveIntensity={hovered ? 2.5 : 0.8}
            />
          </mesh>
          {/* Left channel */}
          <mesh position={[-width * 0.44, 0, 0.165]}>
            <boxGeometry args={[0.03, height * 0.88, 0.02]} />
            <meshStandardMaterial
              color={colors.glow}
              emissive={colors.glow}
              emissiveIntensity={hovered ? 2.5 : 0.8}
            />
          </mesh>
          {/* Right channel */}
          <mesh position={[width * 0.44, 0, 0.165]}>
            <boxGeometry args={[0.03, height * 0.88, 0.02]} />
            <meshStandardMaterial
              color={colors.glow}
              emissive={colors.glow}
              emissiveIntensity={hovered ? 2.5 : 0.8}
            />
          </mesh>

          {/* 4 Forged Iron Corner Brackets */}
          {[
            [-width * 0.45, height * 0.45],
            [width * 0.45, height * 0.45],
            [-width * 0.45, -height * 0.45],
            [width * 0.45, -height * 0.45],
          ].map(([cx, cy], idx) => (
            <group key={idx} position={[cx, cy, 0.165]}>
              <mesh>
                <boxGeometry args={[0.22, 0.22, 0.03]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Corner Stud */}
              <mesh position={[0, 0, 0.02]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.9} />
              </mesh>
            </group>
          ))}

          {/* Inscribed Elder Futhark Sigils Header */}
          <Text
            position={[0, 0.38, 0.17]}
            fontSize={0.2}
            letterSpacing={0.28}
            color={hovered ? '#ffffff' : colors.rune}
            outlineWidth={0.012}
            outlineColor="#050e09"
            anchorX="center"
            anchorY="middle"
          >
            {sigils}
          </Text>

          {/* Button Inscribed Action Title */}
          <Text
            position={[0, -0.06, 0.17]}
            fontSize={0.26}
            letterSpacing={0.08}
            color="#ffffff"
            outlineWidth={0.018}
            outlineColor="#05140b"
            anchorX="center"
            anchorY="middle"
          >
            {children}
          </Text>
        </group>
      </Float>
    </group>
  );
}
