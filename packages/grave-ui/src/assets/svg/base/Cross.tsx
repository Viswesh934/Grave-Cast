/**
 * Cross SVG primitive - Grave marker cross
 * @module assets/svg/base/Cross
 */

import type { SVGPrimitiveProps } from './Skull';

/**
 * Cross icon - grave marker and memorial primitive.
 * 
 * @example
 * ```tsx
 * <Cross size={32} color={colors.bone.decayed} />
 * ```
 */
export const Cross = ({
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
    aria-label="Cross"
  >
    <path
      d="M10 2h4v7h7v4h-7v9h-4v-9H3v-4h7V2z"
      fill={color}
    />
  </svg>
);
