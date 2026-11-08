import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';
import { playSound } from '../../audio';

export interface CobwebCorner3DProps {
  scale?: number;
}

/**
 * CobwebCorner3D
 * 
 * 3D Procedural silk cobweb corner with depth, glistening dew droplets,
 * and an articulated arachnid that descends dynamically on pointer hover.
 */
export function CobwebCorner3D({ scale = 1.6 }: CobwebCorner3DProps) {
  const groupRef = useRef<Group>(null);
  const spiderRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!spiderRef.current) return;
    // Spider drops down on silk thread when hovered
    const targetY = hovered ? -1.2 : 0.4;
    spiderRef.current.position.y += (targetY - spiderRef.current.position.y) * 0.1;
  });

  const handlePointerEnter = () => {
    setHovered(true);
    playSound('boneClick');
  };

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
      <ambientLight intensity={0.55} color="#2b2038" />
      <pointLight position={[1, 1, 1.5]} intensity={1.2} color="#67e8f9" distance={4} />

      <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.06}>
        <group
          onPointerEnter={handlePointerEnter}
          onPointerLeave={() => setHovered(false)}
        >
          {/* Radial Structural Silk Spokes */}
          {[0, 15, 30, 45, 60, 75, 90].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.cos(rad) * 0.9, Math.sin(rad) * 0.9, 0]} rotation={[0, 0, rad]}>
                <cylinderGeometry args={[0.008, 0.008, 1.9, 6]} />
                <meshStandardMaterial
                  color="#e2e8f0"
                  emissive="#67e8f9"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            );
          })}

          {/* Concentric Spiral Threads */}
          {[0.5, 0.9, 1.3, 1.7].map((r, idx) => (
            <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r, r + 0.015, 32, 1, 0, Math.PI / 2]} />
              <meshStandardMaterial
                color="#e2e8f0"
                emissive="#67e8f9"
                emissiveIntensity={0.3}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}

          {/* Glistening Dew Droplets */}
          {[
            [0.6, 0.4, 0.05],
            [0.3, 0.8, 0.05],
            [1.1, 0.5, 0.05],
            [0.7, 1.1, 0.05],
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color="#67e8f9" emissive="#06b6d4" emissiveIntensity={0.8} />
            </mesh>
          ))}

          {/* Dangling Spider on Silk Line */}
          <group ref={spiderRef} position={[0.7, 0.4, 0.1]}>
            {/* Silk Thread from top to spider */}
            <mesh position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 2.0, 6]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>

            {/* Spider Abdomen */}
            <mesh position={[0, -0.15, 0]}>
              <sphereGeometry args={[0.18, 14, 14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Spider Cephalothorax */}
            <mesh position={[0, 0.05, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
            {/* Glowing Red Arachnid Eyes */}
            <mesh position={[-0.04, 0.1, 0.1]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.04, 0.1, 0.1]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>

            {/* 8 Articulated Spidery Legs */}
            {[-1, 1].map((side) =>
              [-0.1, 0, 0.1, 0.2].map((y, legIdx) => (
                <mesh
                  key={`${side}-${legIdx}`}
                  position={[side * 0.22, y, 0]}
                  rotation={[0, 0, side * (0.8 + legIdx * 0.2)]}
                >
                  <cylinderGeometry args={[0.012, 0.012, 0.45, 6]} />
                  <meshStandardMaterial color="#09090b" roughness={0.6} />
                </mesh>
              ))
            )}
          </group>

          {/* Interactive instruction text */}
          <Text
            position={[0.7, -1.8, 0]}
            fontSize={0.16}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            Hover web to trigger spider drop
          </Text>
        </group>
      </Float>
    </group>
  );
}
