import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';
import { playSound } from '../../audio';

export interface CoffinAccordion3DProps {
  title?: string;
  content?: string;
  initialOpen?: boolean;
}

/**
 * CoffinAccordion3D
 * 
 * 3D Gothic hexagonal pine & iron casket with animated hinged lid,
 * quilted crimson velvet interior lining, and click-to-open interaction.
 */
export function CoffinAccordion3D({
  title = "Count Dracula's Sarcophagus",
  content = 'Resting in Transylvanian soil. Do not disturb before sundown.',
  initialOpen = false,
}: CoffinAccordion3DProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const lidHingeRef = useRef<Group>(null);

  useFrame(() => {
    if (!lidHingeRef.current) return;
    // Smooth hinge swing open to -1.4 radians
    const targetAngle = isOpen ? -1.35 : 0;
    lidHingeRef.current.rotation.y += (targetAngle - lidHingeRef.current.rotation.y) * 0.12;
  });

  const handleToggle = () => {
    playSound('coffinCreak');
    setIsOpen(!isOpen);
  };

  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.5} color="#272338" />
      <directionalLight position={[3, 4, 3]} intensity={0.8} color="#ffe8d6" />
      <pointLight position={[0, 0, 1.2]} intensity={0.6} color="#fda4af" distance={2.5} />

      <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.1}>
        <group onClick={handleToggle}>
          {/* Casket Bottom Base (Quilted Crimson Interior) */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 4.4, 0.6]} />
            <meshStandardMaterial
              color="#2a1215"
              roughness={0.8}
            />
          </mesh>

          {/* Inner Crimson Satin Cushion */}
          <mesh position={[0, 0, 0.15]}>
            <boxGeometry args={[1.9, 4.0, 0.35]} />
            <meshStandardMaterial
              color="#991b1b"
              emissive="#7f1d1d"
              emissiveIntensity={0.3}
              roughness={0.5}
            />
          </mesh>

          {/* Animated Hinged Lid (Hinged at left edge x = -1.1) */}
          <group ref={lidHingeRef} position={[-1.1, 0, 0.3]}>
            {/* Lid Slab */}
            <mesh position={[1.1, 0, 0.08]} castShadow>
              <boxGeometry args={[2.2, 4.4, 0.16]} />
              <meshStandardMaterial
                color="#1e1822"
                roughness={0.7}
                metalness={0.2}
              />
            </mesh>

            {/* Iron Cross Relief on Lid */}
            <mesh position={[1.1, 0.3, 0.18]}>
              <boxGeometry args={[0.22, 1.8, 0.06]} />
              <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.4} />
            </mesh>
            <mesh position={[1.1, 0.6, 0.18]}>
              <boxGeometry args={[1.0, 0.22, 0.06]} />
              <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.4} />
            </mesh>

            {/* Inscribed Casket Title on Lid */}
            <Text
              position={[1.1, -1.2, 0.2]}
              fontSize={0.18}
              maxWidth={1.9}
              textAlign="center"
              color="#e2e8f0"
              outlineWidth={0.012}
              outlineColor="#0f172a"
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
              color="#fecdd3"
              anchorX="center"
              anchorY="middle"
            >
              {content}
            </Text>
          )}

          {/* Click instruction hint */}
          <Text
            position={[0, -2.6, 0]}
            fontSize={0.14}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            {isOpen ? 'Click casket to seal' : 'Click casket to unseal lid'}
          </Text>
        </group>
      </Float>
    </group>
  );
}
