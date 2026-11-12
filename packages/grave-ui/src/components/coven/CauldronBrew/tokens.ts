/**
 * CauldronBrew component tokens
 *
 * Brew color variants anchor their primary glow to the core palette
 * (witch/sanguine archetypes). The multi-stop liquid gradients and the
 * cast-iron cauldron body use representational shade variations that have no
 * single base-token equivalent, so they are named here per the
 * "component-specific token extension" rule rather than inlined as hex.
 *
 * @module components/coven/CauldronBrew/tokens
 */

import { palette } from '../../../tokens';

export type BrewColor = 'emerald' | 'witchfire' | 'blood' | 'gold';

/** Per-variant brew appearance. `glow` is a core palette token. */
export const brewVariants: Record<
  BrewColor,
  { glow: string; liquid: string; steam: string }
> = {
  emerald: {
    glow: palette.witch.emerald,
    liquid: 'linear-gradient(180deg, #34d399 0%, #059669 60%, #064e3b 100%)',
    steam: 'rgba(52, 211, 153, 0.35)',
  },
  witchfire: {
    glow: palette.witch.fire,
    liquid: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 60%, #4c1d95 100%)',
    steam: 'rgba(167, 139, 250, 0.35)',
  },
  blood: {
    glow: palette.sanguine.crimson,
    liquid: 'linear-gradient(180deg, #f87171 0%, #dc2626 60%, #450a0a 100%)',
    steam: 'rgba(239, 68, 68, 0.35)',
  },
  gold: {
    glow: palette.witch.gold,
    liquid: 'linear-gradient(180deg, #fde047 0%, #ca8a04 60%, #713f12 100%)',
    steam: 'rgba(253, 224, 71, 0.35)',
  },
};

/**
 * Cauldron body shades: old bronze-patinated cast iron, warm enough to read
 * against dark backgrounds. The belly also picks up the brew's glow.
 */
export const cauldronBody = {
  handleStroke: '#8a6a3f',
  legLight: '#4a3d33',
  legDark: '#3a3029',
  legEdge: '#1c1612',
  bellyFill: '#3d342e',
  bellyShade: '#221c18',
  bellyStroke: '#7a5f3d',
  rimFill: '#4a3f36',
  rimStroke: '#a8834f',
  gradientBase: '#1a1410',
  /** How strongly the brew lights the top of the belly, from 0 to 1. */
  glowOnBelly: 0.45,
} as const;

/** Materials for the 3D cauldron, matching the 2D body. */
export const cauldronMetal3D = {
  belly: { color: '#4a3f37', roughness: 0.55, metalness: 0.55, glow: 0.18 },
  rim: { color: '#9a7646', roughness: 0.45, metalness: 0.7, glow: 0.3 },
  bracket: { color: '#7d6040', roughness: 0.5, metalness: 0.7 },
  ring: { color: '#b08a55', roughness: 0.35, metalness: 0.8 },
  feet: { color: '#3d332c', roughness: 0.7, metalness: 0.4 },
  /** The ground below, for the soft fill light. */
  ground: '#1f1610',
  /** A warm candle-white key light. */
  keyLight: { color: '#fff7ed', intensity: 1.2 },
  ambient: 0.85,
  fill: 0.9,
} as const;

/** Bubble animation durations (seconds). */
export const bubbleTiming = {
  steamSlow: '2.4s',
  steamArc: '3s',
  bubbleA: '1.5s',
  bubbleB: '2.1s',
  bubbleC: '1.2s',
} as const;
