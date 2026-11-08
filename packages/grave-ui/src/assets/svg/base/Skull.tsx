/**
 * Skull SVG primitive - Base horror icon
 * @module assets/svg/base/Skull
 */

import type { CSSProperties } from 'react';

/**
 * Standard props for all SVG primitives
 */
export interface SVGPrimitiveProps {
  /** Size in pixels or CSS value (default: 24) */
  size?: number | string;
  /** CSS class name */
  className?: string;
  /** Color (defaults to currentColor to inherit from parent) */
  color?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Skull icon - horror primitive for death, danger, and spooky elements.
 * 
 * Uses currentColor by default to inherit theme colors.
 * Scalable and composable into larger components.
 * 
 * @example
 * ```tsx
 * import { Skull } from '@gravecast/grave-ui/assets';
 * import { colors } from '@gravecast/grave-ui/tokens';
 * 
 * <Skull size={32} color={colors.bone.ivory} />
 * ```
 */
export const Skull = ({
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
    aria-label="Skull"
  >
    <path
      d="M12 2C7.58 2 4 5.58 4 10c0 3.5 2 6.5 5 8v2c0 .55.45 1 1 1h1v1h2v-1h2v1h2v-1h1c.55 0 1-.45 1-1v-2c3-1.5 5-4.5 5-8 0-4.42-3.58-8-8-8zm-4 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4 5c-1.1 0-2-.67-2-1.5h4c0 .83-.9 1.5-2 1.5z"
      fill={color}
    />
  </svg>
);
