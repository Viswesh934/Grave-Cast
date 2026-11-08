/**
 * Coffin SVG primitive - Hexagonal casket
 * @module assets/svg/base/Coffin
 */

import type { SVGPrimitiveProps } from './Skull';

/**
 * Coffin icon - hexagonal casket primitive for vampire elements.
 * 
 * @example
 * ```tsx
 * <Coffin size={32} color={colors.crypt.slate} />
 * ```
 */
export const Coffin = ({
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
    aria-label="Coffin"
  >
    <path
      d="M12 2L8 6v4L4 14v6l4 2h8l4-2v-6l-4-4V6l-4-4zm0 2.5L14 6v4l3 3v5l-2 1H9l-2-1v-5l3-3V6l2-1.5z"
      fill={color}
    />
  </svg>
);
