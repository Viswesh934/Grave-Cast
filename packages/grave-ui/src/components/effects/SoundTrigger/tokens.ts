/**
 * SoundTrigger component tokens.
 *
 * Colors, fonts, and easing come from the shared token system. Sizes are
 * component-specific and named here.
 *
 * @module components/effects/SoundTrigger/tokens
 */

import { palette } from '../../../tokens/colors';
import { typography } from '../../../tokens/typography';
import { animations } from '../../../tokens/animations';
import type { SoundKind } from '../../../audio';
import type { BadgeVariant } from '../../primitives/Badge';

export const triggerTokens = {
  /** Space between the controls, in px. */
  gap: 10,
  meter: {
    /** Height of the level meter, in px. */
    height: 8,
    radius: 4,
  },
  colors: {
    track: palette.dark[700],
    fill: palette.witch.fire,
    text: palette.mist[300],
    error: palette.sanguine.plasma,
  },
  font: {
    family: typography.families.runic,
    size: typography.scale.murmur,
  },
  /** The meter moves smoothly between the slow level updates. */
  transition: `width ${animations.durations.pulse} ${animations.easing.linear}`,
} as const;

/** Badge style for the sound currently heard. */
export const soundBadge: Record<SoundKind, BadgeVariant> = {
  whisper: 'info',
  voice: 'success',
  blow: 'warning',
  scream: 'danger',
};
