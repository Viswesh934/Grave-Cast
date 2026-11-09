/**
 * HauntedKeyboard component tokens.
 *
 * Sizes are component-specific; every color, shadow, font, and timing value
 * comes from the shared token system.
 *
 * @module components/effects/HauntedKeyboard/tokens
 */

import { palette } from '../../../tokens/colors';
import { shadows } from '../../../tokens/shadows';
import { typography } from '../../../tokens/typography';
import { animations } from '../../../tokens/animations';

export const keyboardTokens = {
  key: {
    /** Key width in px. */
    width: 48,
    /** Key height in px. */
    height: 56,
    /** Gap between keys and rows in px. */
    gap: 6,
    /** Corner radius in px. */
    radius: 8,
    /** Border width in px. */
    border: 1,
    /** How far a pressed key sinks, in px. */
    pressDepth: 2,
  },
  /** Row indent per row, as a fraction of key width, like a real keyboard. */
  rowStagger: 0.28,
  colors: {
    surface: palette.dark[800],
    surfaceActive: palette.dark[700],
    border: palette.crypt.granite,
    borderActive: palette.witch.fire,
    text: palette.bone[200],
    textActive: palette.bone[100],
    label: palette.mist[300],
  },
  shadow: {
    rest: shadows.depths.spectral,
    active: shadows.glows.eldritch,
  },
  font: {
    family: typography.families.runic,
    key: typography.scale.voice,
    label: typography.scale.whisper,
  },
  transition: [
    `background-color ${animations.durations.flicker} ${animations.easing.easeOut}`,
    `border-color ${animations.durations.flicker} ${animations.easing.easeOut}`,
    `box-shadow ${animations.durations.pulse} ${animations.easing.easeOut}`,
    `transform ${animations.durations.flicker} ${animations.easing.easeOut}`,
  ].join(', '),
} as const;
