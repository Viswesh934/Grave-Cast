import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';
import type { OssuaryPattern } from '../crypt/BoneOssuaryDivider/BoneOssuaryDivider';

export interface BoneOssuaryDivider3DProps {
  label?: string;
  pattern?: OssuaryPattern;
  width?: number;
}

/**
 * BoneOssuaryDivider3D
 * 
 * 3D Sculptural ossuary wall relief featuring crossed femur bones
 * and weathered human skulls with glowing spectral eye sockets.
 */
export function BoneOssuaryDivider3D({
  label = 'Catacombs Reliquary',
  pattern = 'crossed',
  width = 6.0,
}: BoneOssuaryDivider3DProps) {
  const groupRef = useRef<Group>(null);
  const leftEyeRef = useRef<Group>(null);
  const rightEyeRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Subtle breathing of the bone structure
    const breathe = Math.sin(t * 0.6) * 0.015;
    groupRef.current.scale.set(1 + breathe, 1 + breathe, 1);

    // Eye socket spectral flame flicker
    const flicker = 0.7 + Math.sin(t * 12) * 0.15 + Math.sin(t * 22) * 0.1;
    if (leftEyeRef.current) leftEyeRef.current.scale.setScalar(flicker);
    if (rightEyeRef.current) rightEyeRef.current.scale.setScalar(flicker);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <ambientLight intensity={0.5} color="#2b2638" />
      <directionalLight position={[3, 4, 3]} intensity={0.8} color="#ffe8d6" />

      <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.08}>
        {/* Horizontal Vellum Wall Rule Bar */}
        <mesh position={[0, 0, -0.15]}>
          <boxGeometry args={[width, 0.08, 0.1]} />
          <meshStandardMaterial color="#334155" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Outer Flanking Bones */}
        {[-2.2, 2.2].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            {/* Horizontal femur */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 1.2, 12]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
            </mesh>
            {/* Bone knobs */}
            <mesh position={[-0.6, 0.06, 0]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
            <mesh position={[-0.6, -0.06, 0]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
            <mesh position={[0.6, 0.06, 0]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
            <mesh position={[0.6, -0.06, 0]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Central Crossed Bones (if crossed pattern) */}
        {pattern === 'crossed' && (
          <group position={[0, 0, -0.05]}>
            <mesh rotation={[0, 0, 0.78]}>
              <cylinderGeometry args={[0.08, 0.08, 2.2, 12]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.65} />
            </mesh>
            <mesh rotation={[0, 0, -0.78]}>
              <cylinderGeometry args={[0.08, 0.08, 2.2, 12]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.65} />
            </mesh>
          </group>
        )}

        {/* Central Weathered Human Skull */}
        <group position={[0, 0, 0.15]}>
          {/* Cranium */}
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.55, 18, 18]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
          </mesh>
          {/* Jaw / Maxilla */}
          <mesh position={[0, -0.22, 0.1]}>
            <boxGeometry args={[0.42, 0.35, 0.4]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.65} />
          </mesh>
          {/* Eye sockets with spectral cyan flames */}
          <group ref={leftEyeRef} position={[-0.18, 0.12, 0.42]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#020617" emissive="#06b6d4" emissiveIntensity={1.5} />
            <pointLight color="#06b6d4" intensity={0.6} distance={1.2} />
          </group>
          <group ref={rightEyeRef} position={[0.18, 0.12, 0.42]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color="#020617" emissive="#06b6d4" emissiveIntensity={1.5} />
            <pointLight color="#06b6d4" intensity={0.6} distance={1.2} />
          </group>
          {/* Nasal cavity */}
          <mesh position={[0, -0.05, 0.46]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.07, 0.16, 3]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
        </group>

        {/* Inscription Label Below Skull */}
        {label && (
          <Text
            position={[0, -0.72, 0.1]}
            fontSize={0.2}
            letterSpacing={0.08}
            color="#f1f5f9"
            outlineWidth={0.012}
            outlineColor="#0f172a"
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        )}
      </Float>
    </group>
  );
}

