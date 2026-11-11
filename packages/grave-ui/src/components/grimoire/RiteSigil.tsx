/**
 * RiteSigil - The small mark that stands for a rite
 * @module components/grimoire/RiteSigil
 */

import type { CSSProperties, ReactNode } from 'react';
import { riteTokens } from './tokens';

/** The available marks. */
export type SigilGlyph = 'eye' | 'candle' | 'moon' | 'key' | 'pentacle';

/** Every mark, handy for pickers and showcases. */
export const SIGIL_GLYPHS: readonly SigilGlyph[] = ['eye', 'candle', 'moon', 'key', 'pentacle'];

/** Stroke width in the 24-unit drawing grid. */
const STROKE = 1.5;

/** Opacity of the outer rings, so the main shape reads first. */
const FAINT = 0.45;

/** Opacity of small sparkles and accents. */
const SPARK = 0.6;

/** Each mark, drawn on a 24 × 24 grid in the current text color. */
const GLYPHS: Record<SigilGlyph, ReactNode> = {
  eye: (
    <>
      <circle cx="12" cy="12" r="10.5" opacity={FAINT} />
      <path d="M4.5 12c2-3.6 4.6-5.4 7.5-5.4s5.5 1.8 7.5 5.4c-2 3.6-4.6 5.4-7.5 5.4S6.5 15.6 4.5 12z" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </>
  ),
  candle: (
    <>
      <path d="M9.5 10.5h5v9.5h-5z" />
      <path d="M7 20h10M12 10.5V8.8" />
      <path d="M12 3c1.6 1.8 2.2 3.1 2.2 4.1a2.2 2.2 0 0 1-4.4 0c0-1 .6-2.3 2.2-4.1z" fill="currentColor" />
    </>
  ),
  moon: (
    <>
      <path d="M15.5 3.5a8.5 8.5 0 1 0 5 15.2A7 7 0 0 1 15.5 3.5z" />
      <path d="M6 4.5v3M4.5 6h3" opacity={SPARK} />
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="12" r="3.5" />
      <path d="M11 12h10M18 12v3M15.5 12v2.2" />
    </>
  ),
  pentacle: (
    <>
      <circle cx="12" cy="12" r="10.5" opacity={FAINT} />
      <path d="M12 3.5l5 15.4L3.9 9.4h16.2L7 18.9z" />
    </>
  ),
};

/**
 * Props for {@link RiteSigil}.
 */
export interface RiteSigilProps {
  /** Which mark to draw. */
  glyph: SigilGlyph;
  /** A size preset or a size in px. @default 'md' */
  size?: keyof typeof riteTokens.size.sigil | number;
  /** A name for screen readers. Leave it out when the mark is decoration next to a visible name. */
  title?: string;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles; set `color` to tint the mark. */
  style?: CSSProperties;
}

/**
 * A rite's mark: an eye for seeing, a candle for keeping, a moon for timing,
 * a key for unlocking, a pentacle for binding. Drawn in the current text
 * color, so it takes the rite's accent from its parent.
 *
 * @example
 * ```tsx
 * <RiteSigil glyph="eye" style={{ color: grimoireAccents.witchfire }} />
 * ```
 */
export const RiteSigil = ({ glyph, size = 'md', title, className, style }: RiteSigilProps) => {
  const px = typeof size === 'number' ? size : riteTokens.size.sigil[size];
  return (
    <svg
      viewBox="0 0 24 24"
      width={px}
      height={px}
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {GLYPHS[glyph]}
    </svg>
  );
};
