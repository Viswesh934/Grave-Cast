/**
 * ReverseMark SVG primitive - two arrows going opposite ways, for "turned around"
 * @module assets/svg/base/ReverseMark
 */

import type { SVGPrimitiveProps } from './Skull';

/**
 * Two arrows passing in opposite directions, for something reversed or swapped.
 * It is hidden from screen readers: name it in the text beside it.
 *
 * @example
 * ```tsx
 * <ReverseMark size="1.25rem" /> Backwards
 * ```
 */
export const ReverseMark = ({ size = 24, className, color = 'currentColor', style }: SVGPrimitiveProps) => (
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
    <path d="M20 8H5m0 0 3.5-3.5M5 8l3.5 3.5" />
    <path d="M4 16h15m0 0-3.5-3.5M19 16l-3.5 3.5" />
  </svg>
);
