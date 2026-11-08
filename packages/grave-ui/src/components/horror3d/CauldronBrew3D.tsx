import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { type Group, type Mesh } from 'three';
import type { BrewColor } from '../coven/CauldronBrew/CauldronBrew';

export interface CauldronBrew3DProps {
  brewColor?: BrewColor;
  boiling?: boolean;
  scale?: number;
}

const COLOR_MAP: Record<BrewColor, { liquid: string; emissive: string; steam: string; glow: string }> = {
  emerald: { liquid: '#059669', emissive: '#00ff88', steam: '#a7f3d0', glow: '#10b981' },
  witchfire: { liquid: '#7e22ce', emissive: '#c084fc', steam: '#f3e8ff', glow: '#a855f7' },
  blood: { liquid: '#b91c1c', emissive: '#ff1744', steam: '#fecaca', glow: '#ef4444' },
  gold: { liquid: '#d97706', emissive: '#fde047', steam: '#fef3c7', glow: '#fbbf24' },
};

/**
 * CauldronBrew3D
 * 
 * 3D Cast-iron witch's cauldron with radiant, luminous bubbling potion,
 * glowing froth, concentric swirl physics, and voluminous rising steam clouds.
 */
export function CauldronBrew3D({
  brewColor = 'emerald',
  boiling = true,
  scale = 1.6,
}: CauldronBrew3DProps) {
  const groupRef = useRef<Group>(null);
  const liquidRef = useRef<Mesh>(null);
  const innerSwirlRef = useRef<Mesh>(null);
  const bubblesGroup = useRef<Group>(null);
  const steamGroup = useRef<Group>(null);
  const brewLightRef = useRef<any>(null);

  const colors = useMemo(() => COLOR_MAP[brewColor] || COLOR_MAP.emerald, [brewColor]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle cauldron idle breathing
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.12;

    // Liquid swirl with opposing inner harmonic
    if (liquidRef.current) {
      liquidRef.current.rotation.z = t * (boiling ? 0.8 : 0.25);
    }
    if (innerSwirlRef.current) {
      innerSwirlRef.current.rotation.z = -t * (boiling ? 1.2 : 0.4);
    }

    // Dynamic light pulsation from magical reaction
    if (brewLightRef.current) {
      brewLightRef.current.intensity = 3.2 + Math.sin(t * 8) * 0.6 + Math.sin(t * 19) * 0.3;
    }

    // Dynamic bubbling froth
    if (bubblesGroup.current && boiling) {
      bubblesGroup.current.children.forEach((b, idx) => {
        const offset = idx * 0.9;
        const cycle = (t * 2.5 + offset) % 2.0;
        b.position.y = 0.52 + cycle * 0.35;
        b.scale.setScalar(Math.sin((cycle / 2.0) * Math.PI) * 0.16);
      });
    }

    // Rising volumetric potion steam
    if (steamGroup.current && boiling) {
      steamGroup.current.children.forEach((s, idx) => {
        const offset = idx * 0.75;
        const cycle = (t * 1.3 + offset) % 2.8;
        s.position.y = 0.8 + cycle * 0.7;
        s.position.x = Math.sin(t * 1.5 + offset) * 0.32;
        s.position.z = Math.cos(t * 1.2 + offset) * 0.25;
        s.scale.setScalar(0.2 + (cycle / 2.8) * 0.35);
      });
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Scene Illumination */}
      <ambientLight intensity={0.5} color="#15241b" />
      <directionalLight position={[3, 4, 3]} intensity={0.9} color="#f0fdf4" />

      {/* Radiant Glowing Liquid Spotlight illuminating the cauldron rim & surroundings */}
      <pointLight
        ref={brewLightRef}
        position={[0, 0.68, 0]}
        intensity={3.5}
        color={colors.emissive}
        distance={4.8}
        decay={2}
      />

      <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.1}>
        {/* Cast Iron Cauldron Belly */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1.1, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
          <meshStandardMaterial
            color="#141a17"
            roughness={0.78}
            metalness={0.35}
          />
        </mesh>

        {/* Flared Heavy Cast Iron Rim */}
        <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.96, 0.12, 14, 32]} />
          <meshStandardMaterial
            color="#1d2621"
            roughness={0.7}
            metalness={0.4}
          />
        </mesh>

        {/* Forged Iron Side Ring Handles */}
        {[-1.02, 1.02].map((x, idx) => (
          <group key={idx} position={[x, 0.2, 0]}>
            {/* Handle Mount Bracket */}
            <mesh>
              <boxGeometry args={[0.08, 0.14, 0.14]} />
              <meshStandardMaterial color="#2d3732" metalness={0.7} />
            </mesh>
            {/* Hanging Iron Ring */}
            <mesh position={[idx === 0 ? -0.1 : 0.1, -0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.16, 0.03, 8, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Tripod Claw Feet */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.85, -0.75, Math.sin(angle) * 0.85]}
            rotation={[0.35 * Math.sin(angle), 0, -0.35 * Math.cos(angle)]}
          >
            <cylinderGeometry args={[0.09, 0.14, 0.7, 12]} />
            <meshStandardMaterial color="#111613" roughness={0.85} />
          </mesh>
        ))}

        {/* Outer Radiant Potion Surface (Vivid, highly luminous) */}
        <mesh ref={liquidRef} position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.92, 32]} />
          <meshStandardMaterial
            color={colors.liquid}
            emissive={colors.emissive}
            emissiveIntensity={2.4}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>

        {/* Inner Concentric Swirl Ring (Swirling vortex of magical froth) */}
        <mesh ref={innerSwirlRef} position={[0, 0.485, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.72, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>

        {/* Glowing Boiling Bubbles Cluster */}
        <group ref={bubblesGroup}>
          {[
            [-0.35, 0.2],
            [0.28, -0.3],
            [0.1, 0.38],
            [-0.15, -0.25],
            [0.32, 0.18],
            [0.0, 0.0],
          ].map(([bx, bz], idx) => (
            <mesh key={idx} position={[bx, 0.5, bz]}>
              <sphereGeometry args={[0.5, 12, 12]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={colors.emissive}
                emissiveIntensity={2.8}
                roughness={0.1}
              />
            </mesh>
          ))}
        </group>

        {/* Volumetric Potion Vapor Steam Clouds */}
        <group ref={steamGroup}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, 0.8 + i * 0.25, 0]}>
              <sphereGeometry args={[0.38, 12, 12]} />
              <meshBasicMaterial
                color={colors.steam}
                transparent
                opacity={0.25}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
}
