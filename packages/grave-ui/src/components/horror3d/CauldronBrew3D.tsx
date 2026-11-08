import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { type Group, Color, type Mesh } from 'three';
import type { BrewColor } from '../coven/CauldronBrew/CauldronBrew';

export interface CauldronBrew3DProps {
  brewColor?: BrewColor;
  boiling?: boolean;
  scale?: number;
}

const COLOR_MAP: Record<BrewColor, { liquid: string; emissive: string; steam: string }> = {
  emerald: { liquid: '#059669', emissive: '#10b981', steam: '#6ee7b7' },
  witchfire: { liquid: '#6d28d9', emissive: '#a855f7', steam: '#c084fc' },
  blood: { liquid: '#991b1b', emissive: '#ef4444', steam: '#fca5a5' },
  gold: { liquid: '#b45309', emissive: '#fbbf24', steam: '#fde68a' },
};

/**
 * CauldronBrew3D
 * 
 * 3D Cast-iron witch's cauldron with swirling bubbling potion,
 * rising volumetric vapor puffs, and cast iron gothic relief details.
 */
export function CauldronBrew3D({
  brewColor = 'blood',
  boiling = true,
  scale = 1.6,
}: CauldronBrew3DProps) {
  const groupRef = useRef<Group>(null);
  const liquidRef = useRef<Mesh>(null);
  const bubblesGroup = useRef<Group>(null);
  const steamGroup = useRef<Group>(null);

  const colors = useMemo(() => COLOR_MAP[brewColor] || COLOR_MAP.blood, [brewColor]);
  const liquidBase = useMemo(() => new Color(colors.liquid), [colors]);
  const liquidGlow = useMemo(() => new Color(colors.emissive), [colors]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle cauldron idle breathing
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.15;

    // Liquid swirl
    if (liquidRef.current) {
      liquidRef.current.rotation.z = t * (boiling ? 0.6 : 0.2);
    }

    // Bubbles popping logic
    if (bubblesGroup.current && boiling) {
      bubblesGroup.current.children.forEach((b, idx) => {
        const offset = idx * 1.5;
        const cycle = (t * 2 + offset) % 2;
        b.position.y = 0.5 + cycle * 0.35;
        b.scale.setScalar(Math.sin(cycle * Math.PI) * 0.18);
      });
    }

    // Steam particles rising & fading
    if (steamGroup.current && boiling) {
      steamGroup.current.children.forEach((s, idx) => {
        const offset = idx * 0.9;
        const cycle = (t * 1.2 + offset) % 3;
        s.position.y = 0.8 + cycle * 0.6;
        s.position.x = Math.sin(t + offset) * 0.35;
        s.scale.setScalar(0.25 + cycle * 0.2);
      });
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* High-visibility gothic illumination */}
      <ambientLight intensity={0.55} color="#272338" />
      <directionalLight position={[3, 4, 3]} intensity={0.9} color="#ffe8d6" />
      <pointLight position={[0, 0.9, 0]} intensity={1.5} color={colors.emissive} distance={4} />

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.12}>
        {/* Cast Iron Belly */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1.1, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
          <meshStandardMaterial
            color="#1c1924"
            roughness={0.75}
            metalness={0.35}
          />
        </mesh>

        {/* Flared Iron Rim */}
        <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.12, 14, 28]} />
          <meshStandardMaterial
            color="#282433"
            roughness={0.65}
            metalness={0.4}
          />
        </mesh>

        {/* Cauldron Tripod Legs */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 0.85, -0.75, Math.sin(angle) * 0.85]}
            rotation={[0.35 * Math.sin(angle), 0, -0.35 * Math.cos(angle)]}
          >
            <cylinderGeometry args={[0.09, 0.14, 0.7, 12]} />
            <meshStandardMaterial color="#17151e" roughness={0.8} />
          </mesh>
        ))}

        {/* Swirling Potion Liquid Surface */}
        <mesh ref={liquidRef} position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9, 24]} />
          <meshStandardMaterial
            color={liquidBase}
            emissive={liquidGlow}
            emissiveIntensity={0.85}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Popping Bubbles */}
        <group ref={bubblesGroup}>
          <mesh position={[-0.35, 0.5, 0.2]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color={colors.emissive} emissive={colors.emissive} emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0.25, 0.5, -0.3]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color={colors.emissive} emissive={colors.emissive} emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0.1, 0.5, 0.35]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color={colors.emissive} emissive={colors.emissive} emissiveIntensity={1.2} />
          </mesh>
        </group>

        {/* Rising Vapor Steam Clouds */}
        <group ref={steamGroup}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0.8 + i * 0.3, 0]}>
              <sphereGeometry args={[0.4, 12, 12]} />
              <meshBasicMaterial
                color={colors.steam}
                transparent
                opacity={0.22}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
}

