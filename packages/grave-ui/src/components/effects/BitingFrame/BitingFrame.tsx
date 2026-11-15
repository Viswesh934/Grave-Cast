/**
 * BitingFrame - Rows of teeth that bite down on whatever they wrap
 * @module components/effects/BitingFrame
 */
import type { ReactNode } from 'react';
import { palette } from '../../../tokens/colors';

/** Size and timing of the bite. */
export const BITING_FRAME = {
  /** How far the teeth reach in from each edge, in px. */
  toothHeight: 14,
  /** Width of one tooth, in px. */
  toothWidth: 18,
  /** How long the jaws take to close or open, in ms. */
  biteMs: 260,
  /** Slight overshoot as the jaws snap shut. */
  biteEase: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Every few teeth one is a longer fang, this much longer. */
  fangScale: 1.6,
  /** A fang every this many teeth. */
  fangEvery: 5,
  /** Teeth drawn per row: enough for wide boxes, the rest is clipped. */
  rowTeeth: 80,
  /** Default corner rounding of the wrapped box. */
  radius: '1rem',
} as const;

export interface BitingFrameProps {
  /** Close the jaws. While true, the teeth show along the top and bottom edges. */
  biting: boolean;
  /** Colour of the teeth. @default palette.bone[200] */
  color?: string;
  /** Corner rounding of the wrapped box, so the teeth sit inside it. @default BITING_FRAME.radius */
  radius?: string;
  children: ReactNode;
  className?: string;
}

/** One row of teeth as an SVG path, pointing down from the top edge (flipped for the bottom). */
const toothRow = (count: number): string => {
  const { toothWidth: w, toothHeight: h, fangEvery, fangScale } = BITING_FRAME;
  let d = 'M0 0';
  for (let i = 0; i < count; i++) {
    const x = i * w;
    const depth = i % fangEvery === Math.floor(fangEvery / 2) ? h * fangScale : h;
    d += ` L${x + w / 2} ${depth} L${x + w} 0`;
  }
  return `${d} Z`;
};

const ROW = toothRow(BITING_FRAME.rowTeeth);
const ROW_WIDTH = BITING_FRAME.rowTeeth * BITING_FRAME.toothWidth;
const ROW_HEIGHT = BITING_FRAME.toothHeight * BITING_FRAME.fangScale;

/**
 * Wraps a box, such as a form, and bites down on it: when `biting` turns on,
 * rows of teeth (with the odd longer fang) snap in from the top and bottom
 * edges, and open again when it turns off. The teeth never catch the pointer.
 * With reduced motion they appear and disappear without moving.
 *
 * @example
 * ```tsx
 * <BitingFrame biting={busy}>
 *   <form>…</form>
 * </BitingFrame>
 * ```
 */
export function BitingFrame({ biting, color = palette.bone[200], radius = BITING_FRAME.radius, children, className = '' }: BitingFrameProps) {
  const jaw = (edge: 'top' | 'bottom') => (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 motion-reduce:transition-none"
      style={{
        [edge]: 0,
        width: '100%',
        height: ROW_HEIGHT,
        transform: biting ? 'translateY(0)' : `translateY(${edge === 'top' ? -100 : 100}%)`,
        opacity: biting ? 1 : 0,
        transition: `transform ${BITING_FRAME.biteMs}ms ${BITING_FRAME.biteEase}, opacity ${BITING_FRAME.biteMs}ms ease-out`,
      }}
      viewBox={`0 0 ${ROW_WIDTH} ${ROW_HEIGHT}`}
      preserveAspectRatio="xMinYMin slice"
    >
      <path d={ROW} fill={color} transform={edge === 'bottom' ? `translate(0 ${ROW_HEIGHT}) scale(1 -1)` : undefined} />
    </svg>
  );

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ borderRadius: radius }}>
      {children}
      {jaw('top')}
      {jaw('bottom')}
    </div>
  );
}
