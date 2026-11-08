import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { type Group } from 'three';
import { playSound } from '../../audio';

export interface WitchOnBroom3DProps {
  flightSpeed?: 'glide' | 'hunt' | 'warp';
  spellColor?: string;
  onCastSpell?: () => void;
  scale?: number;
}

const SPEED_CONFIG = {
  glide: { speed: 1.0, particleSpeed: 1.0, trailCount: 16 },
  hunt: { speed: 1.8, particleSpeed: 2.2, trailCount: 22 },
  warp: { speed: 2.8, particleSpeed: 3.5, trailCount: 30 },
};

/**
 * WitchOnBroom - 3D Sculpted witch in pointed hat & flowing robes riding a birch broomstick
 */
function SculptedWitch() {
  const capeRef = useRef<Group>(null);

  useFrame((state) => {
    if (!capeRef.current) return;
    const t = state.clock.elapsedTime * 6;
    // Cape flutter in wind
    capeRef.current.rotation.y = Math.sin(t) * 0.15;
    capeRef.current.rotation.x = 0.2 + Math.cos(t * 1.2) * 0.1;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Birch Wood Broomstick */}
      {/* Long Wooden Shaft */}
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.035, 2.8, 12]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.8} />
      </mesh>
      {/* Broom Twig Straw Bundle at Rear */}
      <group position={[-1.25, -0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh castShadow>
          <coneGeometry args={[0.22, 0.9, 12]} />
          <meshStandardMaterial color="#b45309" roughness={0.9} />
        </mesh>
        {/* Bound Twine Wraps */}
        <mesh position={[0, 0.28, 0]}>
          <torusGeometry args={[0.1, 0.02, 8, 16]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <torusGeometry args={[0.08, 0.02, 8, 16]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
      </group>

      {/* 2. The Witch */}
      <group position={[0.15, 0.1, 0]}>
        {/* Witch Robe Torso */}
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0.15]} castShadow>
          <coneGeometry args={[0.28, 0.7, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>

        {/* Fluttering Cape Tails */}
        <group ref={capeRef} position={[-0.15, 0.55, 0]}>
          <mesh rotation={[0.2, 0, 0.8]}>
            <boxGeometry args={[0.65, 0.38, 0.02]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.65} />
          </mesh>
        </group>

        {/* Arms Clutched to Broomstick Handle */}
        <mesh position={[0.22, 0.15, 0.12]} rotation={[0.4, 0.2, -0.6]}>
          <cylinderGeometry args={[0.04, 0.045, 0.45, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        <mesh position={[0.22, 0.15, -0.12]} rotation={[-0.4, -0.2, -0.6]}>
          <cylinderGeometry args={[0.04, 0.045, 0.45, 8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>

        {/* Witch Head */}
        <mesh position={[0.05, 0.78, 0]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#a7f3d0" roughness={0.6} />
        </mesh>
        {/* Hooked Witch Nose */}
        <mesh position={[0.18, 0.76, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <coneGeometry args={[0.035, 0.14, 6]} />
          <meshStandardMaterial color="#6ee7b7" roughness={0.6} />
        </mesh>

        {/* Pointed Gothic Witch Hat */}
        <group position={[0.04, 0.88, 0]} rotation={[0, 0, -0.1]}>
          {/* Broad Curved Hat Brim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.02, 8, 24]} />
            <meshStandardMaterial color="#090d16" roughness={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.42, 24]} />
            <meshStandardMaterial color="#090d16" roughness={0.6} />
          </mesh>
          {/* Hat Crown Cone */}
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.24, 0.85, 12]} />
            <meshStandardMaterial color="#090d16" roughness={0.6} />
          </mesh>
          {/* Crooked Hat Tip bending backward */}
          <mesh position={[-0.1, 0.9, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.1, 0.35, 8]} />
            <meshStandardMaterial color="#090d16" roughness={0.6} />
          </mesh>
          {/* Violet / Gold Hat Ribbon Band */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.245, 0.245, 0.08, 16]} />
            <meshStandardMaterial color="#9333ea" metalness={0.4} roughness={0.4} />
          </mesh>
          {/* Buckle */}
          <mesh position={[0.22, 0.08, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.08]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * BroomStardustTrail - Streaming stardust & witchfire particles emitted behind broom
 */
function BroomStardustTrail({ speedMultiplier, spellBurst }: { speedMultiplier: number; spellBurst: boolean }) {
  const trailRef = useRef<Group>(null);

  useFrame((state) => {
    if (!trailRef.current) return;
    const t = state.clock.elapsedTime * speedMultiplier;

    trailRef.current.children.forEach((p, idx) => {
      const offset = idx * 0.35;
      const cycle = (t * 2.2 + offset) % 2.0;
      const flight = cycle / 2.0;

      // Trail streams backwards from broom tail
      const x = -1.35 - flight * 1.8;
      const y = -0.05 + Math.sin(t * 4 + offset) * 0.2 * (1 + flight);
      const z = Math.cos(t * 3.5 + offset) * 0.25 * (1 + flight);

      p.position.set(x, y, z);
      const scaleBase = spellBurst ? 0.08 : 0.04;
      p.scale.setScalar(Math.max(0.01, scaleBase * (1 - flight)));
    });
  });

  return (
    <group ref={trailRef}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#c084fc' : i % 3 === 1 ? '#fde047' : '#34d399'}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * HarvestMoonDisc - Majestic harvest moon backdrop disc with soft lunar halo
 */
function HarvestMoonDisc() {
  return (
    <group position={[1.8, 1.2, -3.5]}>
      {/* Radiant Full Moon */}
      <mesh>
        <circleGeometry args={[1.6, 32]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      {/* Outer Lunar Atmosphere Glow */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial color="#ca8a04" transparent opacity={0.25} />
      </mesh>
      {/* Subtle Moon Crater shadows */}
      <mesh position={[-0.3, 0.4, 0.01]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.4, -0.2, 0.01]}>
        <circleGeometry args={[0.45, 16]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.3} />
      </mesh>
      <mesh position={[-0.5, -0.4, 0.01]}>
        <circleGeometry args={[0.22, 16]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

/**
 * WitchOnBroom3D
 * 
 * An authentic interactive 3D Witch flying on a broomstick:
 * - Sculpted gothic witch with tall bent pointed hat and fluttering midnight cloak
 * - Weathered birch broomstick with bound straw twig tail
 * - Interactive mouse banking: witch tilts and rolls gracefully towards mouse movements
 * - Streaming stardust & witchfire particle trail in broomstick wake
 * - Golden Harvest Full Moon illuminating the night sky
 * - Click anywhere to cast a spell burst with celebratory loop!
 */
export function WitchOnBroom3D({
  flightSpeed = 'hunt',
  spellColor = '#c084fc',
  onCastSpell,
  scale = 1.2,
}: WitchOnBroom3DProps) {
  const flightGroupRef = useRef<Group>(null);
  const [spellBurst, setSpellBurst] = useState(false);
  const config = SPEED_CONFIG[flightSpeed] || SPEED_CONFIG.hunt;

  const handleCastSpell = () => {
    playSound('cauldronBubble');
    setSpellBurst(true);
    setTimeout(() => setSpellBurst(false), 900);
    onCastSpell?.();
  };

  useFrame((state) => {
    if (!flightGroupRef.current) return;
    const t = state.clock.elapsedTime * config.speed;
    const mouse = state.mouse;

    // Smooth aerodynamic banking toward mouse
    const targetRotZ = -mouse.y * 0.35 + Math.sin(t * 1.5) * 0.08;
    const targetRotX = mouse.y * 0.25;
    const targetRotY = mouse.x * 0.45;

    flightGroupRef.current.rotation.z += (targetRotZ - flightGroupRef.current.rotation.z) * 0.08;
    flightGroupRef.current.rotation.x += (targetRotX - flightGroupRef.current.rotation.x) * 0.08;
    flightGroupRef.current.rotation.y += (targetRotY - flightGroupRef.current.rotation.y) * 0.08;

    // Natural swooping & bobbing altitude oscillation
    flightGroupRef.current.position.y = Math.sin(t * 2.0) * 0.22 + mouse.y * 0.4;
    flightGroupRef.current.position.x = Math.sin(t * 1.2) * 0.15 + mouse.x * 0.5;
  });

  return (
    <group scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* Atmospheric Night Lighting */}
      <ambientLight intensity={0.5} color="#182c20" />
      <directionalLight position={[3, 4, 3]} intensity={1.0} color="#fef08a" />
      <pointLight position={[-1.2, 0, 0.5]} intensity={1.5} color={spellColor} distance={4} />

      {/* Harvest Moon Backdrop */}
      <HarvestMoonDisc />

      {/* Interactive Flying Witch & Broomstick */}
      <group
        ref={flightGroupRef}
        onClick={handleCastSpell}
      >
        <SculptedWitch />

        {/* Streaming Stardust Spark Wake */}
        <BroomStardustTrail
          speedMultiplier={config.speed}
          spellBurst={spellBurst}
        />

        {/* Spell Burst Shockwave Ring */}
        {spellBurst && (
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[0.5, 0.7, 32]} />
            <meshBasicMaterial color={spellColor} transparent opacity={0.7} />
          </mesh>
        )}
      </group>

      {/* Flight Control Callout */}
      <Text
        position={[0, -1.5, 0.5]}
        fontSize={0.13}
        letterSpacing={0.08}
        color="#34d399"
        outlineWidth={0.012}
        outlineColor="#05140b"
        anchorX="center"
        anchorY="middle"
      >
        MOVE MOUSE TO BANK FLIGHT · CLICK WITCH TO CAST SPELL
      </Text>
    </group>
  );
}
