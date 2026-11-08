/**
 * Headstone SVG primitive - Tombstone grave marker
 * @module assets/svg/base/Headstone
 */

import type { SVGPrimitiveProps } from './Skull';

/**
 * Headstone icon - rounded arch tombstone primitive.
 * 
 * @example
 * ```tsx
 * <Headstone size={48} color={colors.crypt.granite} />
 * ```
 */
export const Headstone = ({
  size = 24,
  className,
  color = 'currentColor',
  style,
}: SVGPrimitiveProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    role="img"
    aria-label="Headstone"
  >
    <path
      d="M6 22h12v-6H6v6zm0-8h12V9c0-3.31-2.69-6-6-6S6 5.69 6 9v5z"
      fill={color}
    />
    <rect x="8" y="11" width="8" height="1" fill={color} opacity="0.5" />
    <rect x="9" y="13" width="6" height="1" fill={color} opacity="0.5" />
  </svg>
);
