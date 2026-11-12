/**
 * WitchOnBroom - A line-art witch flying across the moon
 * @module components/coven/WitchOnBroom
 */

import { forwardRef, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent } from 'react';
import { playSound } from '../../../audio';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import {
  WITCH_VIEWBOX,
  witchFlightTiming,
  witchLine,
  witchMotion,
  witchSizes,
  type WitchFlightSpeed,
  type WitchSize,
} from './tokens';

export type { WitchFlightSpeed, WitchSize };

/** Class names used by the drawing's stylesheet. */
const CLASS = {
  root: 'grave-witch',
  flight: 'grave-witch__flight',
  flutter: 'grave-witch__flutter',
  spark: 'grave-witch__spark',
  star: 'grave-witch__star',
  spell: 'grave-witch__spell',
} as const;

/** Sparks in her wake: where each starts, and how far through the cycle (0 to 1). */
const SPARKS: readonly { x: number; y: number; r: number; delay: number }[] = [
  { x: 12, y: 98, r: 1.6, delay: 0 },
  { x: 8, y: 108, r: 1.2, delay: 0.25 },
  { x: 18, y: 118, r: 1.4, delay: 0.5 },
  { x: 4, y: 102, r: 1, delay: 0.7 },
  { x: 14, y: 112, r: 1.1, delay: 0.85 },
];

/** Stars in the sky, and how far through a twinkle each starts (0 to 1). */
const STARS: readonly { x: number; y: number; size: number; delay: number }[] = [
  { x: 30, y: 28, size: 3, delay: 0 },
  { x: 66, y: 14, size: 2, delay: 0.2 },
  { x: 104, y: 34, size: 2.5, delay: 0.4 },
  { x: 222, y: 108, size: 2.5, delay: 0.1 },
  { x: 132, y: 14, size: 2, delay: 0.3 },
  { x: 210, y: 140, size: 2, delay: 0.5 },
];

const witchStyles = `
.${CLASS.root} {
  display: inline-block;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  line-height: 0;
  border-radius: ${witchLine.radius};
}
.${CLASS.root}:focus-visible {
  outline: ${witchLine.focusRing.width} solid ${witchLine.focus};
  outline-offset: ${witchLine.focusRing.offset};
}
.${CLASS.flight} {
  transform-box: fill-box;
  transform-origin: center;
  animation: grave-witch-bob var(--grave-witch-bob) ease-in-out infinite;
}
.${CLASS.flutter} {
  transform-box: fill-box;
  transform-origin: right top;
  animation: grave-witch-flutter var(--grave-witch-flutter) ease-in-out infinite;
}
.${CLASS.spark} {
  animation: grave-witch-spark var(--grave-witch-trail) linear infinite;
}
.${CLASS.star} {
  animation: grave-witch-twinkle ${witchMotion.twinkle} ease-in-out infinite;
}
.${CLASS.spell} {
  transform-box: fill-box;
  transform-origin: center;
  animation: grave-witch-spell ${witchMotion.spellMs}ms ease-out forwards;
}
@keyframes grave-witch-bob {
  0%, 100% { transform: translateY(-${witchMotion.bob}px) rotate(-${witchMotion.tilt}deg); }
  50% { transform: translateY(${witchMotion.bob}px) rotate(${witchMotion.tilt}deg); }
}
@keyframes grave-witch-flutter {
  0%, 100% { transform: skewX(0deg); }
  50% { transform: skewX(${witchMotion.flutter}deg); }
}
@keyframes grave-witch-spark {
  0% { transform: translateX(0); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translateX(-${witchMotion.trailDrift}px); opacity: 0; }
}
@keyframes grave-witch-twinkle {
  0%, 100% { opacity: ${witchMotion.twinkleDim}; }
  50% { opacity: 1; }
}
@keyframes grave-witch-spell {
  0% { transform: scale(${witchMotion.spellScale.from}); opacity: ${witchMotion.spellOpacity}; }
  100% { transform: scale(${witchMotion.spellScale.to}); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .${CLASS.flight}, .${CLASS.flutter}, .${CLASS.spark}, .${CLASS.star}, .${CLASS.spell} { animation: none; }
}
`;

