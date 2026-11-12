/**
 * RiteSigil - The small mark that stands for a rite
 * @module components/grimoire/RiteSigil
 */

import type { CSSProperties, ReactNode } from 'react';
import { riteTokens } from './tokens';

/** The available marks. */
export type SigilGlyph =
  | 'eye'
  | 'candle'
  | 'moon'
  | 'key'
  | 'pentacle'
  | 'prism'
  | 'quill'
  | 'hourglass'
  | 'bell'
  | 'ghost'
  | 'coffin'
  | 'eyes'
  | 'mirror'
  | 'skull'
  | 'drop';

/** Every mark, handy for pickers and showcases. */
export const SIGIL_GLYPHS: readonly SigilGlyph[] = [
  'eye',
  'candle',
  'moon',
  'key',
  'pentacle',
  'prism',
  'quill',
  'hourglass',
  'bell',
  'ghost',
  'coffin',
  'eyes',
  'mirror',
  'skull',
  'drop',
];

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
  prism: (
    <>
      <path d="M12 4l7.5 14h-15z" />
      <path d="M2 12.5h6.5" />
      <path d="M15.2 10.6l6.3-2M15.8 12.6l6 .9M16 14.6l5.2 3.4" opacity={SPARK} />
    </>
  ),
  quill: (
    <>
      <path d="M20 3.5c-7 .5-11.5 5-13 12.5L5 21" />
      <path d="M20 3.5c-.5 6.5-5 10.5-12.6 11.6" />
      <path d="M11 10.5l3.5 3.5" opacity={SPARK} />
    </>
  ),
  hourglass: (
    <>
      <path d="M6.5 3h11M6.5 21h11" />
      <path d="M8 3c0 4.5 4 5.5 4 9s-4 4.5-4 9M16 3c0 4.5-4 5.5-4 9s4 4.5 4 9" />
      <path d="M10 18.5h4" opacity={SPARK} />
    </>
  ),
  bell: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 21h4M12 3V2" />
    </>
  ),
  ghost: (
    <>
      <path d="M6 20.5V10a6 6 0 0 1 12 0v10.5l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5z" />
      <circle cx="10" cy="10.5" r="1.1" fill="currentColor" />
      <circle cx="14" cy="10.5" r="1.1" fill="currentColor" />
    </>
  ),
  coffin: (
    <>
      <path d="M9 2.5h6l3 6-2 13H8L6 8.5z" />
      <path d="M12 7v7M9.5 9.5h5" opacity={SPARK} />
    </>
  ),
  eyes: (
    <>
      <path d="M2.5 12c1.3-2.3 2.9-3.5 4.75-3.5S10.7 9.7 12 12c-1.3 2.3-2.9 3.5-4.75 3.5S3.8 14.3 2.5 12z" />
      <path d="M12 12c1.3-2.3 2.9-3.5 4.75-3.5S20.2 9.7 21.5 12c-1.3 2.3-2.9 3.5-4.75 3.5S13.3 14.3 12 12z" />
      <circle cx="7.25" cy="12" r="1.3" fill="currentColor" />
      <circle cx="16.75" cy="12" r="1.3" fill="currentColor" />
    </>
  ),
  mirror: (
    <>
      <ellipse cx="12" cy="9.5" rx="6" ry="7" />
      <path d="M12 16.5V22M9.5 22h5" />
      <path d="M9.3 6.6c.8-1 1.8-1.6 3-1.6" opacity={SPARK} />
    </>
  ),
  skull: (
    <>
      <path d="M5 11a7 7 0 0 1 14 0c0 2.5-1.3 4.3-3 5v3.5H8V16c-1.7-.7-3-2.5-3-5z" />
      <circle cx="9.5" cy="11" r="1.6" fill="currentColor" />
      <circle cx="14.5" cy="11" r="1.6" fill="currentColor" />
      <path d="M11 19.5v-2M13 19.5v-2" opacity={SPARK} />
    </>
  ),
  drop: (
    <>
      <path d="M12 3c3.5 4.5 6 7.8 6 11a6 6 0 0 1-12 0c0-3.2 2.5-6.5 6-11z" />
      <path d="M9.5 14.5A2.5 2.5 0 0 0 12 17" opacity={SPARK} />
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
 * A rite's mark, drawn in the current text color so it takes the rite's
 * accent from its parent. Each rite has its own: an eye for the Medium, a
 * candle for the Vigil, a skull for the Autopsy, and so on.
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
