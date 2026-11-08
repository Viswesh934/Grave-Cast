import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';
import { playSound } from '../../audio';

export interface ChickenLegStepper3DProps {
  currentStep?: number;
  totalSteps?: number;
  stepTitle?: string;
  onNext?: () => void;
  scale?: number;
}

/**
 * ChickenLegStepper3D
 * 
 * 3D Slavic Baba Yaga walking hut standing on giant scaly chicken legs
 * that alternate stomping into the earth as workflow steps advance.
 */
export function ChickenLegStepper3D({
  currentStep = 1,
  totalSteps = 4,
  stepTitle = 'Find Dead Code',
  onNext,
  scale = 1.4,
}: ChickenLegStepper3DProps) {
  const groupRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const smokeRef = useRef<Group>(null);

  useFrame((state) => {
    if (!leftLegRef.current || !rightLegRef.current) return;
    const t = state.clock.elapsedTime * 2.5;

    // Alternating leg walking / stomping cycle
    leftLegRef.current.position.y = -1.1 + Math.max(0, Math.sin(t) * 0.25);
    leftLegRef.current.rotation.x = Math.sin(t) * 0.2;

    rightLegRef.current.position.y = -1.1 + Math.max(0, Math.sin(t + Math.PI) * 0.25);
    rightLegRef.current.rotation.x = Math.sin(t + Math.PI) * 0.2;

    // Chimney smoke puffs rising
    if (smokeRef.current) {
      smokeRef.current.children.forEach((p, idx) => {
        const offset = idx * 0.7;
        const cycle = (t * 0.5 + offset) % 2;
        p.position.y = 1.6 + cycle * 0.6;
        p.position.x = 0.4 + Math.sin(t + offset) * 0.15;
        p.scale.setScalar(0.08 + cycle * 0.08);
      });
    }
  });

  const handleClick = () => {
    playSound('boneClick');
    onNext?.();
  };

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} position={[0, 0, 0]}>
      <ambientLight intensity={0.55} color="#2b2338" />
      <directionalLight position={[3, 4, 3]} intensity={0.8} color="#fed7aa" />
      <pointLight position={[0, 0.4, 0.8]} intensity={1.0} color="#f59e0b" distance={3} />

      <Float speed={1.3} rotationIntensity={0.06} floatIntensity={0.1}>
        <group onClick={handleClick}>
          {/* Wooden Log Hut Body */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.8, 1.4, 1.6]} />
            <meshStandardMaterial color="#451a03" roughness={0.85} />
          </mesh>

          {/* Steep Gothic Peaked Roof */}
          <mesh position={[0, 1.45, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.5, 0.9, 4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>

          {/* Crooked Chimney */}
          <mesh position={[0.45, 1.7, 0]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.12, 0.14, 0.6, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>

          {/* Chimney Smoke Puffs */}
          <group ref={smokeRef}>
            {[0, 1, 2].map((i) => (
              <mesh key={i}>
                <sphereGeometry args={[1, 10, 10]} />
                <meshBasicMaterial color="#cbd5e1" transparent opacity={0.3} depthWrite={false} />
              </mesh>
            ))}
          </group>

          {/* Glowing Hut Window (Baba Yaga's Hearth) */}
          <mesh position={[0, 0.45, 0.82]}>
            <boxGeometry args={[0.45, 0.45, 0.05]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.8}
            />
          </mesh>

          {/* Scaly Left Chicken Leg */}
          <group ref={leftLegRef} position={[-0.5, -1.1, 0]}>
            {/* Thigh */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.1, 0.08, 0.6, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
            {/* Shin */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.06, 0.6, 8]} />
              <meshStandardMaterial color="#b45309" roughness={0.6} />
            </mesh>
            {/* Talons / Claws */}
            {[-0.15, 0, 0.15].map((angle, i) => (
              <mesh key={i} position={[angle, -0.3, 0.12]} rotation={[0.4, 0, angle * 1.5]}>
                <coneGeometry args={[0.04, 0.35, 6]} />
                <meshStandardMaterial color="#1c1917" roughness={0.5} />
              </mesh>
            ))}
          </group>

          {/* Scaly Right Chicken Leg */}
          <group ref={rightLegRef} position={[0.5, -1.1, 0]}>
            {/* Thigh */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.1, 0.08, 0.6, 8]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
            {/* Shin */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.07, 0.06, 0.6, 8]} />
              <meshStandardMaterial color="#b45309" roughness={0.6} />
            </mesh>
            {/* Talons / Claws */}
            {[-0.15, 0, 0.15].map((angle, i) => (
              <mesh key={i} position={[angle, -0.3, 0.12]} rotation={[0.4, 0, angle * 1.5]}>
                <coneGeometry args={[0.04, 0.35, 6]} />
                <meshStandardMaterial color="#1c1917" roughness={0.5} />
              </mesh>
            ))}
          </group>

          {/* Inscribed Stepper Label */}
          <Text
            position={[0, -1.8, 0]}
            fontSize={0.22}
            letterSpacing={0.06}
            color="#f1f5f9"
            outlineWidth={0.012}
            outlineColor="#09090e"
            anchorX="center"
            anchorY="middle"
          >
            {`Step ${currentStep} of ${totalSteps}: ${stepTitle}`}
          </Text>
          <Text
            position={[0, -2.05, 0]}
            fontSize={0.14}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            Click to stomp to next step
          </Text>
        </group>
      </Float>
    </group>
  );
}
