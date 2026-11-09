import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group } from 'three';
import { playSound } from '../../audio';

export type HauntMode = 'whisper' | 'manifest' | 'poltergeist';

export interface BestiaryCharacter3DProps {
  /** Identifier of the bestiary creature (e.g. 'ghost', 'wisp', 'pumpkin', 'vampire', 'bat', etc.) */
  characterId: string;
  /** Intensity of the creature's ghostly manifestation */
  hauntMode?: HauntMode;
  /** Primary accent color override */
  accentColor?: string;
  /** Scale multiplier */
  scale?: number;
  /** Callback triggered when clicking the creature to unleash its shockwave */
  onTriggerCurse?: () => void;
}

const HAUNT_SPEEDS: Record<HauntMode, { speed: number; wobble: number }> = {
  whisper: { speed: 1.0, wobble: 0.08 },
  manifest: { speed: 1.8, wobble: 0.16 },
  poltergeist: { speed: 2.8, wobble: 0.28 },
};

/**
 * Wisp3DModel - The Anguished Ghost
 * Gaunt hollow visage with gaping silent scream mouth and unearthly cyan soul-fire eyes.
 */
function Wisp3DModel({ speed = 1.0 }: { speed?: number }) {
  const shroudRef = useRef<Group>(null);
  const skirtRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (shroudRef.current) {
      shroudRef.current.position.y = Math.sin(t * 1.8) * 0.14;
      shroudRef.current.rotation.z = Math.sin(t * 1.0) * 0.06;
      shroudRef.current.rotation.x = Math.cos(t * 1.2) * 0.05;
    }
    if (skirtRef.current) {
      skirtRef.current.children.forEach((ripple, i) => {
        ripple.rotation.x = Math.sin(t * 2.2 + i * 0.8) * 0.3;
        ripple.rotation.z = Math.cos(t * 1.8 + i * 0.6) * 0.18;
      });
    }
  });

  return (
    <group ref={shroudRef} position={[0, 0.2, 0]}>
      {/* Gaunt Head Dome */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.55, 32, 24]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Trailing Shroud Mantle */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <coneGeometry args={[0.7, 1.4, 24, 1, true]} />
        <meshStandardMaterial
          color="#cbd5e1"
          roughness={0.6}
          metalness={0.05}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Shredded Skirt Tails */}
      <group ref={skirtRef} position={[0, -0.65, 0]}>
        {[-0.45, -0.22, 0, 0.22, 0.45].map((x, i) => (
          <mesh key={i} position={[x, -0.2, Math.sin(i) * 0.15]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial
              color="#94a3b8"
              roughness={0.7}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* Sunken Black Sockets with Piercing Cyan Soul-Fire Eyes */}
      {[-0.18, 0.18].map((ex, i) => (
        <group key={i} position={[ex, 0.74, 0.48]}>
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color="#020408" />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <mesh position={[-0.015, 0.015, 0.07]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <pointLight color="#00f0ff" intensity={2.0} distance={1.2} />
        </group>
      ))}

      {/* Silent Agony Gaping Mouth Cavity */}
      <mesh position={[0, 0.45, 0.52]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 16]} />
        <meshBasicMaterial color="#020408" />
      </mesh>
    </group>
  );
}

/**
 * Pumpkin3DModel - Rotten Jack-o'-Lantern
 * Sinister jagged carved grin with flickering internal sacrificial candle flame.
 */
function Pumpkin3DModel({ speed = 1.0 }: { speed?: number }) {
  const pumpkinRef = useRef<Group>(null);
  const candleLightRef = useRef<any>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (pumpkinRef.current) {
      pumpkinRef.current.position.y = Math.sin(t * 1.5) * 0.06;
      pumpkinRef.current.rotation.y = Math.sin(t * 0.8) * 0.18;
    }
    // Violent flickering candle
    if (candleLightRef.current) {
      candleLightRef.current.intensity = 3.2 + Math.sin(t * 12.0) * 0.9 + Math.cos(t * 19.0) * 0.5;
    }
  });

  return (
    <group ref={pumpkinRef} position={[0, 0.1, 0]}>
      {/* Ribbed Gourd Shell */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.22, 0.2, Math.sin(angle) * 0.22]}
            rotation={[0, angle, 0]}
            castShadow
          >
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshStandardMaterial color="#c2410c" roughness={0.8} />
          </mesh>
        );
      })}

      {/* Gnarled Thorny Stem */}
      <mesh position={[0, 0.85, 0]} rotation={[0.2, 0, 0.25]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.45, 8]} />
        <meshStandardMaterial color="#2d1c10" roughness={0.95} />
      </mesh>

      {/* Violent Candle Point Light */}
      <pointLight
        ref={candleLightRef}
        position={[0, 0.2, 0.25]}
        color="#ff8800"
        intensity={3.5}
        distance={2.8}
      />

      {/* Carved Menacing Features */}
      <group position={[0, 0.2, 0.62]}>
        {/* Slanted Evil Eyes */}
        <mesh position={[-0.22, 0.16, 0]} rotation={[0, 0, 0.35]}>
          <coneGeometry args={[0.11, 0.18, 3]} />
          <meshBasicMaterial color="#ffea00" />
        </mesh>
        <mesh position={[0.22, 0.16, 0]} rotation={[0, 0, -0.35]}>
          <coneGeometry args={[0.11, 0.18, 3]} />
          <meshBasicMaterial color="#ffea00" />
        </mesh>
        {/* Jagged Grinning Mouth */}
        <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.3, 0.05, 8, 16, Math.PI * 0.85]} />
          <meshBasicMaterial color="#ff7700" />
        </mesh>
        {/* Protruding Fang Notches */}
        <mesh position={[-0.1, -0.18, 0]}>
          <coneGeometry args={[0.04, 0.09, 3]} />
          <meshBasicMaterial color="#ffea00" />
        </mesh>
        <mesh position={[0.1, -0.18, 0]}>
          <coneGeometry args={[0.04, 0.09, 3]} />
          <meshBasicMaterial color="#ffea00" />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Vampire3DModel - Lord Alucard (Nosferatu Horror)
 * Gaunt white corpse visage, slender gothic silhouette, razor fangs, and bloodthirsty crimson eyes.
 */
