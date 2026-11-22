/**
 * CloseMark SVG primitive - the × on a close button
 * @module assets/svg/base/CloseMark
 */

import type { SVGPrimitiveProps } from './Skull';

export interface CloseMarkProps extends SVGPrimitiveProps {
  /** How thick the two strokes are, in units of the 16 by 16 grid. @default 2 */
  strokeWidth?: number;
}

/**
 * Two crossed strokes for a close button. It is hidden from screen readers:
 * give the button itself the name, such as "Close the game".
 *
 * @example
 * ```tsx
 * <button aria-label="Close the game"><CloseMark size="0.9rem" /></button>
 * ```
 */
export const CloseMark = ({ size = 24, className, color = 'currentColor', style, strokeWidth = 2 }: CloseMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    className={className}
    style={style}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M3 3 13 13 M13 3 3 13" />
  </svg>
);
