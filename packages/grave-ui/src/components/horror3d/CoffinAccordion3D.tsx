import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group, type Mesh } from 'three';
import { playSound } from '../../audio';

export interface CoffinAccordion3DProps {
  title?: string;
  content?: string;
  initialOpen?: boolean;
}

/**
 * CoffinAccordion3D
 * 
 * 3D Gothic hexagonal pine & iron casket with an animated hinged lid,
 * intensely glowing arterial crimson blood cross & veins, internal sanguine spotlight,
 * quilted crimson velvet interior lining, and click-to-open interaction.
 */
export function CoffinAccordion3D({
  title = "Count Dracula's Sarcophagus",
  content = 'Resting in Transylvanian soil. Do not disturb before sundown.',
  initialOpen = false,
}: CoffinAccordion3DProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const lidHingeRef = useRef<Group>(null);
  const crossVertRef = useRef<Mesh>(null);
  const crossHorizRef = useRef<Mesh>(null);
  const innerLightRef = useRef<any>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Smooth hinge swing open to -1.35 radians
    if (lidHingeRef.current) {
      const targetAngle = isOpen ? -1.35 : 0;
      lidHingeRef.current.rotation.y += (targetAngle - lidHingeRef.current.rotation.y) * 0.12;
    }

    // Coffin cross pulsing blood glow
    const pulseGlow = 2.4 + Math.sin(t * 3.5) * 0.8 + Math.sin(t * 7.0) * 0.3;
    if (crossVertRef.current && (crossVertRef.current.material as any)) {
      (crossVertRef.current.material as any).emissiveIntensity = pulseGlow;
    }
    if (crossHorizRef.current && (crossHorizRef.current.material as any)) {
      (crossHorizRef.current.material as any).emissiveIntensity = pulseGlow;
    }

    // Inner blood light flare
    if (innerLightRef.current) {
      innerLightRef.current.intensity = isOpen ? 3.8 : 1.2 + Math.sin(t * 2) * 0.4;
    }
  });

  const handleToggle = () => {
    playSound('coffinCreak');
    setIsOpen(!isOpen);
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Ambient & Directional Scene Lighting */}
      <ambientLight intensity={0.7} color="#cbd5e1" />
      <directionalLight position={[3, 4, 3]} intensity={1.0} color="#f0fdf4" />

      {/* Internal Searing Blood Light emanating from the casket */}
      <pointLight
        ref={innerLightRef}
        position={[0, 0, 0.45]}
        intensity={2.0}
        color="#ff1744"
        distance={4.5}
        decay={2}
      />

      <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.08}>
        <group onClick={handleToggle}>
          {/* Casket Bottom Base - Dark Walnut / Slate */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 4.4, 0.6]} />
            <meshStandardMaterial
              color="#35262c"
              roughness={0.8}
            />
          </mesh>

          {/* Glowing Red Inner Cushion Base */}
          <mesh position={[0, 0, 0.15]}>
            <boxGeometry args={[1.9, 4.0, 0.35]} />
            <meshStandardMaterial
              color="#880816"
              emissive="#ff1744"
              emissiveIntensity={0.65}
              roughness={0.4}
            />
          </mesh>

          {/* Animated Hinged Lid (Hinged at left edge x = -1.1) */}
          <group ref={lidHingeRef} position={[-1.1, 0, 0.3]}>
            {/* Lid Slab - Weathered Dark Obsidian Wood */}
            <mesh position={[1.1, 0, 0.08]} castShadow>
              <boxGeometry args={[2.2, 4.4, 0.16]} />
              <meshStandardMaterial
                color="#261e2b"
                roughness={0.7}
                metalness={0.2}
              />
            </mesh>

            {/* Glowing Arterial Blood Cross on Lid */}
            {/* Vertical Beam */}
            <mesh ref={crossVertRef} position={[1.1, 0.3, 0.18]}>
              <boxGeometry args={[0.22, 1.9, 0.06]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ff1744"
                emissiveIntensity={2.5}
                roughness={0.2}
              />
            </mesh>
            {/* Horizontal Beam */}
            <mesh ref={crossHorizRef} position={[1.1, 0.65, 0.18]}>
              <boxGeometry args={[1.1, 0.22, 0.06]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ff1744"
                emissiveIntensity={2.5}
                roughness={0.2}
              />
            </mesh>

            {/* Inlaid Glowing Blood Vein Channels Spreading Across Lid */}
            {[-0.35, 0.35].map((xOffset, idx) => (
              <mesh key={idx} position={[1.1 + xOffset, 0.3, 0.17]}>
                <boxGeometry args={[0.025, 1.4, 0.02]} />
                <meshStandardMaterial
                  color="#ff1744"
                  emissive="#ff1744"
                  emissiveIntensity={2.2}
                />
              </mesh>
            ))}
            {[-0.65, 0.65].map((yOffset, idx) => (
              <mesh key={idx} position={[1.1, 0.3 + yOffset, 0.17]}>
                <boxGeometry args={[1.4, 0.025, 0.02]} />
                <meshStandardMaterial
                  color="#ff1744"
                  emissive="#ff1744"
                  emissiveIntensity={2.2}
                />
              </mesh>
            ))}

            {/* Inscribed Casket Title on Lid */}
            <Text
              position={[1.1, -1.2, 0.2]}
              fontSize={0.18}
              maxWidth={1.9}
              textAlign="center"
              color="#f8fafc"
              outlineWidth={0.015}
              outlineColor="#050a0f"
              anchorX="center"
              anchorY="middle"
            >
              {title}
            </Text>
          </group>

          {/* Hidden Content Revealed When Open */}
          {isOpen && (
            <Text
              position={[0, 0, 0.38]}
              fontSize={0.16}
              maxWidth={1.7}
              textAlign="center"
              color="#fecaca"
              outlineWidth={0.012}
              outlineColor="#450a0a"
              anchorX="center"
              anchorY="middle"
            >
              {content}
            </Text>
          )}

          {/* Unseal Click Indicator Callout */}
          <Text
            position={[0, -2.4, 0.3]}
            fontSize={0.13}
            letterSpacing={0.08}
            color="#ff4d6d"
            outlineWidth={0.012}
            outlineColor="#05140b"
            anchorX="center"
            anchorY="middle"
          >
            {isOpen ? "CLICK TO RESEAL CASKET" : "CLICK COFFIN TO UNSEAL LID"}
          </Text>
        </group>
      </Float>
    </group>
  );
}