function Vampire3DModel({ speed = 1.0 }: { speed?: number }) {
  const vampRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (vampRef.current) {
      vampRef.current.position.y = Math.sin(t * 1.6) * 0.08;
      vampRef.current.rotation.y = Math.sin(t * 0.6) * 0.14;
    }
  });

  return (
    <group ref={vampRef} position={[0, 0.1, 0]}>
      {/* 1. Gothic Torso & Velvet Vest (Clean silhouette, no cape) */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.45, 1.15, 16]} />
        <meshStandardMaterial color="#0d0408" roughness={0.85} />
      </mesh>

      {/* 2. Gaunt Corpselike Visage */}
      <mesh position={[0, 0.65, 0.08]} castShadow>
        <sphereGeometry args={[0.36, 24, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>

      {/* 3. Widow's Peak Hair Crest */}
      <mesh position={[0, 0.88, 0.04]}>
        <sphereGeometry args={[0.37, 16, 16]} />
        <meshStandardMaterial color="#030305" roughness={0.95} />
      </mesh>

      {/* 4. Sunken Blood-Red Eyes */}
      {[-0.14, 0.14].map((ex, i) => (
        <group key={i} position={[ex, 0.68, 0.4]}>
          <mesh>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshBasicMaterial color="#020408" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#ff0033" />
          </mesh>
          <pointLight color="#ff0033" intensity={1.8} distance={1.0} />
        </group>
      ))}

      {/* 5. Razor Sharp Fangs */}
      {[-0.08, 0.08].map((fx, i) => (
        <mesh key={i} position={[fx, 0.52, 0.42]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.025, 0.11, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 6. Pale Clawed Hands */}
      {[-0.32, 0.32].map((hx, i) => (
        <group key={i} position={[hx, 0.25, 0.2]}>
          <mesh>
            <sphereGeometry args={[0.075, 10, 10]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
          {[-0.03, 0, 0.03].map((cx, ci) => (
            <mesh key={ci} position={[cx, -0.06, 0.05]} rotation={[0.4, 0, 0]}>
              <coneGeometry args={[0.015, 0.06, 4]} />
              <meshBasicMaterial color="#0f050b" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * Bat3DModel - Vesper (Giant Monstrous Vampire Bat)
 * Flapping leathery ribbed wings, bared fangs, pointed predatory ears, witchfire purple eye glow.
 */
function Bat3DModel({ speed = 1.0 }: { speed?: number }) {
  const batRef = useRef<Group>(null);
  const leftWingRef = useRef<Group>(null);
  const rightWingRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed * 3.0;
    if (batRef.current) {
      batRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    }
    const wingFlap = Math.sin(t * 3.2) * 0.55;
    if (leftWingRef.current) leftWingRef.current.rotation.y = wingFlap;
    if (rightWingRef.current) rightWingRef.current.rotation.y = -wingFlap;
  });

  return (
    <group ref={batRef} position={[0, 0.2, 0]}>
      {/* Gaunt Furry Torso */}
      <mesh castShadow>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial color="#171224" roughness={0.9} />
      </mesh>
      {/* Pointed Predatory Pin Ears */}
      {[-0.18, 0.18].map((ex, i) => (
        <mesh key={i} position={[ex, 0.38, 0]} rotation={[0, 0, ex > 0 ? -0.35 : 0.35]}>
          <coneGeometry args={[0.09, 0.3, 4]} />
          <meshStandardMaterial color="#241b38" roughness={0.85} />
        </mesh>
      ))}
      {/* Piercing Witchfire Eyes */}
      {[-0.12, 0.12].map((ex, i) => (
        <group key={i} position={[ex, 0.08, 0.32]}>
          <mesh>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#020408" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
          <pointLight color="#a855f7" intensity={1.6} distance={0.9} />
        </group>
      ))}
      {/* Bared Fangs */}
      {[-0.06, 0.06].map((fx, i) => (
        <mesh key={i} position={[fx, -0.1, 0.35]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.02, 0.08, 3]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
      {/* Left Leathery Arched Wing */}
      <group ref={leftWingRef} position={[-0.25, 0, 0]}>
        <mesh position={[-0.65, 0.1, 0]} rotation={[0, 0, 0.25]}>
          <boxGeometry args={[1.1, 0.55, 0.02]} />
          <meshStandardMaterial color="#140e1f" roughness={0.9} side={2} />
        </mesh>
      </group>
      {/* Right Leathery Arched Wing */}
      <group ref={rightWingRef} position={[0.25, 0, 0]}>
        <mesh position={[0.65, 0.1, 0]} rotation={[0, 0, -0.25]}>
          <boxGeometry args={[1.1, 0.55, 0.02]} />
          <meshStandardMaterial color="#140e1f" roughness={0.9} side={2} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Frankenstein3DModel - The Patchwork Man (Brutal Undead Monster)
 * Hulking squared cranium, dead necrotic flesh, protruding iron neck bolts, electric emerald glare.
 */
function Frankenstein3DModel({ speed = 1.0 }: { speed?: number }) {
  const modelRef = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(t * 1.2) * 0.05;
      modelRef.current.rotation.y = Math.sin(t * 0.6) * 0.1;
    }
  });

  return (
    <group ref={modelRef} position={[0, 0.1, 0]}>
      {/* Hulking Broad Shrouded Torso */}
      <mesh castShadow>
        <boxGeometry args={[1.05, 1.15, 0.6]} />
        <meshStandardMaterial color="#131c17" roughness={0.95} />
      </mesh>
      {/* Dead Necrotic Stitched Head */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <boxGeometry args={[0.58, 0.68, 0.58]} />
        <meshStandardMaterial color="#3d4f43" roughness={0.75} />
      </mesh>
      {/* Flat Square Skull Ridge */}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[0.62, 0.12, 0.62]} />
        <meshStandardMaterial color="#080d0a" roughness={0.95} />
      </mesh>
      {/* Heavy Jagged Iron Neck Bolts with Crackling Sparks */}
      {[-0.42, 0.42].map((bx, i) => (
        <group key={i} position={[bx, 0.48, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.07, 0.28, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          <pointLight color="#10b981" intensity={1.5} distance={0.9} />
        </group>
      ))}
      {/* Sunken Sockets with Unblinking Emerald Gaze */}
      {[-0.15, 0.15].map((ex, i) => (
        <group key={i} position={[ex, 0.92, 0.3]}>
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#020408" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <pointLight color="#10b981" intensity={1.8} distance={1.0} />
        </group>
      ))}
      {/* Forehead Autopsy Stitch Scar */}
      <mesh position={[0, 1.08, 0.31]}>
        <boxGeometry args={[0.38, 0.03, 0.02]} />
        <meshBasicMaterial color="#142018" />
      </mesh>
    </group>
  );
}

/**
 * Snowman3DModel - Mr. Frost (Ancient Folk-Horror Frost Wight)
 * Glacial frozen snow body, icicle teeth, crooked funeral hat, sunken coal sockets with frost breath.
 */
function Snowman3DModel({ speed = 1.0 }: { speed?: number }) {
  const modelRef = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(t * 1.4) * 0.06;
      modelRef.current.rotation.y = Math.sin(t * 0.7) * 0.14;
    }
  });

  return (
    <group ref={modelRef} position={[0, 0.1, 0]}>
      {/* Rough Glacial Snow Base */}
      <mesh position={[0, -0.3, 0]} castShadow>
        <sphereGeometry args={[0.68, 24, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      {/* Frost Wight Head */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <sphereGeometry args={[0.46, 24, 24]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      {/* Crooked Funeral Stovepipe Hat */}
      <group position={[0, 0.88, 0]} rotation={[0.1, 0, 0.15]}>
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 0.04, 24]} />
          <meshStandardMaterial color="#080b12" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.56, 24]} />
          <meshStandardMaterial color="#080b12" roughness={0.9} />
        </mesh>
      </group>
      {/* Rotten Carrot Stake */}
      <mesh position={[0, 0.48, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.42, 12]} />
        <meshStandardMaterial color="#c2410c" roughness={0.8} />
      </mesh>
      {/* Burning Ice Coal Sockets */}
      {[-0.15, 0.15].map((ex, i) => (
        <group key={i} position={[ex, 0.56, 0.4]}>
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#01040a" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <pointLight color="#38bdf8" intensity={1.6} distance={0.9} />
        </group>
      ))}
      {/* Icicle Fang Grin */}
      {[-0.1, -0.03, 0.04, 0.11].map((fx, i) => (
        <mesh key={i} position={[fx, 0.34, 0.44]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.02, 0.08, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Goblin3DModel - Snagtooth (Feral Imp of the Catacombs)
 * Wicked elongated twitching ears, hooked snout, crooked underbite fangs, piercing covetous gold eyes.
 */
function Goblin3DModel({ speed = 1.0 }: { speed?: number }) {
  const modelRef = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(t * 2.2) * 0.08;
      modelRef.current.rotation.y = Math.sin(t * 1.2) * 0.18;
    }
  });

  return (
    <group ref={modelRef} position={[0, 0.1, 0]}>
      {/* Hunched Ragged Torso */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <coneGeometry args={[0.55, 1.15, 12]} />
        <meshStandardMaterial color="#283618" roughness={0.95} />
      </mesh>
      {/* Goblin Head */}
      <mesh position={[0, 0.55, 0.05]} castShadow>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshStandardMaterial color="#4d6b30" roughness={0.7} />
      </mesh>
      {/* Long Wicked Pointed Ears */}
      {[-0.48, 0.48].map((ex, i) => (
        <mesh key={i} position={[ex, 0.62, -0.05]} rotation={[0, 0, ex > 0 ? -0.85 : 0.85]}>
          <coneGeometry args={[0.16, 0.6, 6]} />
          <meshStandardMaterial color="#4d6b30" roughness={0.7} />
        </mesh>
      ))}
      {/* Hooked Predatory Snout */}
      <mesh position={[0, 0.48, 0.44]} rotation={[0.55, 0, 0]}>
        <coneGeometry args={[0.09, 0.35, 8]} />
        <meshStandardMaterial color="#374d22" roughness={0.8} />
      </mesh>
      {/* Piercing Covetous Gold Eyes */}
      {[-0.14, 0.14].map((ex, i) => (
        <group key={i} position={[ex, 0.62, 0.36]}>
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#020408" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
          <pointLight color="#eab308" intensity={1.8} distance={0.9} />
        </group>
      ))}
      {/* Protruding Underbite Fangs */}
      {[-0.08, 0.08].map((fx, i) => (
        <mesh key={i} position={[fx, 0.36, 0.41]}>
          <coneGeometry args={[0.03, 0.12, 4]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Mummy3DModel - Ankhef (Desiccated Crypt Pharaoh)
 * Blackened rotting linen wraps, exposed rib lines, cursed golden scarab, burning amber eye sockets.
 */
function Mummy3DModel({ speed = 1.0 }: { speed?: number }) {
  const modelRef = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(t * 1.1) * 0.05;
      modelRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={modelRef} position={[0, 0.1, 0]}>
      {/* Desiccated Torso */}
      <mesh castShadow>
        <cylinderGeometry args={[0.42, 0.52, 1.4, 16]} />
        <meshStandardMaterial color="#b8b09d" roughness={0.95} />
      </mesh>
      {/* Decaying Bandage Wraps */}
      {[-0.45, -0.2, 0.1, 0.38].map((by, i) => (
        <mesh key={i} position={[0, by, 0]}>
          <torusGeometry args={[0.46 - by * 0.06, 0.035, 8, 20]} />
          <meshStandardMaterial color="#8c826e" roughness={0.9} />
        </mesh>
      ))}
      {/* Skeletal Mummy Skull */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial color="#9e9480" roughness={0.9} />
      </mesh>
      {/* Cursed Golden Scarab Chest Amulet */}
      <mesh position={[0, 0.28, 0.45]}>
        <boxGeometry args={[0.22, 0.22, 0.06]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Burning Curse Amber Eye Hollows */}
      {[-0.12, 0.12].map((ex, i) => (
        <group key={i} position={[ex, 0.88, 0.35]}>
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#020408" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.048, 12, 12]} />
            <meshBasicMaterial color="#d97706" />
          </mesh>
          <pointLight color="#d97706" intensity={2.0} distance={1.1} />
        </group>
      ))}
    </group>
  );
}

/**
 * Yeti3DModel - Himal (The Mountain Beast)
 * Looming broad hunched fur shoulders, dark sunken face with razor fangs, piercing freezing blue stare.
 */
function Yeti3DModel({ speed = 1.0 }: { speed?: number }) {
  const modelRef = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(t * 1.3) * 0.06;
      modelRef.current.rotation.y = Math.sin(t * 0.6) * 0.12;
    }
  });

  return (
    <group ref={modelRef} position={[0, 0.1, 0]}>
      {/* Massive Shaggy Fur Torso */}
      <mesh castShadow>
        <sphereGeometry args={[0.8, 24, 24]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.95} />
      </mesh>
      {/* Upper Fur Hunch */}
      <mesh position={[0, 0.48, -0.1]} castShadow>
        <sphereGeometry args={[0.58, 20, 20]} />
        <meshStandardMaterial color="#64748b" roughness={0.95} />
      </mesh>
      {/* Recessed Abyssal Face Mask */}
      <mesh position={[0, 0.42, 0.44]}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      {/* Piercing Freezing Eyes */}
      {[-0.1, 0.1].map((ex, i) => (
        <group key={i} position={[ex, 0.45, 0.62]}>
          <mesh>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#01040a" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <pointLight color="#38bdf8" intensity={1.8} distance={0.9} />
        </group>
      ))}
      {/* Bared Beast Fangs */}
      {[-0.07, 0.07].map((fx, i) => (
        <mesh key={i} position={[fx, 0.32, 0.64]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.02, 0.08, 4]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Candyman3DModel - The Candyman (Urban Legend)
 * Tall ragged coat, dark tilted top hat casting shadow over gaunt face, razor iron hook arm, bloodshot eyes.
 */
function Candyman3DModel({ speed = 1.0 }: { speed?: number }) {
  const modelRef = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(t * 1.5) * 0.07;
      modelRef.current.rotation.y = Math.sin(t * 0.7) * 0.14;
    }
  });

  return (
    <group ref={modelRef} position={[0, 0.1, 0]}>
      {/* Ragged Long Dark Coat */}
      <mesh castShadow>
        <coneGeometry args={[0.68, 1.55, 16]} />
        <meshStandardMaterial color="#271c16" roughness={0.85} />
      </mesh>
      {/* Shadowed Visage */}
      <mesh position={[0, 0.74, 0.05]} castShadow>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial color="#8c6239" roughness={0.6} />
      </mesh>
      {/* Tilted Dark Hat */}
      <group position={[0, 1.02, 0]} rotation={[0.08, 0, -0.1]}>
        <mesh>
          <cylinderGeometry args={[0.45, 0.45, 0.04, 20]} />
          <meshStandardMaterial color="#0c0a08" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.29, 0.29, 0.44, 20]} />
          <meshStandardMaterial color="#0c0a08" roughness={0.95} />
        </mesh>
      </group>
      {/* Menacing Silver Iron Hook */}
      <group position={[0.58, 0.18, 0.25]} rotation={[0.35, 0, 0.4]}>
        <mesh>
          <cylinderGeometry args={[0.045, 0.045, 0.38, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.22, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.035, 8, 16, Math.PI * 0.95]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.1} />
        </mesh>
      </group>
      {/* Piercing Blood-Red Eyes */}
      {[-0.12, 0.12].map((ex, i) => (
        <group key={i} position={[ex, 0.76, 0.38]}>
          <mesh>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshBasicMaterial color="#020408" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
          <pointLight color="#dc2626" intensity={1.6} distance={0.9} />
        </group>
      ))}
    </group>
  );
}

/**
 * BestiaryCharacter3D
 * 
 * Scary, atmospheric, visceral horror creature showcase:
 * - NO stands or pedestals on top or bottom
 * - NO confetti particles — replaced with real creeping crypt fog
 * - Dedicated, authentic, terrifying 3D sculpts for every single character in the bestiary
 * - Chiaroscuro lighting where the monster emerges out of deep shadow
 */
export function BestiaryCharacter3D({
  characterId,
  hauntMode = 'manifest',
  accentColor,
  scale = 1.25,
  onTriggerCurse,
}: BestiaryCharacter3DProps) {
  const actorGroupRef = useRef<Group>(null);
  const [shockwave, setShockwave] = useState(false);
  const config = HAUNT_SPEEDS[hauntMode] || HAUNT_SPEEDS.manifest;

  // Resolve accent color
  const resolvedAccent = accentColor ?? (
    characterId === 'ghost' || characterId === 'wisp' ? '#00f0ff' :
    characterId === 'pumpkin' ? '#ff8800' :
    characterId === 'vampire' ? '#ff0033' :
    characterId === 'bat' ? '#a855f7' :
    characterId === 'frankenstein' ? '#10b981' :
    characterId === 'goblin' ? '#eab308' :
    characterId === 'mummy' ? '#d97706' :
    characterId === 'snowman' ? '#38bdf8' :
    characterId === 'yeti' ? '#38bdf8' :
    characterId === 'candyman' ? '#dc2626' : '#00f0ff'
  );

  const handleCurseClick = () => {
    playSound('coffinCreak');
    setShockwave(true);
    setTimeout(() => setShockwave(false), 900);
    onTriggerCurse?.();
  };

  useFrame((state) => {
    if (!actorGroupRef.current) return;
    const t = state.clock.elapsedTime * config.speed;
    const mouse = state.mouse;

    // Organic banking toward mouse
    const targetRotX = mouse.y * 0.25;
    const targetRotY = mouse.x * 0.45;
    const targetRotZ = -mouse.x * 0.15;

    actorGroupRef.current.rotation.x += (targetRotX - actorGroupRef.current.rotation.x) * 0.08;
    actorGroupRef.current.rotation.y += (targetRotY - actorGroupRef.current.rotation.y) * 0.08;
    actorGroupRef.current.rotation.z += (targetRotZ - actorGroupRef.current.rotation.z) * 0.08;

    // Atmospheric breathing displacement
    actorGroupRef.current.position.x = Math.sin(t * 1.2) * config.wobble + mouse.x * 0.35;
    actorGroupRef.current.position.y = Math.cos(t * 1.5) * config.wobble + mouse.y * 0.25;
  });

  const isFrost = characterId === 'snowman' || characterId === 'yeti';

  return (
    <group scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* 1. VISCERAL LORE-ACCURATE HORROR LIGHTING */}
      {isFrost ? (
        <>
          {/* Cold Arctic Daylight Blizzard Fill */}
          <ambientLight intensity={1.1} color="#bae6fd" />
          <directionalLight position={[4, 5, 4]} intensity={1.6} color="#ffffff" />
          <directionalLight position={[0, 3, -4]} intensity={2.4} color="#7dd3fc" />
        </>
      ) : (
        <>
          {/* Muted Cold Crypt Ambient Fill */}
          <ambientLight intensity={0.55} color="#64748b" />
          <directionalLight position={[4, 5, 4]} intensity={1.3} color="#e2e8f0" />
          <directionalLight position={[0, 3, -4]} intensity={2.2} color={resolvedAccent} />
        </>
      )}

      {/* 2. DEDICATED BESPOKE 3D MONSTER MODELS (Zero background planes on character) */}

      {/* 3. DEDICATED BESPOKE 3D MONSTER MODELS (Every creature is distinct & scary!) */}
      <group ref={actorGroupRef} onClick={handleCurseClick}>
        {characterId === 'ghost' || characterId === 'wisp' ? (
          <Wisp3DModel speed={config.speed} />
        ) : characterId === 'pumpkin' ? (
          <Pumpkin3DModel speed={config.speed} />
        ) : characterId === 'vampire' ? (
          <Vampire3DModel speed={config.speed} />
        ) : characterId === 'bat' ? (
          <Bat3DModel speed={config.speed} />
        ) : characterId === 'frankenstein' ? (
          <Frankenstein3DModel speed={config.speed} />
        ) : characterId === 'snowman' ? (
          <Snowman3DModel speed={config.speed} />
        ) : characterId === 'goblin' ? (
          <Goblin3DModel speed={config.speed} />
        ) : characterId === 'mummy' ? (
          <Mummy3DModel speed={config.speed} />
        ) : characterId === 'yeti' ? (
          <Yeti3DModel speed={config.speed} />
        ) : characterId === 'candyman' ? (
          <Candyman3DModel speed={config.speed} />
        ) : (
          <Wisp3DModel speed={config.speed} />
        )}

        {/* Shockwave Ring on Click */}
        {shockwave && (
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 1.8, 32]} />
            <meshBasicMaterial color={resolvedAccent} transparent opacity={0.75} />
          </mesh>
        )}
      </group>
    </group>
  );
}
