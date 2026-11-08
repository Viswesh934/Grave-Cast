/**
 * Bone SVG primitive - Femur/skeletal element
 * @module assets/svg/base/Bone
 */

import type { SVGPrimitiveProps } from './Skull';

/**
 * Bone icon - skeletal primitive for ossuary and bone fence elements.
 * 
 * @example
 * ```tsx
 * <Bone size={24} color={colors.bone.ivory} />
 * ```
 */
export const Bone = ({
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
    aria-label="Bone"
  >
    <path
      d="M4 8c-1.1 0-2 .9-2 2s.9 2 2 2c.37 0 .7-.11 1-.28l3.18 3.18C8.11 15.3 8 15.63 8 16c0 1.1.9 2 2 2s2-.9 2-2c0-.37-.11-.7-.28-1l4.56-4.56c.3.17.63.28 1 .28 1.1 0 2-.9 2-2s-.9-2-2-2c-.37 0-.7.11-1 .28l-4.56 4.56c-.3-.17-.63-.28-1-.28s-.7.11-1 .28L6.54 7.28C6.71 7.7 6.82 7.37 6.82 7c0-1.1-.9-2-2-2z"
      fill={color}
    />
  </svg>
);
