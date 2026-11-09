/**
 * HorrorCursor - Custom animated cursor overlay with horror variants.
 * @module components/effects/HorrorCursor/HorrorCursor
 */

import { useEffect, useMemo, type ReactNode, type CSSProperties } from 'react';
import { useCursorTracker } from '../../../hooks/useCursorTracker';
import { useMediaQuery, breakpoints } from '../../../hooks/useMediaQuery';
import { useSpookyAudio, type SpookySound } from '../../../audio';
import { animations } from '../../../tokens';
import {
  RitualCandleGlyph,
  BloodyDaggerGlyph,
  SpectralWispGlyph,
  SkeletalHandGlyph,
} from './CursorGlyphs';
import {
  cursorVariantTokens,
  CURSOR_GLOW_BLUR,
  CURSOR_PRESS_SCALE,
  CURSOR_PRESS_TRANSITION,
  CURSOR_TRAIL_FALLOFF,
  CURSOR_TRAIL_OPACITY,
  CURSOR_TRAIL_SCALE_STEP,
  CURSOR_TRAIL_STAGGER_MS,
  CURSOR_Z_INDEX,
  type HorrorCursorVariant,
} from './tokens';

/**
 * Props for {@link HorrorCursor}.
 */
export interface HorrorCursorProps {
  /**
   * Which cursor glyph to render.
   * @default 'ritual-candle'
   */
  variant?: HorrorCursorVariant;
  /**
   * When `false`, the component renders nothing and the native cursor is
   * restored. Useful for toggling the effect at runtime.
   * @default true
   */
  enabled?: boolean;
  /**
   * Hide the OS cursor while the custom cursor is active.
   * @default true
   */
  hideNativeCursor?: boolean;
  /**
   * Sound effect to play on click. Requires an {@link AudioProvider} with
   * audio enabled; otherwise it is a no-op.
   */
  clickSound?: SpookySound;
  /**
   * Render a custom glyph instead of the built-in variant artwork. Receives
   * the current pressed state so it can react to clicks.
   */
  children?: (state: { isPressed: boolean }) => ReactNode;
  /** Additional class applied to the cursor layer. */
  className?: string;
}

/**
 * Picks the SVG glyph for a variant. The skeletal hand reacts to the pressed
 * state by curling its fingers.
 */
const renderGlyph = (
  variant: HorrorCursorVariant,
  isPressed: boolean,
  color: string,
  accent: string,
  size: number
): ReactNode => {
  switch (variant) {
    case 'bloody-dagger':
      return <BloodyDaggerGlyph size={size} color={color} accent={accent} />;
    case 'spectral-wisp':
      return <SpectralWispGlyph size={size} color={color} accent={accent} />;
    case 'skeletal-hand':
      return (
        <SkeletalHandGlyph size={size} color={color} accent={accent} grasping={isPressed} />
      );
    case 'ritual-candle':
    default:
      return <RitualCandleGlyph size={size} color={color} accent={accent} />;
  }
};

/**
 * A smooth, physics-eased custom cursor that replaces the OS pointer with
 * horror-themed artwork. Four built-in variants are provided; a render-prop
 * `children` escape hatch lets consumers supply their own glyph.
 *
 * - **ritual-candle**: flickering flame with a warm gold glow
 * - **bloody-dagger**: a snappy blade with a dripping tip
 * - **spectral-wisp**: a floaty orb that leaves a fading ectoplasm trail
 * - **skeletal-hand**: a bony hand that grasps on click
 *
 * The cursor is pointer-events transparent, renders in a top-layer fixed
 * overlay, and automatically disables itself on touch devices and when the
 * user prefers reduced motion (snapping instantly instead of easing).
 *
 * @example
 * ```tsx
 * // Drop in near the root of your app
 * <HorrorCursor variant="spectral-wisp" clickSound="boneClick" />
 * ```
 *
 * @example Custom glyph via render prop
 * ```tsx
 * <HorrorCursor>
 *   {({ isPressed }) => <MyGlyph open={!isPressed} />}
 * </HorrorCursor>
 * ```
 */
export const HorrorCursor = ({
  variant = 'ritual-candle',
  enabled = true,
  hideNativeCursor = true,
  clickSound,
  children,
  className = '',
}: HorrorCursorProps) => {
  const prefersReducedMotion = useMediaQuery(breakpoints.reducedMotion);
  // Coarse pointers (touch) have no hover cursor to replace.
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const active = enabled && !isCoarsePointer;

  const token = cursorVariantTokens[variant];
  const { playSound } = useSpookyAudio();

  const { x, y, isPressed, isActive } = useCursorTracker({
    damping: token.damping,
    disabled: !active,
    reducedMotion: prefersReducedMotion,
  });

  // Hide / restore the native cursor on the document while active.
  useEffect(() => {
    if (!active || !hideNativeCursor || typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    const previous = root.style.cursor;
    root.style.cursor = 'none';
    return () => {
      root.style.cursor = previous;
    };
  }, [active, hideNativeCursor]);

  // Play the optional click sound.
  useEffect(() => {
    if (active && isPressed && clickSound) {
      playSound(clickSound);
    }
  }, [active, isPressed, clickSound, playSound]);

  // Precompute the fading trail echoes (spectral wisp only, by default).
  const trail = useMemo(
    () => Array.from({ length: token.trailLength }, (_, i) => i + 1),
    [token.trailLength]
  );

  if (!active) return null;

  const offsetX = -token.size * token.anchor.x;
  const offsetY = -token.size * token.anchor.y;

  const layerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    pointerEvents: 'none',
    zIndex: CURSOR_Z_INDEX,
    opacity: isActive ? 1 : 0,
    transition: `opacity ${animations.durations.pulse} ${animations.easing.easeOut}`,
  };

  const glyphStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate3d(${x + offsetX}px, ${y + offsetY}px, 0) scale(${isPressed ? CURSOR_PRESS_SCALE : 1})`,
    transition: CURSOR_PRESS_TRANSITION,
    color: token.color,
    filter: `drop-shadow(0 0 ${CURSOR_GLOW_BLUR}px ${token.glow})`,
    willChange: 'transform',
  };

  return (
    <div
      className={`grave-horror-cursor grave-horror-cursor--${variant} ${className}`.trim()}
      style={layerStyle}
      aria-hidden="true"
    >
      {/* Fading motion trail (behind the main glyph) */}
      {trail.map((step) => {
        const echoOpacity = Math.pow(CURSOR_TRAIL_FALLOFF, step) * CURSOR_TRAIL_OPACITY;
        const echoScale = 1 - step * CURSOR_TRAIL_SCALE_STEP;
        return (
          <div
            key={step}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translate3d(${x + offsetX}px, ${y + offsetY}px, 0) scale(${echoScale})`,
              opacity: echoOpacity,
              color: token.color,
              filter: `blur(${step}px)`,
              transition: `transform ${CURSOR_TRAIL_STAGGER_MS * step}ms ${animations.easing.linear}`,
            }}
          >
            {renderGlyph(variant, isPressed, token.color, token.accent, token.size)}
          </div>
        );
      })}

      {/* Main glyph */}
      <div style={glyphStyle}>
        {children
          ? children({ isPressed })
          : renderGlyph(variant, isPressed, token.color, token.accent, token.size)}
      </div>
    </div>
  );
};
