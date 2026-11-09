/**
 * HorrorBackground - Atmospheric, non-interactive backdrops.
 * @module components/effects/HorrorBackground/HorrorBackground
 */

import type { CSSProperties } from 'react';
import { useMediaQuery, breakpoints } from '../../../hooks/useMediaQuery';
import type { HorrorIntensity } from '../../../tokens/types';
import {
  BlizzardLayer,
  CandlelitLayers,
  FogLayers,
  HypnoticLayers,
  RitualCircleLayer,
  StormLayers,
} from './layers';
import { backgroundKeyframes } from './styles';
import {
  BACKGROUND_CLASS,
  BACKGROUND_Z_INDEX,
  intensityTokens,
  type HorrorBackgroundVariant,
} from './tokens';

/**
 * Props for {@link HorrorBackground}.
 */
export interface HorrorBackgroundProps {
  /**
   * Which backdrop to draw.
   * @default 'fog'
   */
  variant?: HorrorBackgroundVariant;
  /**
   * How strong the backdrop is: opacity, animation speed, and snow density.
   * @default 'cursed'
   */
  intensity?: HorrorIntensity;
  /**
   * Cover the whole viewport instead of the nearest positioned parent.
   * @default false
   */
  fixed?: boolean;
  /**
   * Freeze all motion. Reduced-motion users get this automatically.
   * @default false
   */
  paused?: boolean;
  /** Color of the ritual circle. Ignored by other variants. */
  accent?: string;
  /**
   * Stacking order. The default sits behind the parent's content, which
   * needs `isolation: isolate` (or its own stacking context) to stay visible.
   * @default -1
   */
  zIndex?: number;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the backdrop. */
  style?: CSSProperties;
}

/**
 * A full-bleed atmospheric backdrop that never blocks the page: it ignores
 * pointer events, is hidden from assistive tech, and stops moving for users
 * who prefer reduced motion.
 *
 * - **fog**: slow banks of mist drifting past
 * - **storm**: rain, and lightning that flashes the sky and draws a bolt
 * - **ritual-circle**: a glowing summoning circle with turning rings
 * - **blizzard**: wind-blown snow on a cold sky
 * - **candlelit**: a dark vignette with flickering candle glow
 * - **hypnotic**: a slow tunnel of shimmering spokes and rushing rings
 *
 * The hypnotic backdrop is slow and low in contrast, but any swirling motion
 * can bother some people. Pair it with `ClickToBegin` or a clear way to turn
 * it off, and note it stops entirely under `prefers-reduced-motion`.
 *
 * Fog, ritual circle, and candlelit are transparent overlays and sit on
 * whatever is behind them. Storm and blizzard bring their own sky.
 *
 * @example
 * ```tsx
 * <main style={{ position: 'relative', isolation: 'isolate' }}>
 *   <HorrorBackground variant="storm" intensity="abyssal" />
 *   <h1>Content stays clickable</h1>
 * </main>
 * ```
 *
 * @example Whole page
 * ```tsx
 * <HorrorBackground variant="fog" fixed />
 * ```
 */
export const HorrorBackground = ({
  variant = 'fog',
  intensity = 'cursed',
  fixed = false,
  paused = false,
  accent,
  zIndex = BACKGROUND_Z_INDEX,
  className = '',
  style,
}: HorrorBackgroundProps) => {
  const prefersReducedMotion = useMediaQuery(breakpoints.reducedMotion);
  const animate = !paused && !prefersReducedMotion;
  const tone = intensityTokens[intensity];

  return (
    <div
      aria-hidden="true"
      data-variant={variant}
      data-motion={animate ? 'on' : 'off'}
      className={`${BACKGROUND_CLASS} ${BACKGROUND_CLASS}--${variant} ${className}`.trim()}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex,
        opacity: tone.opacity,
        ...style,
      }}
    >
      <style>{backgroundKeyframes}</style>
      {variant === 'fog' && <FogLayers speed={tone.speed} />}
      {variant === 'storm' && <StormLayers speed={tone.speed} />}
      {variant === 'ritual-circle' && <RitualCircleLayer speed={tone.speed} color={accent} />}
      {variant === 'blizzard' && (
        <BlizzardLayer speed={tone.speed} density={tone.density} animate={animate} />
      )}
      {variant === 'candlelit' && <CandlelitLayers speed={tone.speed} />}
      {variant === 'hypnotic' && <HypnoticLayers speed={tone.speed} />}
    </div>
  );
};
