/**
 * Layers that make up each HorrorBackground variant.
 *
 * Each layer is exported on its own, so you can stack them in your own
 * composition, for example fog over a candlelit room.
 *
 * @module components/effects/HorrorBackground/layers
 */

import { useRef, type CSSProperties } from 'react';
import { useSnowfall } from '../../../hooks/useSnowfall';
import { RAIN_TILE_VAR, bgAnimation } from './styles';
import {
  backgroundColors,
  candleTokens,
  fogTokens,
  hypnoticTokens,
  ritualTokens,
  stormTokens,
  withAlpha,
} from './tokens';

/**
 * Props shared by the animated layers.
 */
export interface BackgroundLayerProps {
  /** Animation speed multiplier. @default 1 */
  speed?: number;
}

const fill: CSSProperties = { position: 'absolute', inset: 0 };

/** Position and size of a soft glow, in percent of the backdrop. */
interface GlowShape {
  x: number;
  y: number;
  width: number;
  height: number;
  reach: number;
}

const fogBlobs = (color: string): string => {
  const blob = withAlpha(color, fogTokens.blobStrength);
  return fogTokens.blobs
    .map(({ x, y, reach }) => `radial-gradient(ellipse at ${x}% ${y}%, ${blob} 0%, transparent ${reach}%)`)
    .join(', ');
};

/**
 * Three banks of fog sliding past at different speeds and directions.
 */
export const FogLayers = ({ speed = 1 }: BackgroundLayerProps) => (
  <>
    {fogTokens.layers.map((layer, index) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: 0,
          top: layer.top,
          height: layer.height,
          width: '200%',
          opacity: layer.opacity,
          backgroundImage: fogBlobs(backgroundColors.fog),
          backgroundSize: '50% 100%',
          backgroundRepeat: 'repeat-x',
          animation: `${bgAnimation.fogDrift} ${layer.duration / speed}s linear infinite`,
          animationDirection: layer.reverse ? 'reverse' : 'normal',
          willChange: 'transform',
        }}
      />
    ))}
  </>
);

const bolt = 'M62 0 L38 42 L54 42 L30 100 L74 48 L56 48 L82 0 Z';

/**
 * A dark sky, two layers of slanting rain, and lightning that flashes the
 * sky and draws a bolt at the same moment.
 */
export const StormLayers = ({ speed = 1 }: BackgroundLayerProps) => {
  const { rain, flashPeriod, flashStrength } = stormTokens;
  const mask = `repeating-linear-gradient(180deg, black 0 ${rain.streak}px, transparent ${rain.streak}px ${rain.tile}px)`;
  const flash = `${flashPeriod / speed}s linear infinite`;

  return (
    <>
      <div
        style={{
          ...fill,
          background: `linear-gradient(180deg, ${backgroundColors.stormSky.top}, ${backgroundColors.stormSky.bottom})`,
        }}
      />
      {rain.layers.map((layer, index) => (
        <div
          key={index}
          style={
            {
              position: 'absolute',
              inset: `${rain.overshoot}%`,
              transform: `rotate(${rain.angle}deg)`,
              opacity: layer.opacity,
              backgroundImage: `repeating-linear-gradient(90deg, ${backgroundColors.rain} 0 1px, transparent 1px ${layer.spacing}px)`,
              WebkitMaskImage: mask,
              maskImage: mask,
              WebkitMaskSize: `100% ${rain.tile}px`,
              maskSize: `100% ${rain.tile}px`,
              animation: `${bgAnimation.rain} ${layer.duration / speed}s linear infinite`,
              [RAIN_TILE_VAR]: `${rain.tile}px`,
            } as CSSProperties
          }
        />
      ))}
      <div
        style={{
          ...fill,
          backgroundColor: withAlpha(backgroundColors.lightning, flashStrength),
          opacity: 0,
          animation: `${bgAnimation.flash} ${flash}`,
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: stormTokens.bolt.left,
          width: stormTokens.bolt.width,
          height: stormTokens.bolt.height,
          opacity: 0,
          animation: `${bgAnimation.bolt} ${flash}`,
        }}
      >
        <path d={bolt} fill={backgroundColors.lightning} />
      </svg>
    </>
  );
};

