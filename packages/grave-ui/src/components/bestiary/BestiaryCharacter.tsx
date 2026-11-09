/**
 * BestiaryCharacter - a creature that shows its 3D self when it can, and the
 * flat 2D drawing when it can't.
 *
 * This is the component to reach for. It checks whether 3D is available (and
 * whether the viewer prefers reduced motion), then either spins up a little
 * 3D scene or falls back to the lightweight 2D figure. The Three.js code is
 * loaded only when 3D is actually used, so the 2D path stays small.
 *
 * @module components/bestiary/BestiaryCharacter
 */

import { Suspense, lazy, useMemo, type HTMLAttributes } from 'react';
import { useHorrorFallback } from '../../hooks';
import { Character } from './Character';
import { characterSizes } from './characterTokens';
import type { CharacterSize, CharacterSpec } from './types';

// Three.js + the 3D renderer load on demand, only when a 3D creature renders.
const Canvas = lazy(() =>
  import('@react-three/fiber').then((m) => ({ default: m.Canvas }))
);
const Character3D = lazy(() =>
  import('../horror3d/Character3D').then((m) => ({ default: m.Character3D }))
);
const OrbitControls = lazy(() =>
  import('@react-three/drei').then((m) => ({ default: m.OrbitControls }))
);

export interface BestiaryCharacterProps extends HTMLAttributes<HTMLDivElement> {
  /** The creature to show. */
  spec: CharacterSpec;
  /** Size preset (default 'md'). Drives the 2D figure and the 3D viewport box. */
  size?: CharacterSize;
  /** Force the 2D fallback regardless of device capability. */
  force2D?: boolean;
  /** Allow dragging to orbit the 3D creature (default true). */
  orbit?: boolean;
  /** Play the creature's hover sound in 2D fallback (default true). */
  sound?: boolean;
  /** Show the name/tagline caption beneath the figure (default false). */
  showLabel?: boolean;
}

/**
 * Renders a creature in 3D when possible, else the 2D fallback.
 *
 * @example
 * ```tsx
 * import { BestiaryCharacter, pumpkinSpec } from 'groove-ui';
 *
 * <BestiaryCharacter spec={pumpkinSpec} size="lg" showLabel />
 * ```
 */
export function BestiaryCharacter({
  spec,
  size = 'md',
  force2D = false,
  orbit = true,
  sound = true,
  showLabel = false,
  className = '',
  style,
  ...props
}: BestiaryCharacterProps) {
  const shouldFallback = useHorrorFallback(force2D || undefined);
  const dimension = characterSizes[size];

  // No 3D build, forced 2D, or no WebGL -> draw the flat figure.
  const use2D = shouldFallback || !spec.build3d;

  const caption = useMemo(
    () =>
      showLabel ? (
        <div className="text-center mt-2">
          <p className="font-serif font-semibold text-sm text-grave-bone-100">{spec.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-grave-mist-400">
            {spec.tagline}
          </p>
        </div>
      ) : null,
    [showLabel, spec.name, spec.tagline]
  );

  if (use2D) {
    return <Character spec={spec} size={size} sound={sound} showLabel={showLabel} className={className} style={style} {...props} />;
  }

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      style={{ width: dimension, ...style }}
      {...props}
    >
      <div style={{ width: dimension, height: dimension }}>
        <Suspense fallback={<Character spec={spec} size={size} sound={false} />}>
          <Canvas camera={{ position: [0, 0, 4], fov: 42 }} dpr={[1, 2]}>
            <Character3D spec={spec} />
            {orbit && <OrbitControls enablePan={false} enableZoom={false} />}
          </Canvas>
        </Suspense>
      </div>
      {caption}
    </div>
  );
}

BestiaryCharacter.displayName = 'BestiaryCharacter';
