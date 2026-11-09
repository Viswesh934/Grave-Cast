/**
 * SoundLibrary component tokens.
 *
 * Sizes are component-specific; colors, shadows, and fonts come from the
 * shared token system.
 *
 * @module components/effects/SoundLibrary/tokens
 */

import { typography } from '../../../tokens/typography';
import { animations } from '../../../tokens/animations';
import type { EffectCategory } from '../../../audio';
import type { BadgeVariant } from '../../primitives/Badge';

export const libraryTokens = {
  /** Gap between rows and between controls, in px. */
  gap: 8,
  row: {
    /** Vertical and horizontal padding, in px. */
    padY: 12,
    padX: 14,
    /** Space between the parts of a row, in px. */
    gap: 12,
    radius: 10,
    border: 1,
  },
  /** Width and height of the play button, in px. */
  playSize: 40,
  /** Height of the playback progress line, in px. */
  progressHeight: 2,
  /** How long the Copy button says "Copied", in ms. */
  copyFeedbackMs: 1500,
  colors: {
    surface: '#0c1813',
    surfaceActive: '#12261d',
    inputSurface: '#08120e',
    border: '#183425',
    borderActive: '#10b981',
    title: '#f1f5f9',
    body: '#94a3b8',
    muted: '#64748b',
    progressTrack: '#0e2419',
    progressFill: '#10b981',
  },
  shadow: {
    active: '0 0 16px rgba(16, 185, 129, 0.25), 0 0 4px rgba(16, 185, 129, 0.5)',
  },
  font: {
    title: typography.scale.voice,
    body: typography.scale.murmur,
    meta: typography.scale.whisper,
    bodyFamily: typography.families.body,
    metaFamily: typography.families.runic,
  },
  transition: [
    `background-color ${animations.durations.pulse} ${animations.easing.easeOut}`,
    `border-color ${animations.durations.pulse} ${animations.easing.easeOut}`,
    `box-shadow ${animations.durations.creep} ${animations.easing.easeOut}`,
  ].join(', '),
} as const;

/** Badge style for each category chip. */
export const categoryBadge: Record<EffectCategory, BadgeVariant> = {
  taps: 'default',
  doors: 'warning',
  impacts: 'danger',
  magic: 'info',
  creatures: 'warning',
  ambience: 'info',
  alerts: 'danger',
  machines: 'success',
};
