/**
 * Bestiary character descriptor types
 *
 * A character is data, not a bespoke component. Every creature is described by
 * a `CharacterSpec`, and the shared `Character` renderer turns that data into a
 * consistent, animated, accessible figure. Adding a creature means writing a
 * spec, not drawing a new component from scratch.
 *
 * @module components/bestiary/types
 */

import type { ReactNode } from 'react';
import type { CreatureAccent } from './characterTokens';

/** Shared size presets for the whole cast. */
export type CharacterSize = 'sm' | 'md' | 'lg';

/**
 * A single eye. Coordinates are in the shared `0 0 100 100` character viewBox.
 * The renderer fills eyes with the creature's accent color and gives them the
 * matching glow, so individual creatures never pick eye colors directly.
 */
export interface CharacterEye {
  cx: number;
  cy: number;
  /** Eye radius in viewBox units (default 4). */
  r?: number;
}

/**
 * A flat shape layer painted before the face. Layers stack in array order
 * (first = furthest back). `fill` and `stroke` should be token values from
 * `creatureMaterials`, never raw hex at the call site.
 */
export interface CharacterLayer {
  /** SVG path `d` in the shared `0 0 100 100` viewBox. */
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  /** 0 - 1 opacity for soft/under layers. */
  opacity?: number;
}

/**
 * The complete declarative description of a creature. This is the entire
 * surface area an author touches to add a new character.
 */
export interface CharacterSpec {
  /** Stable id, used for keys and the showcase registry. */
  id: string;
  /** Display name shown to people (no jargon, no implementation detail). */
  name: string;
  /** One-line flavor shown under the name. Keep it evocative and plain. */
  tagline: string;
  /** Eye-glow accent; drives eye fill and aura. */
  accent: CreatureAccent;
  /**
   * Body/feature shapes, back-to-front. Built from `creatureMaterials` tokens.
   * This is the silhouette and detailing that makes the creature recognizable.
   * Also serves as the 2D fallback when 3D is unavailable.
   */
  layers: CharacterLayer[];
  /** Eye placements. Most creatures have two; some (cyclops gourds) have one. */
  eyes: CharacterEye[];
  /**
   * Optional foreground flourish rendered above everything (fangs, stitches,
   * a candy cane) as raw SVG children. Still token-colored.
   */
  flourish?: ReactNode;
  /** Optional sound played on hover. Must be one of the built-in effects. */
  hoverSound?: 'stoneGrind' | 'coffinCreak' | 'boneClick' | 'cauldronBubble';
}

/**
 * Identity helper that validates/normalizes a spec at authoring time and gives
 * editors full type inference. Pure, no runtime cost beyond returning the spec.
 *
 * @example
 * ```ts
 * export const pumpkinSpec = defineCharacter({
 *   id: 'pumpkin',
 *   name: 'Jack',
 *   tagline: 'Carved, lit, and grinning in the dark',
 *   accent: 'ember',
 *   layers: [...],
 *   eyes: [{ cx: 38, cy: 52 }, { cx: 62, cy: 52 }],
 * });
 * ```
 */
export function defineCharacter(spec: CharacterSpec): CharacterSpec {
  return spec;
}
