import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Mesh, type Group, Color } from 'three';

export interface BloodVialProgress3DProps {
  value: number; // 0 - 100
  max?: number;
  label?: string;
  liquidColor?: string;
  width?: number;
  height?: number;
}

/**
 * BloodVialProgress3D
 * 
 * An alchemical glass phial progress meter in 3D WebGL.
 * Features:
 * - Refractive glass test tube with brass filigree cap
 * - Viscous fluid that dynamically fills based on `value / max`
 * - Meniscus fluid surface with gentle sloshing wave physics
 * - High-visibility emissive blood glow with floating micro-bubbles
 * - Inscribed measurement tick marks etched into the glass
 */
export function BloodVialProgress3D({
  value,
  max = 100,
  label = 'Vitality',
  liquidColor = '#ff1744',
  height = 4.2,
}: BloodVialProgress3DProps) {
  const groupRef = useRef<Group>(null);
  const liquidMeshRef = useRef<Mesh>(null);
  const bubblesRef = useRef<Group>(null);

  const fillRatio = Math.min(Math.max(value / max, 0.02), 1.0);
  const liquidHeight = (height * 0.72) * fillRatio;
  const liquidY = -height * 0.38 + liquidHeight / 2;

  const bloodBaseColor = useMemo(() => new Color(liquidColor), [liquidColor]);
  const bloodEmissive = useMemo(() => new Color(liquidColor).multiplyScalar(0.75), [liquidColor]);

  // Subtle fluid sloshing & bubble animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle hover tilt response
    const mouseX = state.mouse.x;
    groupRef.current.rotation.z = -mouseX * 0.15 + Math.sin(t * 1.5) * 0.02;
    groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.08;

    // Micro bubbles rising
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, idx) => {
        bubble.position.y += 0.008 + (idx * 0.002);
        if (bubble.position.y > liquidHeight / 2) {
          bubble.position.y = -liquidHeight / 2;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Lighting for glass & liquid */}
      <ambientLight intensity={0.5} color="#182c20" />
      <pointLight position={[2, 3, 3]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-2, -1, -2]} intensity={0.6} color="#fda4af" />
      <pointLight position={[0, liquidY, 0.8]} intensity={1.8} color="#ff1744" distance={3.0} />

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.15}>
        {/* Brass Ornate Cap */}
        <mesh position={[0, height * 0.42, 0]}>
          <cylinderGeometry args={[0.52, 0.58, 0.45, 24]} />
          <meshStandardMaterial 
            color="#b45309" 
            metalness={0.85} 
            roughness={0.25}
          />
        </mesh>
        {/* Cap Rim Collar */}
        <mesh position={[0, height * 0.38, 0]}>
          <torusGeometry args={[0.54, 0.07, 12, 24]} />
          <meshStandardMaterial 
            color="#d97706" 
            metalness={0.9} 
            roughness={0.2}
          />
        </mesh>

        {/* Outer Glass Cylinder */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.48, 0.48, height * 0.82, 24, 1, true]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.32}
            roughness={0.08}
            metalness={0.1}
            transmission={0.85}
            ior={1.5}
            depthWrite={false}
          />
        </mesh>

        {/* Curved Glass Bottom Hemisphere */}
        <mesh position={[0, -height * 0.46, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.48, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.35}
            roughness={0.08}
            transmission={0.85}
            depthWrite={false}
          />
        </mesh>

        {/* Viscous Liquid Core */}
        <group position={[0, liquidY, 0]}>
          <mesh ref={liquidMeshRef}>
            <cylinderGeometry args={[0.44, 0.44, liquidHeight, 24]} />
            <meshStandardMaterial
              color={bloodBaseColor}
              emissive={bloodEmissive}
              emissiveIntensity={0.65}
              roughness={0.3}
              metalness={0.15}
            />
          </mesh>

          {/* Meniscus Top Cap (Liquid Surface) */}
          <mesh position={[0, liquidHeight / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.43, 24]} />
            <meshStandardMaterial
              color="#fb7185"
              emissive="#f43f5e"
              emissiveIntensity={0.8}
              roughness={0.15}
            />
          </mesh>

          {/* Floating Micro-bubbles inside liquid */}
          <group ref={bubblesRef}>
            <mesh position={[-0.15, -liquidHeight * 0.2, 0.15]}>
              <sphereGeometry args={[0.04, 10, 10]} />
              <meshBasicMaterial color="#ffe4e6" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.18, 0, -0.1]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshBasicMaterial color="#ffe4e6" transparent opacity={0.7} />
            </mesh>
            <mesh position={[-0.05, liquidHeight * 0.25, -0.18]}>
              <sphereGeometry args={[0.05, 10, 10]} />
              <meshBasicMaterial color="#ffe4e6" transparent opacity={0.7} />
            </mesh>
          </group>
        </group>

        {/* Etched Measurement Ticks on Glass */}
        {[-0.3, -0.15, 0, 0.15].map((yOffset, i) => (
          <mesh key={i} position={[0.48, yOffset * (height * 0.7), 0]}>
            <boxGeometry args={[0.04, 0.02, 0.12]} />
            <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.4} />
          </mesh>
        ))}

        {/* Crisp Inscribed Percentage & Label */}
        <Text
          position={[0, -height * 0.62, 0]}
          fontSize={0.24}
          color="#f8fafc"
          outlineWidth={0.012}
          outlineColor="#0f172a"
          anchorX="center"
          anchorY="middle"
        >
          {`${Math.round(fillRatio * 100)}%`}
        </Text>
        {label && (
          <Text
            position={[0, -height * 0.74, 0]}
            fontSize={0.15}
            color="#cbd5e1"
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