const polar = (radius: number, degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  return { x: radius * Math.cos(radians), y: radius * Math.sin(radians) };
};

const point = (p: { x: number; y: number }): string => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;

const FULL_TURN = 360;
const STAR_POINTS = 5;
const STAR_ORDER = [0, 2, 4, 1, 3] as const;

const tickPath = Array.from({ length: ritualTokens.tickCount }, (_, index) => {
  const angle = (index / ritualTokens.tickCount) * FULL_TURN;
  const long = index % ritualTokens.longTickEvery === 0;
  const from = polar(ritualTokens.tickInner - (long ? ritualTokens.longTickExtra : 0), angle);
  const to = polar(ritualTokens.tickOuter, angle);
  return `M${point(from)}L${point(to)}`;
}).join('');

const starPath = `${STAR_ORDER.map((step, index) => {
  const p = polar(ritualTokens.starRadius, -90 + (step * FULL_TURN) / STAR_POINTS);
  return `${index === 0 ? 'M' : 'L'}${point(p)}`;
}).join('')}Z`;

/** Small carved strokes drawn around the circle, each pointing outward. */
const runeGlyphs = [
  'M0 -4V4M0 -4L3 -1M0 0L3 3',
  'M-2 -4V4M-2 -4L2 0L-2 4',
  'M0 -4V4M-3 -2L3 2',
  'M-3 -4L3 4M3 -4L-3 4M0 -4V4',
] as const;

const ringSvg: CSSProperties = {
  gridArea: '1 / 1',
  height: '100%',
  maxWidth: '100%',
  aspectRatio: '1',
};

/**
 * Props for {@link RitualCircleLayer}.
 */
export interface RitualCircleLayerProps extends BackgroundLayerProps {
  /** Color of the circle and its glow. Defaults to blood red. */
  color?: string;
}

/**
 * A summoning circle: an outer ring of ticks and runes turning one way, and
 * a pentagram turning the other, under a slowly pulsing glow.
 */
export const RitualCircleLayer = ({
  speed = 1,
  color = backgroundColors.ritual,
}: RitualCircleLayerProps) => {
  const t = ritualTokens;

  return (
    <div
      style={{
        ...fill,
        display: 'grid',
        placeItems: 'center',
        color,
        filter: `drop-shadow(0 0 ${t.glow}px ${color})`,
        animation: `${bgAnimation.pulse} ${t.pulse / speed}s ease-in-out infinite`,
      }}
    >
      <svg
        viewBox="-100 -100 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth={t.strokeWidth}
        style={{ ...ringSvg, animation: `${bgAnimation.spin} ${t.outerSpin / speed}s linear infinite` }}
      >
        {t.rings.map((radius) => (
          <circle key={radius} r={radius} />
        ))}
        <path d={tickPath} />
        {Array.from({ length: t.runeCount }, (_, index) => (
          <path
            key={index}
            d={runeGlyphs[index % runeGlyphs.length]}
            transform={`rotate(${(index / t.runeCount) * FULL_TURN}) translate(0 ${-t.runeRadius})`}
          />
        ))}
      </svg>
      <svg
        viewBox="-100 -100 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth={t.strokeWidth}
        style={{ ...ringSvg, animation: `${bgAnimation.spinReverse} ${t.innerSpin / speed}s linear infinite` }}
      >
        <circle r={t.innerRing} />
        <path d={starPath} />
        <circle r={t.core} />
      </svg>
    </div>
  );
};

/**
 * Props for {@link BlizzardLayer}.
 */
export interface BlizzardLayerProps extends BackgroundLayerProps {
  /** Flake count multiplier. @default 1 */
  density?: number;
  /** When `false`, draws one still frame. @default true */
  animate?: boolean;
}

/**
 * A cold sky with snow blown across it. Snow is drawn on one canvas by the
 * `useSnowfall` hook, so a thick blizzard costs one element, not hundreds.
 */
