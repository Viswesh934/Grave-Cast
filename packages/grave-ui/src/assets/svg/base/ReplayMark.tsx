/**
 * ReplayMark SVG primitive - a circling arrow, for "again"
 * @module assets/svg/base/ReplayMark
 */

import type { SVGPrimitiveProps } from './Skull';

/**
 * An arrow that circles back, for a button that starts something again. It is
 * hidden from screen readers: give the button itself the name, such as "Play again".
 *
 * @example
 * ```tsx
 * <IconButton label="Play again"><ReplayMark size="1.5rem" /></IconButton>
 * ```
 */
export const ReplayMark = ({ size = 24, className, color = 'currentColor', style }: SVGPrimitiveProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M4 12a8 8 0 1 0 2.34-5.66" />
    <path d="M4 4v4.5h4.5" />
  </svg>
);
