/**
 * BestiaryCharacter - the creature you drop into a page.
 *
 * A thin wrapper over {@link Character} that renders the cast's layered SVG art
 * with a dimensional, faux-3D feel: it tilts toward the pointer, lifts and
 * casts a soft shadow on hover, and grows on double-click. No WebGL — the 2D
 * art is the whole thing, so it stays light and works everywhere.
 *
 * @module components/bestiary/BestiaryCharacter
 */

import { type HTMLAttributes } from 'react';
import { Character } from './Character';
import type { CharacterSize, CharacterSpec } from './types';

export interface BestiaryCharacterProps extends HTMLAttributes<HTMLDivElement> {
  /** The creature to show. */
  spec: CharacterSpec;
  /** Size preset (default 'md'). */
  size?: CharacterSize;
  /** Tilt toward the pointer for a dimensional feel (default true). */
  tilt?: boolean;
  /** Double-click to swell the figure (default true). */
  growable?: boolean;
  /** Play the creature's hover sound (default true). */
  sound?: boolean;
  /** Show the name/tagline caption beneath the figure (default false). */
  showLabel?: boolean;
}

/**
 * Renders a creature with the dimensional 2D treatment.
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
  tilt = true,
  growable = true,
  sound = true,
  showLabel = false,
  ...props
}: BestiaryCharacterProps) {
  return (
    <Character
      spec={spec}
      size={size}
      tilt={tilt}
      growable={growable}
      sound={sound}
      showLabel={showLabel}
      {...props}
    />
  );
}

BestiaryCharacter.displayName = 'BestiaryCharacter';