/**
 * Props for {@link WitchOnBroom}.
 */
export interface WitchOnBroomProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick' | 'color'> {
  /** How fast she flies. @default 'hunt' */
  flightSpeed?: WitchFlightSpeed;
  /** Color of the sparks and the spell ring. @default witchLine.spell */
  spellColor?: string;
  /** Called when she casts a spell (a click, Enter, or Space). */
  onCastSpell?: () => void;
  /** Lean toward the pointer while it moves over her. @default true */
  followPointer?: boolean;
  /** Play a sound when she casts a spell. @default true */
  soundOnCast?: boolean;
  /** Width preset, or a width in px. @default 'md' */
  size?: WitchSize | number;
  /** What screen readers hear. @default 'A witch flying across the moon. Activate to cast a spell.' */
  label?: string;
}

/**
 * WitchOnBroom - A line-art witch on her broomstick, flying across the moon.
 *
 * Drawn in fine lines that suit dark interfaces. She bobs through the air,
 * her cloak and hair snap in the wind, and sparks trail behind the broom.
 * She leans toward the pointer, and casts a spell when clicked or when
 * Enter or Space is pressed. All motion stops for people who ask their
 * device for less of it.
 *
 * @example
 * ```tsx
 * <WitchOnBroom flightSpeed="glide" onCastSpell={() => console.log('Hexed')} />
 * ```
 */
