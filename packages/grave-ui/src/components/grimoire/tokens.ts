/**
 * Grimoire component tokens: spacing, type, shape, motion, and status colors
 * for rite panels and page overlays. Colors come from the Grimoire color
 * tokens; everything else from the shared token scales.
 *
 * @module components/grimoire/tokens
 */

import type { RiteStatus } from '../../grimoire/core/status';
import { grimoireShades, grimoireSurface, inspectorColors } from '../../grimoire/tokens';
import { animations } from '../../tokens/animations';
import { withAlpha } from '../../tokens/colors';
import { zLayers } from '../../tokens/layers';
import { spacing } from '../../tokens/spacing';
import { typography } from '../../tokens/typography';

/** Class names used by the injected stylesheet. */
export const RITE_CLASS = {
  shell: 'grimoire-shell',
  label: 'grimoire-label',
  swatch: 'grimoire-swatch',
  highlight: 'grimoire-highlight',
  /** Marks elements that animate, so reduced motion can switch them off. */
  motion: 'grimoire-motion',
  /** Text inputs, text areas, and selects in rite panels. */
  field: 'grimoire-field',
} as const;

/** CSS custom properties that carry a rite's accent into the stylesheet. */
export const RITE_VARS = {
  accent: '--grimoire-accent',
  focus: '--grimoire-focus',
} as const;

/** How strongly an accent tints soft fills and glows, in percent. */
export const ACCENT_STRENGTH = {
  soft: 14,
  ring: 35,
  glow: 22,
  shadow: 60,
} as const;

/** Depth of the panel shadow and the accent glow, in px. */
const SHADOW = { offsetY: 18, blur: 40, glowBlur: 32 } as const;

/** How far a swatch lifts on hover, and a label rises as it appears, in px. */
const LIFT = { hover: 1, rise: 4 } as const;

/** Lowest opacity of a breathing status dot. */
const BREATHE_LOW = 0.35;

export const riteTokens = {
  space: {
    xs: spacing.coven[1],
    sm: spacing.coven[2],
    md: spacing.coven[3],
    lg: spacing.coven[4],
    xl: spacing.coven[6],
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    pill: '999px',
  },
  font: {
    body: typography.families.body,
    mono: typography.families.runic,
    title: typography.families.grimoire,
    tiny: typography.scale.whisper,
    small: typography.scale.murmur,
    base: typography.scale.voice,
    large: typography.scale.incantation,
    heading: typography.scale.chant,
    tracking: typography.letterSpacing.wider,
    lineHeight: typography.lineHeight.normal,
    weight: { normal: typography.weight.normal, medium: typography.weight.medium, bold: typography.weight.semibold },
  },
  line: {
    hairline: '1px',
    focus: '2px',
    focusOffset: '2px',
    highlight: '1px',
  },
  motion: {
    fast: animations.durations.pulse,
    base: animations.durations.creep,
    ease: animations.easing.easeOutSpectral,
    /** How long a status dot takes to breathe in and out while waking. */
    breathe: animations.durations.linger,
  },
  size: {
    sigil: { sm: 20, md: 32, lg: 44 },
    dot: '8px',
    swatch: '28px',
    /** Widest a floating label may grow before its text wraps. */
    labelMaxWidth: 320,
    /** Smallest highlight drawn, so tiny elements stay visible. */
    minHighlight: 2,
    /** Tallest a log grows before it scrolls. */
    logMaxHeight: '14rem',
    /** Narrowest a stat tile gets in a grid of stats. */
    statMinWidth: '7.5rem',
  },
  layer: zLayers.inspector,
  surface: grimoireSurface,
  shadow: `0 ${SHADOW.offsetY}px ${SHADOW.blur}px ${withAlpha(grimoireShades.ink, ACCENT_STRENGTH.shadow)}`,
} as const;

/** The glow around an accented panel. */
export const accentGlow = (accent: string): string =>
  `0 0 0 ${riteTokens.line.hairline} ${withAlpha(accent, ACCENT_STRENGTH.ring)}, 0 0 ${SHADOW.glowBlur}px ${withAlpha(accent, ACCENT_STRENGTH.glow)}, ${riteTokens.shadow}`;

/**
 * What each status is called and how it is colored. Words are short and plain
 * so they read well in a status line and to screen readers.
 */