export const BlizzardLayer = ({ density = 1, speed = 1, animate = true }: BlizzardLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useSnowfall(canvasRef, { color: backgroundColors.snow, density, speed, animate });

  return (
    <>
      <div
        style={{
          ...fill,
          background: `linear-gradient(180deg, ${backgroundColors.snowSky.top}, ${backgroundColors.snowSky.bottom})`,
        }}
      />
      <canvas ref={canvasRef} style={{ ...fill, width: '100%', height: '100%' }} />
    </>
  );
};

/**
 * A dark vignette lit from below by two flickering, candle-colored glows.
 */
export const CandlelitLayers = ({ speed = 1 }: BackgroundLayerProps) => {
  const c = candleTokens;
  const glow = (shape: GlowShape, strength: number) =>
    `radial-gradient(ellipse ${shape.width}% ${shape.height}% at ${shape.x}% ${shape.y}%, ${withAlpha(backgroundColors.candle, strength)}, transparent ${shape.reach}%)`;

  return (
    <>
      <div
        style={{
          ...fill,
          background: `radial-gradient(ellipse at 50% ${c.vignette.y}%, transparent ${c.vignette.clear}%, ${withAlpha(backgroundColors.vignette, c.vignette.strength)} 100%)`,
        }}
      />
      <div
        style={{
          ...fill,
          background: glow(c.primary, c.primaryStrength),
          animation: `${bgAnimation.flicker} ${c.primaryFlicker / speed}s ease-in-out infinite`,
        }}
      />
      <div
        style={{
          ...fill,
          background: glow(c.secondary, c.secondaryStrength),
          animation: `${bgAnimation.flicker} ${c.secondaryFlicker / speed}s ease-in-out ${c.secondaryOffset}s infinite`,
        }}
      />
    </>
  );
};

/**
 * A slow hypnotic tunnel: two spoke patterns turning opposite ways make a
 * shimmering moire, rings keep rushing toward you, and a core pulses at the
 * center. Slow and low in contrast on purpose, and still under reduced motion.
 */
export const HypnoticLayers = ({ speed = 1 }: BackgroundLayerProps) => {
  const t = hypnoticTokens;
  const colors = backgroundColors.hypnotic;
  const mask = `radial-gradient(circle at center, transparent ${t.mask.clear}%, black ${t.mask.solid}%, transparent ${t.mask.fade}%)`;

  return (
    <>
      <div
        style={{
          ...fill,
          background: `radial-gradient(circle at 50% 50%, ${colors.base}, ${colors.edge} ${t.baseReach}%)`,
        }}
      />
      {t.spokes.map((spoke, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            inset: `${t.spokeOvershoot}%`,
            backgroundImage: `repeating-conic-gradient(${withAlpha(colors[spoke.tone], spoke.strength)} 0deg ${spoke.step}deg, transparent ${spoke.step}deg ${spoke.step * 2}deg)`,
            WebkitMaskImage: mask,
            maskImage: mask,
            animation: `${spoke.reverse ? bgAnimation.spinReverse : bgAnimation.spin} ${spoke.duration / speed}s linear infinite`,
            willChange: 'transform',
          }}
        />
      ))}
      <div style={{ ...fill, display: 'grid', placeItems: 'center' }}>
        {Array.from({ length: t.rings.count }, (_, index) => (
          <div
            key={index}
            style={{
              gridArea: '1 / 1',
              width: `${t.rings.size}%`,
              aspectRatio: '1',
              borderRadius: '50%',
              border: `${t.rings.border}px solid ${withAlpha(colors.secondary, t.rings.strength)}`,
              opacity: 0,
              animation: `${bgAnimation.tunnel} ${t.rings.period / speed}s linear infinite`,
              animationDelay: `${-(index * t.rings.period) / (t.rings.count * speed)}s`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          ...fill,
          background: `radial-gradient(circle at 50% 50%, ${withAlpha(colors.primary, t.core.strength)}, transparent ${t.core.reach}%)`,
          animation: `${bgAnimation.pulse} ${t.core.pulse / speed}s ease-in-out infinite`,
        }}
      />
    </>
  );
};