export const WitchOnBroom = forwardRef<HTMLButtonElement, WitchOnBroomProps>(
  (
    {
      flightSpeed = 'hunt',
      spellColor = witchLine.spell,
      onCastSpell,
      followPointer = true,
      soundOnCast = true,
      size = 'md',
      label = 'A witch flying across the moon. Activate to cast a spell.',
      className = '',
      style,
      onPointerMove,
      onPointerLeave,
      ...props
    },
    ref
  ) => {
    const lessMotion = useReducedMotion();
    const [lean, setLean] = useState({ bank: 0, rise: 0 });
    const [spell, setSpell] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timing = witchFlightTiming[flightSpeed] ?? witchFlightTiming.hunt;
    const width = typeof size === 'number' ? size : witchSizes[size];

    useEffect(() => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const cast = () => {
      if (soundOnCast) playSound('coffinCreak');
      setSpell((count) => count + 1);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSpell(0), witchMotion.spellMs);
      onCastSpell?.();
    };

    const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
      onPointerMove?.(event);
      if (!followPointer || lessMotion) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      // -1 at the left or top edge, 1 at the right or bottom edge.
      const x = ((event.clientX - box.left) / box.width) * 2 - 1;
      const y = ((event.clientY - box.top) / box.height) * 2 - 1;
      setLean({ bank: x * witchMotion.bank, rise: y * witchMotion.bob });
    };

    const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
      onPointerLeave?.(event);
      setLean({ bank: 0, rise: 0 });
    };

    const line = { fill: 'none', stroke: witchLine.ink, strokeWidth: witchLine.stroke, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        onClick={cast}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`${CLASS.root} ${className}`.trim()}
        style={
          {
            '--grave-witch-bob': timing.bob,
            '--grave-witch-flutter': timing.flutter,
            '--grave-witch-trail': timing.trail,
            ...style,
          } as CSSProperties
        }
        {...props}
      >
        <style>{witchStyles}</style>
        <svg
          aria-hidden="true"
          width={width}
          height={(width * WITCH_VIEWBOX.height) / WITCH_VIEWBOX.width}
          viewBox={`0 0 ${WITCH_VIEWBOX.width} ${WITCH_VIEWBOX.height}`}
        >
          {/* The moon */}
          <circle cx="178" cy="46" r="30" fill={witchLine.moon} fillOpacity={witchLine.moonFill} stroke={witchLine.moon} strokeWidth={witchLine.stroke} />
          {/* Craters, placed unevenly so they never read as a face */}
          <g fill={witchLine.moon} fillOpacity={witchLine.moonFill} stroke={witchLine.moon} strokeWidth={witchLine.thin} opacity={witchLine.craterOpacity}>
            <circle cx="169" cy="38" r="5" />
            <circle cx="190" cy="59" r="2.5" />
            <circle cx="160" cy="57" r="1.8" />
          </g>

          {/* Stars */}
          <g fill="none" stroke={witchLine.faint} strokeWidth={witchLine.thin} strokeLinecap="round">
            {STARS.map((star, index) => (
              <path
                key={index}
                className={CLASS.star}
                style={{ animationDelay: `calc(${witchMotion.twinkle} * -${star.delay})` }}
                d={`M ${star.x - star.size} ${star.y} H ${star.x + star.size} M ${star.x} ${star.y - star.size} V ${star.y + star.size}`}
              />
            ))}
          </g>

          {/* The flight: leans toward the pointer, and bobs on its own */}
          <g
            style={{
              transform: `translateY(${lean.rise}px) rotate(${lean.bank}deg)`,
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transition: `transform ${witchMotion.bankEase}`,
            }}
          >
            <g className={CLASS.flight}>
              {/* Sparks in her wake */}
              {SPARKS.map((spark, index) => (
                <circle
                  key={index}
                  className={CLASS.spark}
                  style={{ animationDelay: `calc(var(--grave-witch-trail) * -${spark.delay})` }}
                  cx={spark.x}
                  cy={spark.y}
                  r={spark.r}
                  fill={spellColor}
                />
              ))}

              {/* Broom: shaft, binding, and bristles */}
              <path {...line} d="M 52 104 C 100 98, 150 92, 206 84" />
              <path {...line} strokeWidth={witchLine.thin} d="M 51 99 L 53 110 M 56 98 L 58 109" />
              <g {...line} strokeWidth={witchLine.thin}>
                <path d="M 52 101 Q 34 94 14 90" />
                <path d="M 52 103 Q 32 100 12 99" />
                <path d="M 52 105 Q 32 107 12 108" />
                <path d="M 52 107 Q 34 114 15 117" />
                <path d="M 52 109 Q 38 119 22 124" />
              </g>

              {/* Legs and boots */}
              <path {...line} d="M 126 93 Q 136 102 142 106 L 152 110 q 4 1 6 -2" />
              <path {...line} d="M 122 94 Q 130 104 136 112 L 144 115 q 4 0 5 -3" />

              {/* Cloak and hair, snapping in the wind */}
              <g className={CLASS.flutter}>
                <path {...line} d="M 130 66 Q 112 72 100 84 L 92 97 L 102 92 L 97 104 L 108 96 L 107 107 L 117 97 Q 121 95 125 94" />
                <g {...line} strokeWidth={witchLine.thin}>
                  <path d="M 133 58 Q 122 60 112 58" />
                  <path d="M 133 61 Q 121 66 110 64" />
                  <path d="M 133 63 Q 124 70 114 72" />
                </g>
              </g>

              {/* Body leaning into the flight, and the arm on the broom */}
              <path {...line} d="M 126 93 Q 131 80 136 69" />
              <path {...line} d="M 136 70 Q 146 78 152 88 q 4 3 8 0" />

              {/* Head, hooked nose, and chin */}
              <circle {...line} cx="138" cy="60" r="6" />
              <path {...line} strokeWidth={witchLine.thin} d="M 143 59 q 6 1 5 5 q -2 -1 -4 -1 M 140 66 q 3 1 5 -1" />

              {/* Pointed hat with its tip bent back by the wind */}
              <path {...line} d="M 124 56 Q 138 50 154 54" />
              <path {...line} d="M 131 54 Q 130 42 128 35 Q 124 28 115 27 Q 126 26 134 32 Q 140 42 147 52" />

              {/* The spell, when cast */}
              {spell > 0 && (
                <circle key={spell} className={CLASS.spell} cx="150" cy="80" r="22" fill="none" stroke={spellColor} strokeWidth={witchLine.stroke} />
              )}
            </g>
          </g>
        </svg>
      </button>
    );
  }
);

WitchOnBroom.displayName = 'WitchOnBroom';
