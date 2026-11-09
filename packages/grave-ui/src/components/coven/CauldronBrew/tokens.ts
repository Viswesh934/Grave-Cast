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

/** Cast-iron cauldron body shades (representational metalwork). */
export const cauldronBody = {
  handleStroke: palette.dark[700],
  legLight: palette.dark[800],
  legDark: '#101117',
  legEdge: '#0a0a0f',
  bellyFill: '#181a26',
  bellyStroke: palette.dark[600],
  rimFill: '#12131d',
  rimStroke: '#363952',
  gradientBase: '#0d0914',
} as const;

/** Bubble animation durations (seconds). */
export const bubbleTiming = {
  steamSlow: '2.4s',
  steamArc: '3s',
  bubbleA: '1.5s',
  bubbleB: '2.1s',
  bubbleC: '1.2s',
} as const;
