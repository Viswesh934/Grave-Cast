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
 * TerrifyingSculptedWitch
 * 
 * An authentic terrifying gothic horror hag:
 * - Gaunt corpselike visage with hollow sunken sockets
 * - Piercing unearthly soul-fire eyes that burn with green phosphor flame
 * - Gaping cackle with razor-sharp protruding fangs
 * - Crooked predatory hooked nose & sharp chin
 * - Wild, wispy grey/white hair streaming violently backwards in the gale
 * - Elongated skeletal claw arms with black talons gripping the gnarled broom
 * - Tattered shredded black shroud tails fluttering chaotically
 * - Cursed twisted elder-wood broomstick with thorny bramble twigs
 */
function TerrifyingSculptedWitch() {
  const capeRef = useRef<Group>(null);
  const hairRef = useRef<Group>(null);
  const jawRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 8;

    // Tattered shroud violent flapping in the gale
    if (capeRef.current) {
      capeRef.current.rotation.y = Math.sin(t) * 0.22;
      capeRef.current.rotation.x = 0.25 + Math.cos(t * 1.3) * 0.15;
    }

    // Wild hair streaming oscillation
    if (hairRef.current) {
      hairRef.current.children.forEach((strand, i) => {
        strand.rotation.z = Math.sin(t * 1.2 + i * 0.8) * 0.18;
      });
    }

    // Sinister cackling jaw twitch
    if (jawRef.current) {
      jawRef.current.position.y = -0.1 + Math.sin(t * 0.6) * 0.02;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Cursed Gnarled Birch Broomstick */}
      {/* Twisted Main Shaft */}
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.045, 0.038, 2.9, 10]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>
      {/* Carved Glowing Runes on Shaft */}
      {[-0.4, 0.2, 0.8].map((rx, idx) => (
        <mesh key={idx} position={[rx, -0.05, 0.045]}>
          <boxGeometry args={[0.15, 0.02, 0.02]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      ))}

      {/* Thorny Bramble Twig Bundle at Rear */}
      <group position={[-1.3, -0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh castShadow>
          <coneGeometry args={[0.26, 1.05, 10]} />
          <meshStandardMaterial color="#2d1c10" roughness={0.95} />
        </mesh>
        {/* Jagged thorny bramble offshoots */}
        {[-0.15, 0.15].map((off, idx) => (
          <mesh key={idx} position={[off, 0.2, off]} rotation={[0.4, idx, 0]}>
            <cylinderGeometry args={[0.015, 0.03, 0.5, 6]} />
            <meshStandardMaterial color="#1a110a" roughness={0.95} />
          </mesh>
        ))}
        {/* Bound rusted wire wraps */}
        <mesh position={[0, 0.35, 0]}>
          <torusGeometry args={[0.11, 0.025, 8, 16]} />
          <meshStandardMaterial color="#7f1d1d" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>

      {/* 2. Terrifying Hag Body & Shroud */}
      <group position={[0.15, 0.1, 0]}>
        {/* Gaunt Hunched Torso */}
        <mesh position={[-0.05, 0.32, 0]} rotation={[0, 0, 0.28]} castShadow>
          <coneGeometry args={[0.26, 0.72, 8]} />
          <meshStandardMaterial color="#090d14" roughness={0.85} />
        </mesh>

        {/* Tattered, Shredded Shroud Ribbons */}
        <group ref={capeRef} position={[-0.22, 0.52, 0]}>
          <mesh rotation={[0.2, 0, 0.95]}>
            <boxGeometry args={[0.85, 0.42, 0.02]} />
            <meshStandardMaterial color="#04060a" roughness={0.8} />
          </mesh>
          {/* Frayed shroud shreds */}
          {[-0.15, 0.15].map((yOff, i) => (
            <mesh key={i} position={[-0.4, yOff, 0.01]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[0.5, 0.12, 0.01]} />
              <meshStandardMaterial color="#090d14" roughness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Elongated Skeletal Claw Arms Clutched to Shaft */}
        <group position={[0.24, 0.12, 0.12]} rotation={[0.5, 0.2, -0.7]}>
          {/* Bony Forearm */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.45, 6]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
          </mesh>
          {/* Clenched Claw Knuckles */}
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {/* Black Sharp Talons */}
          {[-0.025, 0.025].map((tx, idx) => (
            <mesh key={idx} position={[tx, -0.08, 0.03]} rotation={[0.8, 0, 0]}>
              <coneGeometry args={[0.012, 0.08, 6]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
          ))}
        </group>

        {/* Left Claw Arm */}
        <group position={[0.24, 0.12, -0.12]} rotation={[-0.5, -0.2, -0.7]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.45, 6]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {[-0.025, 0.025].map((tx, idx) => (
            <mesh key={idx} position={[tx, -0.08, -0.03]} rotation={[-0.8, 0, 0]}>
              <coneGeometry args={[0.012, 0.08, 6]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
          ))}
        </group>

        {/* 3. Terrifying Hag Visage / Skull-Cranium */}
        <group position={[0.06, 0.8, 0]}>
          {/* Gaunt Head Skull Base */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.17, 14, 14]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.65} />
          </mesh>

          {/* Deep Sunken Eye Sockets */}
          <mesh position={[0.13, 0.04, 0.07]} rotation={[0, 0.3, 0]}>
            <boxGeometry args={[0.06, 0.07, 0.06]} />
            <meshStandardMaterial color="#020617" roughness={0.95} />
          </mesh>
          <mesh position={[0.13, 0.04, -0.07]} rotation={[0, -0.3, 0]}>
            <boxGeometry args={[0.06, 0.07, 0.06]} />
            <meshStandardMaterial color="#020617" roughness={0.95} />
          </mesh>

          {/* Piercing Glowing Soul-Fire Pupils (Unearthly Green Flame) */}
          <mesh position={[0.16, 0.04, 0.07]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
          <mesh position={[0.16, 0.04, -0.07]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
          {/* Soul-fire pinprick pointlights */}
          <pointLight position={[0.2, 0.04, 0]} color="#00ff88" intensity={1.8} distance={1.2} />

          {/* Hooked Predatory Hag Nose */}
          <mesh position={[0.19, -0.02, 0]} rotation={[0, 0, -0.7]}>
            <coneGeometry args={[0.042, 0.18, 6]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.7} />
          </mesh>

          {/* Gaping Sneer Jaw & Protruding Razor Fangs */}
          <group ref={jawRef} position={[0.08, -0.12, 0]}>
            {/* Lower Chin Mental Protuberance */}
            <mesh position={[0.08, -0.04, 0]} rotation={[0, 0, -0.4]}>
              <coneGeometry args={[0.05, 0.14, 6]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
            {/* Upper Teeth Row / Fangs */}
            {[-0.04, 0, 0.04].map((tx, idx) => (
              <mesh key={idx} position={[0.08, 0.04, tx]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.014, 0.06, 4]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
              </mesh>
            ))}
            {/* Lower Fangs */}
            {[-0.03, 0.03].map((tx, idx) => (
              <mesh key={idx} position={[0.07, -0.01, tx]}>
                <coneGeometry args={[0.012, 0.05, 4]} />
                <meshStandardMaterial color="#ffffff" roughness={0.3} />
              </mesh>
            ))}
          </group>

          {/* Wild Wisps of Hair Streaming Backwards in the Gale */}
          <group ref={hairRef} position={[-0.1, 0.02, 0]}>
            {[-0.08, 0, 0.08].map((hz, i) => (
              <mesh key={i} position={[-0.2, 0.05, hz]} rotation={[0, 0, 1.4]}>
                <cylinderGeometry args={[0.012, 0.005, 0.45, 4]} />
                <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
              </mesh>
            ))}
          </group>

          {/* Tall Pointed Witch Hat With Crooked Crest */}
          <group position={[-0.02, 0.15, 0]} rotation={[0, 0, -0.15]}>
            {/* Broad Jagged Hat Brim */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.44, 24]} />
              <meshStandardMaterial color="#05080e" roughness={0.65} />
            </mesh>
            {/* Hat Crown Cone */}
            <mesh position={[0, 0.42, 0]}>
              <coneGeometry args={[0.24, 0.9, 10]} />
              <meshStandardMaterial color="#05080e" roughness={0.65} />
            </mesh>
            {/* Crooked Hat Tip bent backward */}
            <mesh position={[-0.12, 0.95, 0]} rotation={[0, 0, 0.6]}>
              <coneGeometry args={[0.1, 0.4, 8]} />
              <meshStandardMaterial color="#05080e" roughness={0.65} />
            </mesh>
            {/* Blood-Red Hat Band */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.245, 0.245, 0.08, 16]} />
              <meshStandardMaterial color="#991b1b" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * DemonicBroomTrail - Streaming stardust, embers & spectral soul sparks
 */
function DemonicBroomTrail({ speedMultiplier, spellBurst }: { speedMultiplier: number; spellBurst: boolean }) {
  const trailRef = useRef<Group>(null);

  useFrame((state) => {
    if (!trailRef.current) return;
    const t = state.clock.elapsedTime * speedMultiplier;

    trailRef.current.children.forEach((p, idx) => {
      const offset = idx * 0.3;
      const cycle = (t * 2.5 + offset) % 2.0;
      const flight = cycle / 2.0;

      // Streams backwards from thorny tail
      const x = -1.45 - flight * 2.0;
      const y = -0.05 + Math.sin(t * 4.5 + offset) * 0.25 * (1 + flight);
      const z = Math.cos(t * 4.0 + offset) * 0.3 * (1 + flight);

      p.position.set(x, y, z);
      const scaleBase = spellBurst ? 0.09 : 0.045;
      p.scale.setScalar(Math.max(0.01, scaleBase * (1 - flight)));
    });
  });

  return (
    <group ref={trailRef}>
      {Array.from({ length: 24 }).map((_, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#00ff88' : i % 3 === 1 ? '#ff1744' : '#f59e0b'}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * HarvestBloodMoon - Giant ominous crimson-orange Blood Moon disc
 */
function HarvestBloodMoon() {
  return (
    <group position={[1.8, 1.2, -3.5]}>
      {/* Radiant Blood Moon Disc */}
      <mesh>
        <circleGeometry args={[1.7, 32]} />
        <meshBasicMaterial color="#ea580c" />
      </mesh>
      {/* Inner Glowing Core */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[1.4, 32]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
      {/* Outer Crimson Corona Halo */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={0.35} />
      </mesh>
      {/* Demonic Craters */}
      {[-0.4, 0.3, -0.2].map((cx, idx) => (
        <mesh key={idx} position={[cx, (idx - 1) * 0.4, 0.02]}>
          <circleGeometry args={[0.3 + idx * 0.1, 16]} />
          <meshBasicMaterial color="#991b1b" transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * WitchOnBroom3D
 * 
 * An authentic terrifying 3D Witch flying on a broomstick:
 * - Sculpted terrifying hag with gaunt skull visage, piercing soul-fire eyes, protruding razor fangs
 * - Elongated claw arms with black talons, streaming grey hair in the gale
 * - Cursed twisted elder-wood broomstick with thorny bramble twigs
 * - Interactive mouse banking: witch tilts and rolls gracefully towards mouse movements
 * - Streaming stardust & witchfire particle trail in broomstick wake
 * - Giant ominous Blood Harvest Moon illuminating the sky
 * - Click anywhere to cast a terrifying spell burst shockwave!
 */
export function WitchOnBroom3D({
  flightSpeed = 'hunt',
  spellColor = '#ff1744',
  onCastSpell,
  scale = 1.2,
}: WitchOnBroom3DProps) {
  const flightGroupRef = useRef<Group>(null);
  const [spellBurst, setSpellBurst] = useState(false);
  const config = SPEED_CONFIG[flightSpeed] || SPEED_CONFIG.hunt;

  const handleCastSpell = () => {
    playSound('coffinCreak');
    setSpellBurst(true);
    setTimeout(() => setSpellBurst(false), 900);
    onCastSpell?.();
  };

  useFrame((state) => {
    if (!flightGroupRef.current) return;
    const t = state.clock.elapsedTime * config.speed;
    const mouse = state.mouse;

    // Aerodynamic banking toward mouse
    const targetRotZ = -mouse.y * 0.38 + Math.sin(t * 1.5) * 0.08;
    const targetRotX = mouse.y * 0.28;
    const targetRotY = mouse.x * 0.5;

    flightGroupRef.current.rotation.z += (targetRotZ - flightGroupRef.current.rotation.z) * 0.08;
    flightGroupRef.current.rotation.x += (targetRotX - flightGroupRef.current.rotation.x) * 0.08;
    flightGroupRef.current.rotation.y += (targetRotY - flightGroupRef.current.rotation.y) * 0.08;

    // Natural swooping flight altitude oscillation
    flightGroupRef.current.position.y = Math.sin(t * 2.2) * 0.25 + mouse.y * 0.45;
    flightGroupRef.current.position.x = Math.sin(t * 1.4) * 0.18 + mouse.x * 0.55;
  });

  return (
    <group scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* Atmospheric Night Illumination */}
      <ambientLight intensity={0.7} color="#cbd5e1" />
      <directionalLight position={[3, 4, 3]} intensity={1.3} color="#f97316" />
      <pointLight position={[-1.2, 0, 0.5]} intensity={2.0} color="#00ff88" distance={4.5} />

      {/* Giant Harvest Blood Moon Backdrop */}
      <HarvestBloodMoon />

      {/* Interactive Terrifying Flying Witch & Broomstick */}
      <group
        ref={flightGroupRef}
        onClick={handleCastSpell}
      >
        <TerrifyingSculptedWitch />

        {/* Demonic Soul Sparks Wake */}
        <DemonicBroomTrail
          speedMultiplier={config.speed}
          spellBurst={spellBurst}
        />

        {/* Terrifying Spell Burst Shockwave Ring */}
        {spellBurst && (
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[0.5, 0.85, 32]} />
            <meshBasicMaterial color={spellColor} transparent opacity={0.8} />
          </mesh>
        )}
      </group>

      {/* Flight Control Callout */}
      <Text
        position={[0, -1.5, 0.5]}
        fontSize={0.13}
        letterSpacing={0.08}
        color="#ff4d6d"
        outlineWidth={0.012}
        outlineColor="#05140b"
        anchorX="center"
        anchorY="middle"
      >
        MOVE MOUSE TO STEER FLIGHT · CLICK HAG TO UNLEASH CURSE
      </Text>
    </group>
  );
}
