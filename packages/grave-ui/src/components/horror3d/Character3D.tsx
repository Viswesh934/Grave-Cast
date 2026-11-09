/**
 * Character3D - the one 3D renderer behind every creature in the bestiary.
 *
 * Give it a `CharacterSpec` with a `build3d` parts list and it assembles a lit,
 * idle-animated 3D figure: stacked primitive meshes, glowing accent eyes, and a
 * soft accent light. Same philosophy as the 2D `Character` - a creature is
 * data, one renderer draws them all - but here 3D is the star.
 *
 * Drop it inside a `<Canvas>` (re-exported from this package). For automatic
 * 2D fallback when WebGL is unavailable, use the `BestiaryCharacter` wrapper
 * from the bestiary module instead.
 *
 * @module components/horror3d/Character3D
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Group } from 'three';
import { palette } from '../../tokens';
import { creatureAccents } from '../bestiary/characterTokens';
import type {
  CharacterPart,
  CharacterSpec,
  PartMotion,
} from '../bestiary/types';

export interface Character3DProps {
  /** The creature to build. Must have a `build3d` parts list. */
  spec: CharacterSpec;
  /** Overall figure scale. */
  scale?: number;
}

const DEFAULT_SIZE = 0.5;
const DEFAULT_EYE = 0.09;

/** Cool studio lighting shared by every creature, sourced from the palette. */
const sceneLight = {
  ambient: palette.mist[100],
  key: palette.bone[100],
  fill: palette.mist[300],
} as const;

/** Normalize a part's `size` into an [x, y, z] triple for the group scale. */
function sizeTriple(size: CharacterPart['size']): [number, number, number] {
  if (size === undefined) return [DEFAULT_SIZE, DEFAULT_SIZE, DEFAULT_SIZE];
  return typeof size === 'number' ? [size, size, size] : size;
}

/** Per-part idle transform, evaluated each frame off the shared clock. */
function applyMotion(motion: PartMotion | undefined, t: number, obj: Group) {
  switch (motion) {
    case 'bob':
      obj.position.y = Math.sin(t * 2) * 0.05;
      break;
    case 'sway':
      obj.rotation.z = Math.sin(t * 1.5) * 0.12;
      break;
    case 'spin':
      obj.rotation.y = t * 0.8;
      break;
    case 'flap':
      obj.rotation.z = Math.sin(t * 6) * 0.5;
      break;
    default:
      break;
  }
}

/** One body part: unit-sized primitive geometry + matte or glowing material. */
function PartMesh({ part }: { part: CharacterPart }) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    if (ref.current) applyMotion(part.motion, state.clock.elapsedTime, ref.current);
  });

  return (
    <group ref={ref}>
      <mesh castShadow>
        {part.shape === 'sphere' && <sphereGeometry args={[0.5, 20, 16]} />}
        {part.shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {part.shape === 'cone' && <coneGeometry args={[0.5, 1, 20]} />}
        {part.shape === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 20]} />}
        {part.shape === 'capsule' && <capsuleGeometry args={[0.4, 0.6, 8, 16]} />}
        {part.glow ? (
          <meshBasicMaterial color={part.color} />
        ) : (
          <meshStandardMaterial color={part.color} roughness={part.roughness ?? 0.7} />
        )}
      </mesh>
    </group>
  );
}

/**
 * Builds a creature from its `build3d` spec.
 *
 * @example
 * ```tsx
 * import { Canvas, Character3D, pumpkinSpec } from 'groove-ui';
 *
 * <Canvas camera={{ position: [0, 0, 4], fov: 42 }}>
 *   <Character3D spec={pumpkinSpec} />
 * </Canvas>
 * ```
 */
export function Character3D({ spec, scale = 1 }: Character3DProps) {
  const groupRef = useRef<Group>(null);
  const build = spec.build3d;
  const accentColor = creatureAccents[spec.accent];
  const eyeSize = build?.eyeSize ?? DEFAULT_EYE;
  const idle = build?.idle ?? 'bob';

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    if (idle === 'bob') groupRef.current.position.y = Math.sin(t * 1.6) * 0.08;
    if (idle === 'sway') groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.06;
    if (idle === 'spin') groupRef.current.rotation.y = t * 0.5;
  });

  if (!build) return null;

  return (
    <group scale={[scale, scale, scale]}>
      {/* Self-contained, high-visibility lighting (matches the 3D suite). */}
      <ambientLight intensity={1.05} color={sceneLight.ambient} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} color={sceneLight.key} />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color={sceneLight.fill} />
      {/* Accent glow that tints the creature from the front. */}
      <pointLight position={[0, 0.4, 1.6]} intensity={1.4} color={accentColor} distance={6} />

      <Float speed={1} rotationIntensity={0.08} floatIntensity={0.12}>
        <group ref={groupRef}>
          {/* Each part: scale the group (geometry stays unit-sized), then place it. */}
          {build.parts.map((part, i) => {
            const scale3 = sizeTriple(part.size);
            return (
              <group key={i} position={part.position ?? [0, 0, 0]} rotation={part.rotation ?? [0, 0, 0]}>
                <group scale={scale3}>
                  <PartMesh part={part} />
                </group>
              </group>
            );
          })}

          {/* Glowing accent eyes with their own halo light. */}
          {build.eyes.map((pos, i) => (
            <group key={`eye-${i}`} position={pos}>
              <mesh>
                <sphereGeometry args={[eyeSize, 16, 12]} />
                <meshBasicMaterial color={accentColor} />
              </mesh>
              <pointLight color={accentColor} intensity={0.5} distance={1.2} />
            </group>
          ))}
        </group>
      </Float>
    </group>
  );
}

Character3D.displayName = 'Character3D';