export const riteStatusMeta: Record<RiteStatus, { label: string; color: string; pulsing: boolean }> = {
  idle: { label: 'Asleep', color: grimoireSurface.muted, pulsing: false },
  requesting: { label: 'Waking…', color: inspectorColors.border, pulsing: true },
  active: { label: 'Awake', color: grimoireShades.ectoplasm, pulsing: false },
  denied: { label: 'Blocked', color: grimoireShades.freshBlood, pulsing: false },
  unavailable: { label: 'Not available here', color: grimoireSurface.muted, pulsing: false },
  error: { label: 'Something went wrong', color: grimoireShades.freshBlood, pulsing: false },
};

/**
 * How a value is judged, for stats, log entries, and verdicts. Always pair
 * the color with words, so the meaning never rests on color alone.
 */
export type RiteTone = 'neutral' | 'good' | 'warn' | 'bad';

/** The text color of each tone; every one is readable on Grimoire panels. */
export const riteTones: Record<RiteTone, string> = {
  neutral: grimoireSurface.text,
  good: grimoireShades.ectoplasm,
  warn: inspectorColors.border,
  bad: grimoireShades.freshBlood,
};

/** Names of the injected animations. */
export const riteAnimation = {
  breathe: 'grimoire-breathe',
  rise: 'grimoire-rise',
} as const;

/**
 * The one stylesheet every Grimoire component shares. Inline styles cannot
 * express focus rings, hover states, or the reduced-motion preference, so
 * those live here. It is rendered with the components; repeated copies are
 * identical, so the browser treats them as one.
 */
export const riteStyles = `
@keyframes ${riteAnimation.breathe} {
  0%, 100% { opacity: 1; }
  50% { opacity: ${BREATHE_LOW}; }
}
@keyframes ${riteAnimation.rise} {
  from { opacity: 0; transform: translateY(${LIFT.rise}px); }
  to { opacity: 1; transform: translateY(0); }
}
.${RITE_CLASS.shell} :focus-visible,
.${RITE_CLASS.swatch}:focus-visible {
  outline: ${riteTokens.line.focus} solid var(${RITE_VARS.focus}, ${grimoireSurface.focus});
  outline-offset: ${riteTokens.line.focusOffset};
}
.${RITE_CLASS.swatch} {
  transition: transform ${riteTokens.motion.fast} ${riteTokens.motion.ease}, box-shadow ${riteTokens.motion.fast} ${riteTokens.motion.ease};
}
.${RITE_CLASS.swatch}:hover {
  transform: translateY(-${LIFT.hover}px);
  box-shadow: 0 0 0 ${riteTokens.line.hairline} var(${RITE_VARS.accent}, ${grimoireSurface.border});
}
.${RITE_CLASS.field} {
  transition: border-color ${riteTokens.motion.fast} ${riteTokens.motion.ease};
}
.${RITE_CLASS.field}::placeholder {
  color: ${grimoireSurface.muted};
  opacity: 1;
}
.${RITE_CLASS.field}:hover:not(:disabled) {
  border-color: var(${RITE_VARS.accent}, ${grimoireSurface.focus});
}
.${RITE_CLASS.field}:focus-visible {
  outline: ${riteTokens.line.focus} solid var(${RITE_VARS.focus}, ${grimoireSurface.focus});
  outline-offset: ${riteTokens.line.focusOffset};
}
.${RITE_CLASS.label} {
  animation: ${riteAnimation.rise} ${riteTokens.motion.fast} ${riteTokens.motion.ease} both;
}
.${RITE_CLASS.highlight} > * {
  transition: left ${riteTokens.motion.fast} ${riteTokens.motion.ease}, top ${riteTokens.motion.fast} ${riteTokens.motion.ease},
    width ${riteTokens.motion.fast} ${riteTokens.motion.ease}, height ${riteTokens.motion.fast} ${riteTokens.motion.ease};
}
@media (prefers-reduced-motion: reduce) {
  .${RITE_CLASS.shell} *, .${RITE_CLASS.label}, .${RITE_CLASS.highlight} > *, .${RITE_CLASS.swatch}, .${RITE_CLASS.motion} {
    animation: none !important;
    transition: none !important;
  }
}
`;
