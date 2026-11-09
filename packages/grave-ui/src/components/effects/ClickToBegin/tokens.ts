/**
 * ClickToBegin component tokens.
 *
 * Colors, fonts, and easing come from the shared token system. Timings and
 * spacing are component-specific and named here.
 *
 * @module components/effects/ClickToBegin/tokens
 */

import { palette } from '../../../tokens/colors';
import { typography } from '../../../tokens/typography';
import { animations } from '../../../tokens/animations';

/** Stacking order of the prompt. It sits above sibling content in its container. */
export const PROMPT_Z_INDEX = 10;

export const promptTokens = {
  /** How long the prompt takes to fade out after the click, in ms. */
  fadeMs: 600,
  /** Seconds for one pulse of the label. */
  pulseSeconds: 3,
  /** Space between the label and the hint, in px. */
  gap: 12,
  /** Wide letter spacing for the label. */
  letterSpacing: '0.2em',
  colors: {
    overlay: palette.dark[950],
    /** How opaque the dimming layer is, in percent. */
    overlayStrength: 72,
    label: palette.bone[200],
    hint: palette.mist[300],
  },
  font: {
    family: typography.families.grimoire,
    label: typography.scale.proclamation,
    hint: typography.scale.murmur,
  },
  easing: animations.easing.easeInOut,
} as const;
