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

const ELEMENT_COLORS: Record<RuneElement, { glow: string; rune: string; rim: string }> = {
  blood: { glow: '#ff1744', rune: '#ff4d6d', rim: '#991b1b' },
  spectral: { glow: '#06b6d4', rune: '#67e8f9', rim: '#0891b2' },
  fire: { glow: '#f97316', rune: '#fdba74', rim: '#c2410c' },
  frost: { glow: '#38bdf8', rune: '#bae6fd', rim: '#0284c7' },
};

/**
 * RunicButton3D
 * 
 * 3D Obsidian tablet button inscribed with Elder Futhark runes.
 * Features:
 * - Magnetic levitation & awakening trembling on pointer hover
 * - Depresses physically into its stone cradle on pointer down
 * - Emissive rune sigils that flare with elemental flame
 * - Synthesized procedural audio click feedback
 */
export function RunicButton3D({
  children = 'Invoke Entity',
  element = 'blood',
  sigils = 'ᚦ ᚨ ᚱ ᚲ ᚷ',
  onClick,
  width = 3.8,
  height = 1.3,
}: RunicButton3DProps) {
  const groupRef = useRef<Group>(null);
  const buttonSlabRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS.blood;

  useFrame((state) => {
    if (!buttonSlabRef.current) return;
    const t = state.clock.elapsedTime;

    // Levitation & depression target
    const targetY = pressed ? -0.1 : hovered ? 0.12 : 0;
    buttonSlabRef.current.position.y += (targetY - buttonSlabRef.current.position.y) * 0.2;

    // Subtle awakening tremor on hover
    if (hovered && !pressed) {
      const shake = Math.sin(t * 30) * 0.008;
      buttonSlabRef.current.rotation.z = shake;
    } else {
      buttonSlabRef.current.rotation.z *= 0.85;
    }
  });

  const handleClick = () => {
    playSound('boneClick');
    onClick?.();
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <ambientLight intensity={0.5} color="#272338" />
      <directionalLight position={[2, 3, 4]} intensity={0.8} color="#ffe8d6" />
      <pointLight
        position={[0, 0.4, 0.8]}
        intensity={hovered ? 1.6 : 0.8}
        color={colors.glow}
        distance={3.5}
      />

      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
        {/* Stone Socket Cradle (Stays grounded) */}
        <mesh position={[0, -0.06, -0.05]}>
          <boxGeometry args={[width + 0.35, height + 0.35, 0.35]} />
          <meshStandardMaterial color="#121118" roughness={0.85} metalness={0.1} />
        </mesh>

        {/* Floating Interactive Obsidian Slab */}
        <group
          ref={buttonSlabRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => { setHovered(false); setPressed(false); }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => { setPressed(false); handleClick(); }}
        >
          {/* Main Obsidian Button Face */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, 0.32]} />
            <meshStandardMaterial
              color="#1a1824"
              roughness={0.4}
              metalness={0.4}
            />
          </mesh>

          {/* Runic Sigils Header */}
          <Text
            position={[0, 0.35, 0.18]}
            fontSize={0.18}
            letterSpacing={0.25}
            color={colors.rune}
            anchorX="center"
            anchorY="middle"
          >
            {sigils}
          </Text>

          {/* Button Inscribed Label */}
          <Text
            position={[0, -0.05, 0.18]}
            fontSize={0.24}
            letterSpacing={0.06}
            color="#f8fafc"
            outlineWidth={0.015}
            outlineColor="#09090e"
            anchorX="center"
            anchorY="middle"
          >
            {children}
          </Text>

          {/* Emissive Underglow Border */}
          <mesh position={[0, 0, 0.155]}>
            <ringGeometry args={[width * 0.46, width * 0.48, 4]} />
            <meshBasicMaterial
              color={colors.glow}
              transparent
              opacity={hovered ? 0.9 : 0.4}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}
