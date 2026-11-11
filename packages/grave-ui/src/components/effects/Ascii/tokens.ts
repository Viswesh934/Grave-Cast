/**
 * ASCII component tokens.
 *
 * Every color, font, and size comes from the shared token system. Timings and
 * the few ratios are component-specific and named here.
 *
 * @module components/effects/Ascii/tokens
 */

import { palette } from '../../../tokens/colors';
import { typography } from '../../../tokens/typography';
import { withAlpha } from '../HorrorBackground/tokens';

/**
 * Phosphor themes, named after the glow of old monitors.
 *
 * - `amber`: warm gold, like an old terminal
 * - `blood`: red
 * - `matrix`: green
 * - `ghost`: pale and cold
 * - `bone`: ivory
 */
export type PhosphorTheme = 'amber' | 'blood' | 'matrix' | 'ghost' | 'bone';

/** Text size presets. */
export type AsciiSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * One theme: the text color and the color of its glow.
 */
export interface PhosphorTone {
  color: string;
  glow: string;
}

export const phosphorThemes: Record<PhosphorTheme, PhosphorTone> = {
  amber: { color: palette.witch.gold, glow: palette.witch.gold },
  blood: { color: palette.sanguine.plasma, glow: palette.sanguine.crimson },
  matrix: { color: palette.witch.emerald, glow: palette.witch.emerald },
  ghost: { color: palette.mist[100], glow: palette.mist[300] },
  bone: { color: palette.bone[200], glow: palette.bone.decayed },
};

/** Every theme name, handy for building pickers. */
export const PHOSPHOR_THEME_NAMES = Object.keys(phosphorThemes) as PhosphorTheme[];

/** Font size for each preset. */
export const asciiSizes: Record<AsciiSize, string> = {
  sm: typography.scale.whisper,
  md: typography.scale.murmur,
  lg: typography.scale.voice,
  xl: typography.scale.speech,
};

export const asciiTokens = {
  font: typography.families.runic,
  /** Tight line spacing so rows of text join into a picture. */
  lineHeight: 1.1,
  /** Blur of the inner glow, in px. The outer glow is wider and softer. */
  glowBlur: 6,
  glowSpread: 3,
  /** How strong the soft outer glow is, in percent of the glow color. */
  glowSoftStrength: 45,
  /** Seconds for one flicker cycle. */
  flickerSeconds: 5,
  /** How far hovering reaches with runes, in characters across. */
  runeRadius: 5,
  /** Milliseconds between rune reshuffles while hovering. */
  runeShimmerMs: 90,
  /** Text shown when a live picture has no signal yet. */
  noSignal: 'NO SIGNAL',
} as const;

/** Builds the glow for a theme. */
export const glowShadow = (glow: string): string =>
  `0 0 ${asciiTokens.glowBlur}px ${glow}, 0 0 ${asciiTokens.glowBlur * asciiTokens.glowSpread}px ${withAlpha(glow, asciiTokens.glowSoftStrength)}`;

/** Hides an element visually while keeping it in the page, which video needs to keep playing. */
export const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  opacity: 0,
  pointerEvents: 'none',
} as const;
