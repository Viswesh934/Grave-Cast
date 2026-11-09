/**
 * CursorGlyphs - Reusable SVG artwork for the HorrorCursor variants.
 *
 * Each glyph is a generic, theme-aware SVG component that inherits color via
 * `currentColor` and scales through a single `size` prop. They are exported so
 * consumers can reuse the artwork independently of the cursor overlay (e.g. as
 * a static icon or inside their own custom cursor implementation).
 *
 * @module components/effects/HorrorCursor/CursorGlyphs
 */

import type { CSSProperties } from 'react';

/**
 * Standard props shared by all cursor glyph SVGs.
 */
export interface CursorGlyphProps {
  /** Size in pixels or CSS value (default: 40) */
  size?: number | string;
  /** CSS class name */
  className?: string;
  /** Primary color (defaults to currentColor to inherit from parent) */
  color?: string;
  /** Optional accent color for secondary details (flame, blood, glow) */
  accent?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/** Default rendered glyph size in pixels. */
export const CURSOR_GLYPH_SIZE = 40;

/**
 * Ritual Candle glyph - a dripping candle crowned with a teardrop flame.
 * The flame uses the accent color so it can flicker independently.
 */
export const RitualCandleGlyph = ({
  size = CURSOR_GLYPH_SIZE,
  className,
  color = 'currentColor',
  accent,
  style,
}: CursorGlyphProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    role="img"
    aria-label="Ritual candle cursor"
  >
    {/* Candle body */}
    <rect x="9" y="8" width="6" height="13" rx="1" fill={color} />
    {/* Wax drip */}
    <path d="M9 14c0 2 .6 3 1.4 3S12 15.8 12 14" fill={color} opacity="0.8" />
    {/* Wick */}
    <rect x="11.4" y="5.5" width="1.2" height="3" rx="0.6" fill={color} />
    {/* Flame */}
    <path
      d="M12 1.5c1.8 1.6 2.8 3.2 2.8 4.7A2.8 2.8 0 0 1 12 9a2.8 2.8 0 0 1-2.8-2.8c0-1.3.7-2.6 2.8-4.7Z"
      fill={accent ?? color}
    />
    {/* Flame core */}
    <path
      d="M12 4c.9.9 1.3 1.8 1.3 2.5A1.3 1.3 0 0 1 12 7.8a1.3 1.3 0 0 1-1.3-1.3C10.7 5.8 11.1 4.9 12 4Z"
      fill={color}
      opacity="0.45"
    />
  </svg>
);

/**
 * Bloody Dagger glyph - an angled blade with a dripping tip.
 * The blood droplet uses the accent color.
 */
export const BloodyDaggerGlyph = ({
  size = CURSOR_GLYPH_SIZE,
  className,
  color = 'currentColor',
  accent,
  style,
}: CursorGlyphProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    role="img"
    aria-label="Bloody dagger cursor"
  >
    {/* Blade */}
    <path d="M4 4 15 15l-2.5 2.5L2 6.5 4 4Z" fill={color} />
    {/* Blade highlight */}
    <path d="M4 4 15 15l-1 1L3 5l1-1Z" fill={color} opacity="0.5" />
    {/* Crossguard */}
    <rect
      x="13.2"
      y="15.2"
      width="6"
      height="2"
      rx="1"
      transform="rotate(45 13.2 15.2)"
      fill={color}
    />
    {/* Pommel */}
    <circle cx="19.5" cy="19.5" r="2" fill={color} />
    {/* Blood drip from tip */}
    <path
      d="M3.4 6.2c-.8.9-1.2 1.6-1.2 2.2A1.1 1.1 0 0 0 4.4 8c0-.6-.3-1.2-1-1.8Z"
      fill={accent ?? color}
    />
  </svg>
);

/**
 * Spectral Wisp glyph - a soft orb with an ectoplasmic tail.
 */
export const SpectralWispGlyph = ({
  size = CURSOR_GLYPH_SIZE,
  className,
  color = 'currentColor',
  accent,
  style,
}: CursorGlyphProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    role="img"
    aria-label="Spectral wisp cursor"
  >
    {/* Outer glow */}
    <circle cx="12" cy="10" r="7" fill={accent ?? color} opacity="0.25" />
    {/* Core orb */}
    <circle cx="12" cy="10" r="4" fill={color} opacity="0.85" />
    {/* Inner highlight */}
    <circle cx="10.6" cy="8.6" r="1.4" fill={color} />
    {/* Trailing ectoplasm tail */}
    <path
      d="M12 14c-1.2 1.6-1.6 3.2-1.2 4.8.4 1.5 1.6 2.4 1.2 3.2-.5-.6-1.7-.9-2.2-2.3-.6-1.7-.1-3.6 2.2-5.7Z"
      fill={color}
      opacity="0.5"
    />
  </svg>
);

/**
 * Skeletal Hand glyph - a bony hand that curls (grasps) when pressed.
 * Rendered open by default; the `grasping` flag curls the fingers for the
 * click interaction.
 */
export const SkeletalHandGlyph = ({
  size = CURSOR_GLYPH_SIZE,
  className,
  color = 'currentColor',
  accent,
  style,
  grasping = false,
}: CursorGlyphProps & { grasping?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    role="img"
    aria-label="Skeletal hand cursor"
  >
    {/* Palm / wrist */}
    <path
      d="M8 13c0-1 .5-2 1.5-2.4L10 19c0 1.1-.9 2-2 2s-2-.9-2-2l.5-3.6C7 14.6 8 14 8 13Z"
      fill={color}
    />
    {grasping ? (
      // Curled fingers (grasp)
      <>
        <rect x="8" y="9.5" width="2" height="3.5" rx="1" fill={color} />
        <rect x="10.5" y="9" width="2" height="4" rx="1" fill={color} />
        <rect x="13" y="9.5" width="2" height="3.5" rx="1" fill={color} />
        <rect x="15.2" y="10.5" width="2" height="3" rx="1" fill={color} />
      </>
    ) : (
      // Extended fingers (reaching)
      <>
        <rect x="8" y="2.5" width="2" height="9" rx="1" fill={color} />
        <rect x="10.5" y="1.5" width="2" height="10" rx="1" fill={color} />
        <rect x="13" y="2.5" width="2" height="9" rx="1" fill={color} />
        <rect x="15.2" y="4" width="2" height="8" rx="1" fill={color} />
      </>
    )}
    {/* Thumb */}
    <rect
      x="5.5"
      y="9"
      width="2"
      height="5"
      rx="1"
      transform="rotate(35 5.5 9)"
      fill={accent ?? color}
    />
  </svg>
);
