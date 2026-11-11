/**
 * VoiceStudio component tokens.
 *
 * Colors, fonts, and spacing come from the shared token system. Timeline
 * sizes and control settings are component-specific and named here.
 *
 * @module components/effects/VoiceStudio/tokens
 */

import { palette } from '../../../tokens/colors';
import { spacing } from '../../../tokens/spacing';
import { typography } from '../../../tokens/typography';
import type { PersonaEffects } from '../../../voice/personas';
import { withAlpha } from '../HorrorBackground/tokens';

export const studioTokens = {
  colors: {
    panel: palette.dark[900],
    raised: palette.dark[800],
    border: palette.dark[600],
    text: palette.bone[200],
    muted: palette.mist[300],
    voice: palette.sanguine.plasma,
    lyrics: palette.witch.fire,
    playhead: palette.witch.gold,
    recording: palette.sanguine.crimson,
    meter: palette.witch.emerald,
    grid: withAlpha(palette.mist[400], 25),
    lane: withAlpha(palette.dark[700], 70),
    error: palette.sanguine.plasma,
  },
  font: {
    body: typography.families.body,
    mono: typography.families.epitaph,
    small: typography.scale.murmur,
    base: typography.scale.voice,
    title: typography.scale.chant,
  },
  space: {
    xs: spacing.coven[1],
    sm: spacing.coven[2],
    md: spacing.coven[3],
    lg: spacing.coven[4],
    xl: spacing.coven[6],
  },
  radius: spacing.coven[2],
  /** Width of borders and dividers. */
  hairline: '1px',
  /** Strength, in percent, of a block's background behind its waveform or words. */
  blockStrength: 30,
  timeline: {
    /** Horizontal zoom: pixels for one second of song. */
    pixelsPerSecond: 60,
    /** Height of one track lane and of the time ruler, in px. */
    laneHeight: 56,
    rulerHeight: 20,
    /** The timeline always shows at least this many seconds. */
    minSeconds: 8,
    /** Width of the playhead line, in px. */
    playheadWidth: 2,
    /** Seconds the arrow keys move the playhead, and with Shift held. */
    keyStepSeconds: 1,
    keyStepLargeSeconds: 5,
  },
  meter: { width: spacing.coven[24], height: spacing.coven[2] },
  layout: {
    /** Narrowest a control may get before the grid wraps it to a new row. */
    controlMin: spacing.coven[32],
    /** Width of a small number field, such as a start beat. */
    numberField: spacing.coven[24],
    /** Width of the colored bar marking a track's kind. */
    accentBar: spacing.coven[1],
  },
  /** Rows shown in a lyrics box. */
  lyricRows: 4,
  /** Tenths of a second shown on the clock. */
  clockDecimals: 1,
} as const;

/**
 * How each voice knob is shown: its label, how finely it moves, and its unit.
 */
export interface EffectControl {
  key: keyof PersonaEffects;
  label: string;
  step: number;
  unit?: string;
}

/** The voice knobs, in the order they appear. */
export const EFFECT_CONTROLS: readonly EffectControl[] = [
  { key: 'rate', label: 'Speed', step: 0.01, unit: '×' },
  { key: 'highpassHz', label: 'Low cut', step: 10, unit: 'Hz' },
  { key: 'lowpassHz', label: 'High cut', step: 100, unit: 'Hz' },
  { key: 'distortion', label: 'Grit', step: 0.01 },
  { key: 'ringMix', label: 'Metal', step: 0.01 },
  { key: 'ringHz', label: 'Metal tone', step: 1, unit: 'Hz' },
  { key: 'echoMix', label: 'Echo', step: 0.01 },
  { key: 'echoSeconds', label: 'Echo time', step: 0.01, unit: 's' },
  { key: 'echoFeedback', label: 'Echo repeats', step: 0.01 },
  { key: 'reverbMix', label: 'Room', step: 0.01 },
  { key: 'reverbSeconds', label: 'Room size', step: 0.1, unit: 's' },
  { key: 'layerMix', label: 'Second voice', step: 0.01 },
  { key: 'layerRate', label: 'Second voice speed', step: 0.01, unit: '×' },
  { key: 'gain', label: 'Output', step: 0.01 },
];

/** A thin border in the studio's border color. */
export const studioBorder = `${studioTokens.hairline} solid ${studioTokens.colors.border}`;

/** Shared look of text inputs, selects, and text areas. */
export const fieldStyle = {
  background: studioTokens.colors.raised,
  color: studioTokens.colors.text,
  border: studioBorder,
  borderRadius: studioTokens.radius,
  padding: `${studioTokens.space.xs} ${studioTokens.space.sm}`,
  fontFamily: studioTokens.font.body,
  fontSize: studioTokens.font.base,
} as const;

/** Shared look of a small caption above a control. */
export const labelStyle = {
  display: 'block',
  fontSize: studioTokens.font.small,
  color: studioTokens.colors.muted,
  marginBottom: studioTokens.space.xs,
} as const;
