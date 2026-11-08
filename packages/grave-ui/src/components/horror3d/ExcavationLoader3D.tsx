import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { type Group } from 'three';
import type { HorrorIntensity } from '../../tokens/types';

export interface ExcavationLoader3DProps {
  message?: string;
  depth?: number; // Depth in feet or progress %
  speed?: 'slow' | 'normal' | 'fast';
  intensity?: HorrorIntensity;
  scale?: number;
}

const SPEED_FACTORS = {
  slow: 0.65,
  normal: 1.0,
  fast: 1.7,
};

/**
 * IronGraveSpade - Weathered iron digging shovel with ashwood shaft and T-grip
 * Clutched by an articulated skeletal gravedigger arm.
 */
function GraveDiggerShovel({ speedMultiplier }: { speedMultiplier: number }) {
  const shovelGroupRef = useRef<Group>(null);
  const soilOnBladeRef = useRef<Group>(null);

  useFrame((state) => {
    if (!shovelGroupRef.current) return;
    const t = state.clock.elapsedTime * speedMultiplier * 1.8;
    const cycle = (t % (Math.PI * 2));

    // 4-Phase Digging Choreography:
    // Phase 1 (0 to PI/2): Plunge down into earth
    // Phase 2 (PI/2 to PI): Lever back & scoop
    // Phase 3 (PI to 1.5 PI): Heave upward & cast dirt
    // Phase 4 (1.5 PI to 2 PI): Reset to top
    let y = 0;
    let rotX = 0;
    let rotZ = 0;

    if (cycle < Math.PI * 0.5) {
      // Thrust downward
      const progress = cycle / (Math.PI * 0.5);
      y = 0.2 - progress * 0.55;
      rotX = 0.15 + progress * 0.2;
      rotZ = 0.05;
    } else if (cycle < Math.PI) {
      // Lever backward & scoop
      const progress = (cycle - Math.PI * 0.5) / (Math.PI * 0.5);
      y = -0.35 + Math.sin(progress * Math.PI * 0.5) * 0.1;
      rotX = 0.35 - progress * 0.55;
      rotZ = 0.05 + progress * 0.1;
    } else if (cycle < Math.PI * 1.5) {
      // Heave upward & fling
      const progress = (cycle - Math.PI) / (Math.PI * 0.5);
      y = -0.25 + progress * 0.6;
      rotX = -0.2 - progress * 0.3;
      rotZ = 0.15 - progress * 0.1;
    } else {
      // Return down to starting position
      const progress = (cycle - Math.PI * 1.5) / (Math.PI * 0.5);
      y = 0.35 - progress * 0.15;
      rotX = -0.5 + progress * 0.65;
      rotZ = 0.05;
    }

    shovelGroupRef.current.position.set(0, y, 0.15);
    shovelGroupRef.current.rotation.set(rotX, 0, rotZ);

    // Soil mound on shovel blade disappears when flung upward
    if (soilOnBladeRef.current) {
      const showDirt = cycle > Math.PI * 0.6 && cycle < Math.PI * 1.35;
      soilOnBladeRef.current.visible = showDirt;
      if (showDirt) {
        const dirtScale = Math.sin((cycle - Math.PI * 0.6) / (Math.PI * 0.75) * Math.PI);
        soilOnBladeRef.current.scale.setScalar(Math.max(0.1, dirtScale));
      }
    }
  });

  return (
    <group ref={shovelGroupRef} position={[0, 0, 0.15]}>
      {/* Ashwood Shovel Shaft */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 1.45, 12]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>

      {/* Forged Iron D-Grip Collar */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.12, 10]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Top Crossbar */}
      <mesh position={[0, 1.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 0.28, 10]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Forged Iron Shovel Blade Socket */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.045, 0.18, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.35} />
      </mesh>

      {/* Heavy Curved Iron Shovel Blade */}
      <group position={[0, -0.32, 0.04]}>
        <mesh rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.52, 0.03]} />
          <meshStandardMaterial
            color="#273238"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Shovel Beveled Chiseled Tip */}
        <mesh position={[0, -0.28, 0.02]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.22, 0.14, 4]} />
          <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Moist Dirt Clod Piled on Blade */}
        <group ref={soilOnBladeRef} position={[0, 0.08, 0.05]}>
          <mesh>
            <sphereGeometry args={[0.18, 10, 8]} />
            <meshStandardMaterial color="#2d2013" roughness={0.95} />
          </mesh>
          <mesh position={[-0.08, -0.04, 0.04]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color="#1c140d" roughness={0.95} />
          </mesh>
          <mesh position={[0.09, -0.02, 0.03]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#38291a" roughness={0.95} />
          </mesh>
        </group>
      </group>

      {/* Skeletal Gravedigger Arm Gripping Shaft */}
      <group position={[0.14, 0.75, 0.08]} rotation={[0.2, 0, -0.5]}>
        {/* Forearm Radius & Ulna */}
        <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.42, 8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
        </mesh>
        <mesh position={[0.16, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.42, 8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
        </mesh>
        {/* Skeletal Wrist & Knuckles Clenched Around Handle */}
        <mesh position={[-0.05, 0, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
        </mesh>
        {/* Clenched Bony Fingers */}
        {[-0.04, 0, 0.04].map((offset, i) => (
          <mesh key={i} position={[-0.06, offset, -0.04]} rotation={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.65} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * FlyingDirtParticles - Parabolic clods of earth flung dynamically on shovel heave
 */
function FlyingDirtParticles({ speedMultiplier }: { speedMultiplier: number }) {
  const particlesRef = useRef<Group>(null);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const t = state.clock.elapsedTime * speedMultiplier * 1.8;
    const cycle = (t % (Math.PI * 2));

    particlesRef.current.children.forEach((p, idx) => {
      // Fire particles primarily during heave phase (PI to 1.6 PI)
      const offset = (idx * 0.25);
      const heaveTime = (cycle - Math.PI + offset + Math.PI * 2) % (Math.PI * 2);

      if (heaveTime < 1.4) {
        p.visible = true;
        const flight = heaveTime / 1.4;
        // Parabolic trajectory over pit lip
        const spreadX = ((idx % 5) - 2) * 0.25;
        const x = spreadX + flight * 0.6;
        const y = -0.1 + Math.sin(flight * Math.PI) * 1.1 - (flight * flight * 0.5);
        const z = 0.3 + flight * 0.8;

        p.position.set(x, y, z);
        p.rotation.x = flight * 8.0;
        p.rotation.y = flight * 6.0;
        p.scale.setScalar(Math.max(0.02, 0.07 * (1 - flight * 0.6)));
      } else {
        p.visible = false;
      }
    });
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} castShadow>
          <dodecahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#2b1e13' : '#3d2b1b'}
            roughness={0.95}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * ExcavationGravePit - Layered subterranean soil trench with earth mounds, strata & depth markers
 */
function ExcavationGravePit() {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Ground Surface Rim (Mossy Grass/Earth border) */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.1, 2.6]} />
        <meshStandardMaterial color="#1a251d" roughness={0.9} />
      </mesh>

      {/* Excavated Grave Pit Void (Sunken trench) */}
      {/* Back Wall - Layered Geological Strata */}
      <mesh position={[0, -0.4, -0.85]} receiveShadow>
        <boxGeometry args={[2.2, 1.1, 0.1]} />
        <meshStandardMaterial color="#2d2217" roughness={0.95} />
      </mesh>
      {/* Front Pit Wall */}
      <mesh position={[0, -0.4, 0.85]} receiveShadow>
        <boxGeometry args={[2.2, 1.1, 0.1]} />
        <meshStandardMaterial color="#38291b" roughness={0.95} />
      </mesh>
      {/* Left Wall with Carved Depth Gauge */}
      <mesh position={[-1.15, -0.4, 0]} receiveShadow>
        <boxGeometry args={[0.1, 1.1, 1.7]} />
        <meshStandardMaterial color="#22180f" roughness={0.95} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[1.15, -0.4, 0]} receiveShadow>
        <boxGeometry args={[0.1, 1.1, 1.7]} />
        <meshStandardMaterial color="#241a11" roughness={0.95} />
      </mesh>

      {/* Trench Floor - Freshly Dug Bedrock & Broken Bones */}
      <mesh position={[0, -0.92, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.1, 1.7]} />
        <meshStandardMaterial color="#19120b" roughness={0.95} />
      </mesh>

      {/* Spoil Heap Dirt Mounds Banked on Left and Right of Pit */}
      <mesh position={[-1.4, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.45, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
      </mesh>
      <mesh position={[1.4, 0.32, 0.1]} castShadow>
        <sphereGeometry args={[0.48, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.95} />
      </mesh>

      {/* Exposed Jagged Roots Jutting from Soil */}
      <mesh position={[-0.8, -0.1, -0.8]} rotation={[0.4, 0.2, 0.8]}>
        <cylinderGeometry args={[0.02, 0.035, 0.5, 6]} />
        <meshStandardMaterial color="#422006" roughness={0.9} />
      </mesh>
      <mesh position={[0.7, -0.2, -0.82]} rotation={[-0.3, -0.2, -0.7]}>
        <cylinderGeometry args={[0.018, 0.03, 0.45, 6]} />
        <meshStandardMaterial color="#422006" roughness={0.9} />
      </mesh>

      {/* Depth Gauge Inscription Marks on Left Wall */}
      <Text
        position={[-1.08, -0.15, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.11}
        color="#4ade80"
        font="monospace"
        anchorX="center"
      >
        — 2 FT
      </Text>
      <Text
        position={[-1.08, -0.45, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.11}
        color="#4ade80"
        font="monospace"
        anchorX="center"
      >
        — 4 FT
      </Text>
      <Text
        position={[-1.08, -0.75, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.11}
        color="#22c55e"
        font="monospace"
        anchorX="center"
      >
        — 6 FT DEPTH
      </Text>
    </group>
  );
}

/**
 * HangingGravediggerLantern - Iron lantern illuminating the excavation trench with warm eerie flame
 */
function HangingGravediggerLantern() {
  const lightRef = useRef<any>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    // Lantern flicker
    lightRef.current.intensity = 1.4 + Math.sin(t * 11) * 0.25 + Math.sin(t * 19) * 0.15;
  });

  return (
    <group position={[1.35, 0.2, 0.85]}>
      {/* Iron Support Post */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      {/* Curved Hanging Hook */}
      <mesh position={[-0.1, 0.78, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Iron Lantern Body */}
      <group position={[-0.2, 0.65, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.22, 0.16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} wireframe />
        </mesh>
        {/* Burning Flame Core */}
        <mesh position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        <pointLight
          ref={lightRef}
          color="#f59e0b"
          intensity={1.5}
          distance={3.5}
          decay={2}
          castShadow
        />
      </group>
    </group>
  );
}

/**
 * ExcavationLoader3D
 * 
 * An authentic 3D grave-excavation loading scene:
 * - Real subterranean excavation trench with geological strata and depth markers
 * - Forged iron graveyard spade with ashwood handle
 * - Skeletal gravedigger arm vigorously digging, scooping, and flinging dirt
 * - Parabolic flying dirt clods with gravity physics
 * - Hanging iron miner's lantern casting flickering illumination into the pit
 * - Atmospheric depth HUD readout
 */
export function ExcavationLoader3D({
  message = 'Excavating cursed ground...',
  depth = 6.0,
  speed = 'normal',
  intensity = 'cursed',
  scale = 1.15,
}: ExcavationLoader3DProps) {
  const speedMultiplier = SPEED_FACTORS[speed];

  return (
    <group scale={[scale, scale, scale]} position={[0, 0.1, 0]}>
      {/* Ambient & Directional Scene Lighting */}
      <ambientLight intensity={0.5} color="#182c20" />
      <directionalLight position={[3, 5, 4]} intensity={1.1} color="#f0fdf4" castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.6} color="#34d399" />
      <pointLight position={[0, 1.2, 1.5]} intensity={0.9} color="#10b981" distance={5} />

      <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.04}>
        {/* Layered Subterranean Grave Pit & Spoil Mounds */}
        <ExcavationGravePit />

        {/* Dynamic Iron Grave Spade & Skeletal Gravedigger Arm */}
        <GraveDiggerShovel speedMultiplier={speedMultiplier} />

        {/* Flying Parabolic Dirt Particles */}
        <FlyingDirtParticles speedMultiplier={speedMultiplier} />

        {/* Lantern Illuminating Trench */}
        <HangingGravediggerLantern />

        {/* Abyssal terror flare on intense excavation */}
        {intensity === 'abyssal' && (
          <pointLight position={[0, -0.4, 0]} intensity={1.5} color="#ef4444" distance={3} />
        )}

        {/* Excavation Status & Depth Readout HUD */}
        {message && (
          <Text
            position={[0, -1.35, 0.4]}
            fontSize={0.14}
            letterSpacing={0.08}
            color={intensity === 'abyssal' ? '#ef4444' : '#4ade80'}
            outlineWidth={0.015}
            outlineColor="#05140b"
            anchorX="center"
            anchorY="middle"
          >
            {`${depth.toFixed(1)} FT · ${message.toUpperCase()}`}
          </Text>
        )}
      </Float>
    </group>
  );
}
