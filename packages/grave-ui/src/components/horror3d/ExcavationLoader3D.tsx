import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';

export interface ExcavationLoader3DProps {
  message?: string;
  speed?: 'slow' | 'normal' | 'fast';
  scale?: number;
}

const SPEED_FACTORS = {
  slow: 0.7,
  normal: 1.2,
  fast: 2.0,
};

/**
 * ExcavationLoader3D
 * 
 * 3D Graveyard excavation loader with rotating bone shovel,
 * parabolic flying dirt particles, and emerging skeletal fingers.
 */
export function ExcavationLoader3D({
  message = 'Excavating cursed ground...',
  speed = 'normal',
  scale = 1.5,
}: ExcavationLoader3DProps) {
  const groupRef = useRef<Group>(null);
  const shovelRef = useRef<Group>(null);
  const dirtParticlesRef = useRef<Group>(null);
  const skeletalHandRef = useRef<Group>(null);

  const speedMultiplier = SPEED_FACTORS[speed] || 1.2;

  useFrame((state) => {
    if (!shovelRef.current || !dirtParticlesRef.current) return;
    const t = state.clock.elapsedTime * speedMultiplier;

    // Digging stroke physics
    const stroke = (t * 2) % (Math.PI * 2);
    shovelRef.current.rotation.z = Math.sin(stroke) * 0.45;
    shovelRef.current.position.y = -0.2 + Math.cos(stroke) * 0.25;
    shovelRef.current.position.x = Math.sin(stroke) * 0.15;

    // Dirt particles parabolic fling
    dirtParticlesRef.current.children.forEach((p, idx) => {
      const pOffset = idx * 0.8;
      const progress = (t * 2.5 + pOffset) % 1.5;
      p.position.x = 0.3 + progress * 0.8;
      p.position.y = 0.2 + Math.sin(progress * 2) * 0.6 - (progress * progress * 0.4);
      p.scale.setScalar(Math.max(0.08 - progress * 0.04, 0.01));
    });

    // Skeletal hand clawing up subtly
    if (skeletalHandRef.current) {
      skeletalHandRef.current.position.y = -0.3 + Math.sin(t * 0.8) * 0.08;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <ambientLight intensity={0.55} color="#2b2338" />
      <directionalLight position={[3, 4, 3]} intensity={0.8} color="#ffe8d6" />
      <pointLight position={[0, -0.2, 0.8]} intensity={0.6} color="#d97706" distance={2} />

      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.08}>
        {/* Graveyard Soil Mound */}
        <mesh position={[0, -0.7, 0]} receiveShadow>
          <sphereGeometry args={[1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
          <meshStandardMaterial
            color="#261e1b"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>

        {/* Skeletal Claw Emerging from Mound */}
        <group ref={skeletalHandRef} position={[-0.4, -0.3, 0.2]} rotation={[0.2, 0.3, -0.2]}>
          {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
            <mesh key={i} position={[x, 0.25, 0]} rotation={[0.4 + i * 0.1, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.03, 0.4, 8]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
          ))}
          {/* Wrist bone */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.3, 8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.7} />
          </mesh>
        </group>

        {/* Bone Shovel Tool */}
        <group ref={shovelRef} position={[0.2, 0.2, 0.1]}>
          {/* Shovel Shaft */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 10]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
          </mesh>
          {/* Shovel Handle Grip */}
          <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.6} />
          </mesh>
          {/* Iron Spade Blade */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.42, 0.48, 0.06]} />
            <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.7} />
          </mesh>
        </group>

        {/* Ejected Dirt Particles */}
        <group ref={dirtParticlesRef}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#78350f" roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Inscribed Status Label */}
        {message && (
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.2}
            letterSpacing={0.06}
            color="#f1f5f9"
            outlineWidth={0.012}
            outlineColor="#09090e"
            anchorX="center"
            anchorY="middle"
          >
            {message}
          </Text>
        )}
      </Float>
    </group>
  );
}

