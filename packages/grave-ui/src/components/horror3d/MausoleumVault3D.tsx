import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';
import { playSound } from '../../audio';

export interface MausoleumVault3DProps {
  unsealed?: boolean;
  onToggleUnseal?: (unsealed: boolean) => void;
  scale?: number;
}

/**
 * InnerSanctumRelic - Floating ancient golden reliquary inside the mausoleum vault
 */
function InnerSanctumRelic() {
  const relicRef = useRef<Group>(null);

  useFrame((state) => {
    if (!relicRef.current) return;
    const t = state.clock.elapsedTime;
    relicRef.current.position.y = 0.2 + Math.sin(t * 1.5) * 0.08;
    relicRef.current.rotation.y = t * 0.4;
  });

  return (
    <group ref={relicRef} position={[0, 0.2, -1.2]}>
      {/* Relic Base */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.4, 0.5]} />
        <meshStandardMaterial
          color="#d97706"
          metalness={0.9}
          roughness={0.2}
          emissive="#78350f"
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Relic Gabled Lid */}
      <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.5, 0.28, 4]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Floating Soul Gem on top */}
      <mesh position={[0, 0.55, 0]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>
    </group>
  );
}

/**
 * BillowingCryptMist - Ethereal mist planes that pour outward when vault is unsealed
 */
