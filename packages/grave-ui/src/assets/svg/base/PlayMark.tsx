/**
 * PlayMark SVG primitive - the triangle on a start or play button
 * @module assets/svg/base/PlayMark
 */

import type { SVGPrimitiveProps } from './Skull';

/**
 * A play triangle for a button that starts or carries on. It is hidden from
 * screen readers: give the button itself the name, such as "Start".
 *
 * @example
 * ```tsx
 * <IconButton label="Start"><PlayMark size="1.5rem" /></IconButton>
 * ```
 */
export const PlayMark = ({ size = 24, className, color = 'currentColor', style }: SVGPrimitiveProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} aria-hidden="true" focusable="false">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill={color} />
  </svg>
);
