/**
 * HorrorCursor component tokens.
 *
 * Maps each cursor variant to palette-derived colors, glow shadows, trail
 * behavior, and motion timing. All raw values reference the shared token
 * system so cursors stay visually consistent with the rest of Grave-UI.
 *
 * @module components/effects/HorrorCursor/tokens
 */

import { palette } from '../../../tokens/colors';
import { animations } from '../../../tokens/animations';
import type { CursorDamping } from '../../../hooks/useCursorTracker';

/**
 * The available horror cursor variants.
 */
export type HorrorCursorVariant =
  | 'ritual-candle'
  | 'bloody-dagger'
  | 'spectral-wisp'
  | 'skeletal-hand';

/**
 * Per-variant visual + motion configuration.
 */
export interface CursorVariantToken {
  /** Primary glyph color */
  color: string;
  /** Accent color for secondary details (flame, blood, glow orb) */
  accent: string;
  /** Glow color used for the drop-shadow halo */
  glow: string;
  /** Glyph size in pixels */
  size: number;
  /** Follow damping preset (how far the cursor trails the pointer) */
  damping: CursorDamping;
  /** Length of the fading motion trail (number of echo copies, 0 = none) */
  trailLength: number;
  /**
   * Anchor offset as a fraction of size, positioning the glyph relative to the
   * true pointer. e.g. a dagger tip sits at the top-left, a wisp is centered.
   */
  anchor: { x: number; y: number };
}

/** Radius (px) of the soft glow halo rendered behind every cursor. */
export const CURSOR_GLOW_BLUR = 6;

/** Scale applied to the glyph while the pointer button is pressed. */
export const CURSOR_PRESS_SCALE = 0.82;

/** Transition used for the press/scale reaction. */
export const CURSOR_PRESS_TRANSITION = `transform ${animations.durations.pulse} ${animations.easing.easeOutCurse}`;

/** Opacity step applied to each successive trail echo. */
export const CURSOR_TRAIL_FALLOFF = 0.55;

/** Peak opacity of the nearest trail echo (scaled down by falloff per step). */
export const CURSOR_TRAIL_OPACITY = 0.5;

/** How much each successive trail echo shrinks, as a fraction of size per step. */
export const CURSOR_TRAIL_SCALE_STEP = 0.12;

/** Per-step delay (ms) that staggers the trail echoes behind the pointer. */
export const CURSOR_TRAIL_STAGGER_MS = 80;

/** z-index for the cursor overlay layer (above app content, below nothing). */
export const CURSOR_Z_INDEX = 2147483647;

/**
 * Variant token map. Each cursor pulls its palette from the shared tokens.
 */
export const cursorVariantTokens: Record<HorrorCursorVariant, CursorVariantToken> = {
  'ritual-candle': {
    color: palette.bone[200],
    accent: palette.witch.gold,
    glow: palette.witch.gold,
    size: 44,
    damping: 'smooth',
    trailLength: 0,
    anchor: { x: 0.5, y: 0.1 },
  },
  'bloody-dagger': {
    color: palette.mist[200],
    accent: palette.sanguine.crimson,
    glow: palette.sanguine.blood,
    size: 46,
    damping: 'sharp',
    trailLength: 0,
    anchor: { x: 0.08, y: 0.08 },
  },
  'spectral-wisp': {
    color: palette.bone[100],
    accent: palette.witch.emerald,
    glow: palette.witch.emerald,
    size: 48,
    damping: 'spectral',
    trailLength: 5,
    anchor: { x: 0.5, y: 0.42 },
  },
  'skeletal-hand': {
    color: palette.bone[200],
    accent: palette.bone.decayed,
    glow: palette.mist[300],
    size: 42,
    damping: 'smooth',
    trailLength: 0,
    anchor: { x: 0.3, y: 0.08 },
  },
} as const;