function BillowingCryptMist({ openProgress }: { openProgress: number }) {
  const mistRef = useRef<Group>(null);

  useFrame((state) => {
    if (!mistRef.current) return;
    const t = state.clock.elapsedTime;
    mistRef.current.children.forEach((p, idx) => {
      const offset = idx * 0.7;
      const cycle = (t * 0.8 + offset) % 2.5;
      p.position.z = -0.5 + cycle * 0.7 * openProgress;
      p.position.x = Math.sin(t + offset) * 0.4 * openProgress;
      p.scale.setScalar(0.4 + cycle * 0.35 * openProgress);
    });
  });

  return (
    <group ref={mistRef} position={[0, -0.6, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[(i % 2 - 0.5) * 0.6, 0, 0]}>
          <sphereGeometry args={[0.6, 12, 12]} />
          <meshBasicMaterial
            color="#34d399"
            transparent
            opacity={0.18 * openProgress}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * MausoleumVault3D
 * 
 * An authentic monolithic subterranean stone mausoleum entrance:
 * - Weathered granite portal archway with carved pilasters and lintel keystone
 * - Massive twin sliding basalt slabs studded with forged iron rivets
 * - Smooth mechanical unsealing physics (stone doors grind open)
 * - Billowing ethereal crypt mist rolling forward from the interior
 * - Inner sanctum illuminated with radiant emerald light and floating reliquary
 */
export function MausoleumVault3D({
  unsealed: externalUnsealed,
  onToggleUnseal,
  scale = 1.05,
}: MausoleumVault3DProps) {
  const [internalUnsealed, setInternalUnsealed] = useState(false);
  const isUnsealed = externalUnsealed !== undefined ? externalUnsealed : internalUnsealed;

  const leftDoorRef = useRef<Group>(null);
  const rightDoorRef = useRef<Group>(null);
  const openProgressRef = useRef(0);
  const sanctumLightRef = useRef<any>(null);

  const toggleUnseal = () => {
    playSound('coffinCreak');
    if (onToggleUnseal) {
      onToggleUnseal(!isUnsealed);
    } else {
      setInternalUnsealed((prev) => !prev);
    }
  };

  useFrame((state) => {
    const target = isUnsealed ? 1.0 : 0.0;
    openProgressRef.current += (target - openProgressRef.current) * 0.08;
    const progress = openProgressRef.current;

    // Slide heavy doors horizontally
    if (leftDoorRef.current) {
      leftDoorRef.current.position.x = -0.85 - progress * 1.05;
      // Stone grinding tremor
      if (progress > 0.02 && progress < 0.98) {
        leftDoorRef.current.position.y = Math.sin(state.clock.elapsedTime * 40) * 0.008;
      } else {
        leftDoorRef.current.position.y = 0;
      }
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x = 0.85 + progress * 1.05;
      if (progress > 0.02 && progress < 0.98) {
        rightDoorRef.current.position.y = Math.cos(state.clock.elapsedTime * 40) * 0.008;
      } else {
        rightDoorRef.current.position.y = 0;
      }
    }

    // Inner sanctum light flare
    if (sanctumLightRef.current) {
      sanctumLightRef.current.intensity = progress * 3.5;
    }
  });

  return (
    <group scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* High-Visibility Architectural Lighting */}
      <ambientLight intensity={1.1} color="#cbd5e1" />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#ffffff" castShadow />
      <directionalLight position={[-4, 3, 2]} intensity={0.8} color="#94a3b8" />
      <pointLight position={[0, 0, 3.5]} intensity={1.0} color="#f1f5f9" distance={6} />

      {/* Radiant Inner Sanctum Light */}
      <pointLight
        ref={sanctumLightRef}
        position={[0, 0.5, -1.0]}
        color="#34d399"
        intensity={0}
        distance={5}
        decay={2}
      />

      <Float speed={0.9} rotationIntensity={0.02} floatIntensity={0.04}>
        {/* Subterranean Portal Stone Archway (Weathered Granite Grey) */}
        {/* Left Stone Pilaster Column */}
        <mesh position={[-1.95, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 3.4, 0.6]} />
          <meshStandardMaterial color="#5a6c62" roughness={0.82} />
        </mesh>
        {/* Left Column Capital */}
        <mesh position={[-1.95, 1.75, 0]}>
          <boxGeometry args={[0.65, 0.2, 0.7]} />
          <meshStandardMaterial color="#6e8277" roughness={0.78} />
        </mesh>

        {/* Right Stone Pilaster Column */}
        <mesh position={[1.95, 0, 0]} castShadow>
          <boxGeometry args={[0.55, 3.4, 0.6]} />
          <meshStandardMaterial color="#5a6c62" roughness={0.82} />
        </mesh>
        {/* Right Column Capital */}
        <mesh position={[1.95, 1.75, 0]}>
          <boxGeometry args={[0.65, 0.2, 0.7]} />
          <meshStandardMaterial color="#6e8277" roughness={0.78} />
        </mesh>

        {/* Monolithic Archway Lintel Beam */}
        <mesh position={[0, 1.95, 0]} castShadow>
          <boxGeometry args={[4.45, 0.45, 0.7]} />
          <meshStandardMaterial color="#54665c" roughness={0.82} />
        </mesh>

        {/* Carved Keystone Crest in Center of Lintel */}
        <mesh position={[0, 2.05, 0.38]}>
          <boxGeometry args={[0.48, 0.55, 0.15]} />
          <meshStandardMaterial color="#748a7e" roughness={0.7} />
        </mesh>
        <Text
          position={[0, 2.05, 0.48]}
          fontSize={0.16}
          color="#34d399"
          anchorX="center"
          anchorY="middle"
        >
          VAULT
        </Text>

        {/* Stepped Granite Threshold Base */}
        <mesh position={[0, -1.75, 0.1]} receiveShadow>
          <boxGeometry args={[4.6, 0.25, 1.2]} />
          <meshStandardMaterial color="#4a5b52" roughness={0.88} />
        </mesh>
        <mesh position={[0, -1.95, 0.3]} receiveShadow>
          <boxGeometry args={[4.9, 0.22, 1.5]} />
          <meshStandardMaterial color="#3f4e46" roughness={0.9} />
        </mesh>

        {/* Crypt Chamber Interior Void & Walls */}
        <group position={[0, 0, -1.5]}>
          {/* Back wall of crypt */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3.4, 3.2, 0.1]} />
            <meshStandardMaterial color="#1e2c24" roughness={0.9} />
          </mesh>
          {/* Left inner wall */}
          <mesh position={[-1.7, 0, 0.8]}>
            <boxGeometry args={[0.1, 3.2, 1.6]} />
            <meshStandardMaterial color="#1b2821" roughness={0.9} />
          </mesh>
          {/* Right inner wall */}
          <mesh position={[1.7, 0, 0.8]}>
            <boxGeometry args={[0.1, 3.2, 1.6]} />
            <meshStandardMaterial color="#1b2821" roughness={0.9} />
          </mesh>
          {/* Inner Sanctum Golden Relic */}
          <InnerSanctumRelic />
        </group>

        {/* Interactive Clickable Vault Door Assembly */}
        <group onClick={toggleUnseal}>
          {/* Left Sliding Basalt Vault Door Slab */}
          <group ref={leftDoorRef} position={[-0.85, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.7, 3.2, 0.32]} />
              <meshStandardMaterial
                color="#4e6056"
                roughness={0.78}
                metalness={0.2}
              />
            </mesh>

            {/* Iron Cross-Banding Reinforcements */}
            <mesh position={[0, 0.8, 0.17]}>
              <boxGeometry args={[1.65, 0.12, 0.04]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.8, 0.17]}>
              <boxGeometry args={[1.65, 0.12, 0.04]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Forged Iron Rivets */}
            {[-0.6, -0.2, 0.2, 0.6].map((rx, idx) => (
              <group key={idx}>
                <mesh position={[rx, 0.8, 0.2]}>
                  <sphereGeometry args={[0.038, 8, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
                <mesh position={[rx, -0.8, 0.2]}>
                  <sphereGeometry args={[0.038, 8, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
              </group>
            ))}

            {/* Heavy Iron Pull Ring */}
            <mesh position={[0.5, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.03, 8, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>

          {/* Right Sliding Basalt Vault Door Slab */}
          <group ref={rightDoorRef} position={[0.85, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.7, 3.2, 0.32]} />
              <meshStandardMaterial
                color="#4e6056"
                roughness={0.78}
                metalness={0.2}
              />
            </mesh>

            {/* Iron Cross-Banding Reinforcements */}
            <mesh position={[0, 0.8, 0.17]}>
              <boxGeometry args={[1.65, 0.12, 0.04]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.8, 0.17]}>
              <boxGeometry args={[1.65, 0.12, 0.04]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Forged Iron Rivets */}
            {[-0.6, -0.2, 0.2, 0.6].map((rx, idx) => (
              <group key={idx}>
                <mesh position={[rx, 0.8, 0.2]}>
                  <sphereGeometry args={[0.038, 8, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
                <mesh position={[rx, -0.8, 0.2]}>
                  <sphereGeometry args={[0.038, 8, 8]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
                </mesh>
              </group>
            ))}

            {/* Heavy Iron Pull Ring */}
            <mesh position={[-0.5, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.03, 8, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        </group>

        {/* Billowing Crypt Mist Rolling Outward */}
        <BillowingCryptMist openProgress={openProgressRef.current} />

        {/* Unseal Instruction Callout */}
        <Text
          position={[0, -2.25, 0.5]}
          fontSize={0.13}
          letterSpacing={0.08}
          color="#34d399"
          outlineWidth={0.012}
          outlineColor="#05140b"
          anchorX="center"
          anchorY="middle"
        >
          {isUnsealed ? "CLICK TO RESEAL MAUSOLEUM" : "CLICK SLABS TO UNSEAL VAULT"}
        </Text>
      </Float>
    </group>
  );
}
