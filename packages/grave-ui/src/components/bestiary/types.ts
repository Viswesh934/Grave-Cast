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
 * Primitive mesh shapes the 3D renderer knows how to build. Kept intentionally
 * small: a creature is a stack of these blobs, not a bespoke 3D model.
 */
export type PartShape = 'sphere' | 'box' | 'cone' | 'cylinder' | 'capsule';

/** Idle motion presets the renderer applies to a part, driven off the clock. */
export type PartMotion = 'none' | 'bob' | 'sway' | 'spin' | 'flap';

/**
 * One 3D body part. Position/scale are in local units (the whole creature lives
 * in roughly a 2-unit-tall box). Colors come from `creatureMaterials`; glowing
 * parts set `glow` to emit light instead of just reflecting it.
 */
export interface CharacterPart {
  shape: PartShape;
  /** [x, y, z] center, default [0, 0, 0]. */
  position?: [number, number, number];
  /** Uniform size, or [x, y, z] for stretched shapes. Default 0.5. */
  size?: number | [number, number, number];
  /** Euler rotation in radians, default [0, 0, 0]. */
  rotation?: [number, number, number];
  /** Surface color (a `creatureMaterials` token). */
  color: string;
  /** Make this part emit/pop as a glowing accent (eyes, embers, runes). */
  glow?: boolean;
  /** How matte the surface is, 0 (glossy) to 1 (chalky). Default 0.7. */
  roughness?: number;
  /** Optional idle animation for this part. */
  motion?: PartMotion;
}

/**
 * The 3D build for a creature: a parts list plus how the whole figure idles.
 * Optional — a creature without it still renders in 3D mode by extruding its
 * 2D silhouette, but a hand-tuned parts list looks far better.
 */
export interface Character3DSpec {
  /** Body parts assembled back-to-front. */
  parts: CharacterPart[];
  /** Eye positions in 3D space (glow + accent light attach here). */
  eyes: [number, number, number][];
  /** Eye radius (default 0.09). */
  eyeSize?: number;
  /** Whole-figure idle motion (default 'bob'). */
  idle?: PartMotion;
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
   * Optional 3D build. When present and WebGL is available, the creature
   * renders as a lit 3D scene; otherwise it falls back to the 2D `layers`.
   */
  build3d?: Character3DSpec;
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
