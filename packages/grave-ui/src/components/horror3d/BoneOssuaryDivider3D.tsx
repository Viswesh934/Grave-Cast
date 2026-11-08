import { useRef, useMemo } from 'react';
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
 * DancingFlameRibbons - Dynamic multi-tongue procedural fire licking from the skull
 */
function SkullFireRibbons() {
  const flamesRef = useRef<Group>(null);
  const eyeLeftFireRef = useRef<Group>(null);
  const eyeRightFireRef = useRef<Group>(null);
  const embersRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Cranium top flames curling and swaying
    if (flamesRef.current) {
      flamesRef.current.children.forEach((flame, i) => {
        const offset = i * 0.85;
        const sway = Math.sin(t * 7.0 + offset) * 0.08;
        const stretch = 1.0 + Math.sin(t * 11.0 + offset) * 0.22;
        flame.position.x = flame.userData.baseX + sway;
        flame.position.z = flame.userData.baseZ + Math.cos(t * 6.0 + offset) * 0.06;
        flame.scale.set(1.0 + Math.sin(t * 9.0 + offset) * 0.15, stretch, 1.0);
        flame.rotation.z = sway * 1.5;
      });
    }

    // Eye socket flames licking forward
    if (eyeLeftFireRef.current) {
      const flicker = 0.85 + Math.sin(t * 14) * 0.2 + Math.sin(t * 23) * 0.1;
      eyeLeftFireRef.current.scale.setScalar(flicker);
      eyeLeftFireRef.current.rotation.z = Math.sin(t * 8) * 0.2;
    }
    if (eyeRightFireRef.current) {
      const flicker = 0.85 + Math.sin(t * 16 + 1.2) * 0.2 + Math.sin(t * 21) * 0.1;
      eyeRightFireRef.current.scale.setScalar(flicker);
      eyeRightFireRef.current.rotation.z = -Math.sin(t * 8 + 0.8) * 0.2;
    }

    // Rising burning embers
    if (embersRef.current) {
      embersRef.current.children.forEach((ember, i) => {
        const offset = i * 0.6;
        const cycle = (t * 1.8 + offset) % 2.5;
        ember.position.y = 0.8 + cycle * 0.7;
        ember.position.x = Math.sin(t * 3.0 + offset) * 0.35 + (i % 3 - 1) * 0.18;
        ember.position.z = Math.cos(t * 2.5 + offset) * 0.2;
        ember.scale.setScalar(Math.max(0.01, 0.04 * (1 - cycle / 2.5)));
      });
    }
  });

  const flamePositions = useMemo(() => [
    { x: -0.22, y: 0.65, z: 0.0, h: 0.65, r: 0.11, color: '#ff6b00' },
    { x: -0.08, y: 0.75, z: 0.05, h: 0.85, r: 0.14, color: '#ffea00' },
    { x: 0.08, y: 0.78, z: -0.05, h: 0.9, r: 0.14, color: '#ff9100' },
    { x: 0.22, y: 0.68, z: 0.02, h: 0.68, r: 0.12, color: '#ff4d00' },
    { x: -0.15, y: 0.58, z: 0.15, h: 0.55, r: 0.09, color: '#ff1744' },
    { x: 0.15, y: 0.6, z: 0.15, h: 0.58, r: 0.09, color: '#ff6b00' },
    { x: 0.0, y: 0.85, z: 0.0, h: 0.95, r: 0.12, color: '#fff066' },
  ], []);

  return (
    <group>
      {/* Cranium Top Fire Tongues */}
      <group ref={flamesRef}>
        {flamePositions.map((f, i) => (
          <group
            key={i}
            position={[f.x, f.y, f.z]}
            userData={{ baseX: f.x, baseZ: f.z }}
          >
            {/* Outer flame cone */}
            <mesh position={[0, f.h * 0.45, 0]}>
              <coneGeometry args={[f.r, f.h, 8]} />
              <meshBasicMaterial
                color={f.color}
                transparent
                opacity={0.85}
                depthWrite={false}
              />
            </mesh>
            {/* Inner hot white/yellow core */}
            <mesh position={[0, f.h * 0.3, 0]}>
              <coneGeometry args={[f.r * 0.5, f.h * 0.6, 6]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.9}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Left Eye Socket Fire Jet */}
      <group ref={eyeLeftFireRef} position={[-0.19, 0.18, 0.52]}>
        <mesh rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.07, 0.35, 8]} />
          <meshBasicMaterial color="#ff7b00" transparent opacity={0.88} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.08, 0.05]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.035, 0.2, 6]} />
          <meshBasicMaterial color="#fffb8f" />
        </mesh>
      </group>

      {/* Right Eye Socket Fire Jet */}
      <group ref={eyeRightFireRef} position={[0.19, 0.18, 0.52]}>
        <mesh rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.07, 0.35, 8]} />
          <meshBasicMaterial color="#ff7b00" transparent opacity={0.88} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.08, 0.05]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.035, 0.2, 6]} />
          <meshBasicMaterial color="#fffb8f" />
        </mesh>
      </group>

      {/* Rising Floating Embers */}
      <group ref={embersRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#ffb703' : '#ff1744'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * AnatomicalSkull - Anatomically sculpted human skull with realistic brow ridge,
 * zygomatic cheekbones, nasal cavity, tooth arcade, and jaw.
 */
function AnatomicalSkull() {
  return (
    <group position={[0, 0.05, 0.2]}>
      {/* 1. Cranium Vault (Parietal, Frontal & Occipital bone) */}
      <mesh position={[0, 0.28, -0.05]} castShadow>
        <sphereGeometry args={[0.56, 24, 20]} />
        <meshStandardMaterial
          color="#dfd6c8"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Temporal fossa flattening on sides */}
      <mesh position={[-0.42, 0.26, -0.08]}>
        <boxGeometry args={[0.18, 0.38, 0.5]} />
        <meshStandardMaterial color="#cfc5b4" roughness={0.75} />
      </mesh>
      <mesh position={[0.42, 0.26, -0.08]}>
        <boxGeometry args={[0.18, 0.38, 0.5]} />
        <meshStandardMaterial color="#cfc5b4" roughness={0.75} />
      </mesh>

      {/* 2. Heavy Supraorbital Brow Ridges (Arched bone above sockets) */}
      <mesh position={[-0.2, 0.32, 0.38]} rotation={[0.3, 0.2, -0.15]}>
        <boxGeometry args={[0.32, 0.09, 0.16]} />
        <meshStandardMaterial color="#e5ddd0" roughness={0.65} />
      </mesh>
      <mesh position={[0.2, 0.32, 0.38]} rotation={[0.3, -0.2, 0.15]}>
        <boxGeometry args={[0.32, 0.09, 0.16]} />
        <meshStandardMaterial color="#e5ddd0" roughness={0.65} />
      </mesh>

      {/* 3. Deep Conical Eye Sockets (Orbital Cavities) */}
      {/* Left Socket Void */}
      <mesh position={[-0.19, 0.18, 0.44]} rotation={[0.15, 0.1, 0]}>
        <cylinderGeometry args={[0.14, 0.07, 0.25, 12]} />
        <meshStandardMaterial color="#0a080c" roughness={0.9} />
      </mesh>
      {/* Right Socket Void */}
      <mesh position={[0.19, 0.18, 0.44]} rotation={[0.15, -0.1, 0]}>
        <cylinderGeometry args={[0.14, 0.07, 0.25, 12]} />
        <meshStandardMaterial color="#0a080c" roughness={0.9} />
      </mesh>

      {/* 4. Piriform Aperture (Nasal Cavity - Inverted Pear) */}
      <mesh position={[0, -0.01, 0.47]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.075, 0.18, 6]} />
        <meshStandardMaterial color="#070608" roughness={0.95} />
      </mesh>

      {/* 5. Zygomatic Arches (Flaring Cheekbone Struts) */}
      <mesh position={[-0.41, 0.08, 0.22]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.35]} />
        <meshStandardMaterial color="#d8cebf" roughness={0.7} />
      </mesh>
      <mesh position={[0.41, 0.08, 0.22]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.35]} />
        <meshStandardMaterial color="#d8cebf" roughness={0.7} />
      </mesh>

      {/* 6. Maxilla (Upper Jaw & Tooth Arcade) */}
      <mesh position={[0, -0.15, 0.36]} castShadow>
        <boxGeometry args={[0.38, 0.16, 0.28]} />
        <meshStandardMaterial color="#d8cebf" roughness={0.75} />
      </mesh>
      {/* Upper Teeth Row */}
      {[-0.14, -0.08, -0.025, 0.025, 0.08, 0.14].map((tx, idx) => (
        <mesh key={idx} position={[tx, -0.22, 0.46]} castShadow>
          <boxGeometry args={[0.045, 0.075, 0.06]} />
          <meshStandardMaterial color="#f1ede4" roughness={0.5} />
        </mesh>
      ))}

      {/* 7. Mandible (Lower Jawbone & Chin) */}
      <mesh position={[0, -0.32, 0.34]} castShadow>
        <boxGeometry args={[0.34, 0.13, 0.26]} />
        <meshStandardMaterial color="#cfc4b2" roughness={0.75} />
      </mesh>
      {/* Mental Protuberance (Pointed Chin) */}
      <mesh position={[0, -0.36, 0.44]}>
        <boxGeometry args={[0.16, 0.09, 0.12]} />
        <meshStandardMaterial color="#cfc4b2" roughness={0.7} />
      </mesh>
      {/* Lower Teeth Row */}
      {[-0.11, -0.055, 0, 0.055, 0.11].map((tx, idx) => (
        <mesh key={idx} position={[tx, -0.26, 0.45]} castShadow>
          <boxGeometry args={[0.042, 0.065, 0.05]} />
          <meshStandardMaterial color="#f1ede4" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * BoneOssuaryDivider3D
 * 
 * 3D Sculptural ossuary catacomb divider featuring an anatomically sculpted
 * human skull engulfed in dynamic procedural flame ribbons and glowing firelight.
 */
export function BoneOssuaryDivider3D({
  label = 'Catacombs Reliquary',
  pattern = 'crossed',
  width = 6.0,
}: BoneOssuaryDivider3DProps) {
  const groupRef = useRef<Group>(null);
  const fireLightRef = useRef<any>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Subtle rhythmic skull respiration
    const breathe = Math.sin(t * 0.7) * 0.015;
    groupRef.current.scale.set(1 + breathe, 1 + breathe, 1);

    // Firelight dynamic flicker
    if (fireLightRef.current) {
      fireLightRef.current.intensity = 2.4 + Math.sin(t * 15) * 0.5 + Math.sin(t * 27) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Ambient & Rim Lighting */}
      <ambientLight intensity={0.55} color="#15241b" />
      <directionalLight position={[3, 4, 3]} intensity={0.8} color="#fed7aa" />

      {/* Internal Flickering Firelight casting warm light onto bone */}
      <pointLight
        ref={fireLightRef}
        position={[0, 0.5, 0.9]}
        color="#ff7b00"
        intensity={2.5}
        distance={4.5}
        decay={2}
      />
      <pointLight
        position={[0, 0.2, 0.6]}
        color="#ffea00"
        intensity={1.8}
        distance={2.5}
        decay={2}
      />

      <Float speed={1.1} rotationIntensity={0.03} floatIntensity={0.06}>
        {/* Horizontal Granite Architectural Bar */}
        <mesh position={[0, -0.05, -0.2]}>
          <boxGeometry args={[width, 0.12, 0.14]} />
          <meshStandardMaterial color="#2d3732" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Outer Flanking Crossed Femur Bones */}
        {[-2.3, 2.3].map((x, i) => (
          <group key={i} position={[x, -0.05, 0]}>
            {/* Horizontal femur */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 1.3, 12]} />
              <meshStandardMaterial color="#e2d9cc" roughness={0.7} />
            </mesh>
            {/* Bone knobs */}
            <mesh position={[-0.65, 0.07, 0]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#d4c9ba" roughness={0.7} />
            </mesh>
            <mesh position={[-0.65, -0.07, 0]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#d4c9ba" roughness={0.7} />
            </mesh>
            <mesh position={[0.65, 0.07, 0]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#d4c9ba" roughness={0.7} />
            </mesh>
            <mesh position={[0.65, -0.07, 0]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#d4c9ba" roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Central Crossed Bones Behind Skull */}
        {pattern === 'crossed' && (
          <group position={[0, 0.05, -0.05]}>
            <mesh rotation={[0, 0, 0.78]}>
              <cylinderGeometry args={[0.08, 0.08, 2.4, 12]} />
              <meshStandardMaterial color="#d8cebf" roughness={0.7} />
            </mesh>
            <mesh rotation={[0, 0, -0.78]}>
              <cylinderGeometry args={[0.08, 0.08, 2.4, 12]} />
              <meshStandardMaterial color="#d8cebf" roughness={0.7} />
            </mesh>
          </group>
        )}

        {/* Central Anatomical Human Skull */}
        <AnatomicalSkull />

        {/* Real Skull Fire Ribbons & Rising Embers */}
        <SkullFireRibbons />

        {/* Status / Reliquary Inscription Label */}
        {label && (
          <Text
            position={[0, -0.85, 0.3]}
            fontSize={0.16}
            letterSpacing={0.12}
            color="#4ade80"
            outlineWidth={0.015}
            outlineColor="#05140b"
            anchorX="center"
            anchorY="middle"
          >
            {label.toUpperCase()}
          </Text>
        )}
      </Float>
    </group>
  );
}
