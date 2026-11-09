/**
 * Character - the one renderer behind every creature in the bestiary.
 *
 * Draws a creature from its `CharacterSpec` as layered SVG art, then gives that
 * flat art a sense of volume: it tilts toward the pointer in perspective, casts
 * a soft contact shadow, and lifts on hover. Double-click swells it. The result
 * reads as a dimensional figure without any WebGL.
 *
 * @module components/bestiary/Character
 */

import {
  forwardRef,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useHorrorHover } from '../../hooks';
import {
  characterSizes,
  characterMotion,
  creatureAccents,
} from './characterTokens';
import type { CharacterSize, CharacterSpec } from './types';

export interface CharacterProps extends HTMLAttributes<HTMLDivElement> {
  /** The creature to draw. */
  spec: CharacterSpec;
  /** Size preset (default 'md'). */
  size?: CharacterSize;
  /** Play the creature's hover sound on hover (default true). */
  sound?: boolean;
  /** Show the name/tagline caption beneath the figure (default false). */
  showLabel?: boolean;
  /** Tilt toward the pointer for a dimensional feel (default true). */
  tilt?: boolean;
  /** Double-click to swell the figure (default true). */
  growable?: boolean;
}

/** The two scale steps a double-click toggles between. */
const GROW_STEPS = [1, 1.5] as const;
/** Max tilt in degrees as the pointer sweeps across the figure. */
const MAX_TILT = 16;

/**
 * Draws a single creature from its spec with a faux-3D, dimensional feel.
 *
 * @example
 * ```tsx
 * import { Character, pumpkinSpec } from 'groove-ui';
 *
 * <Character spec={pumpkinSpec} size="lg" showLabel />
 * ```
 */
export const Character = forwardRef<HTMLDivElement, CharacterProps>(
  (
    {
      spec,
      size = 'md',
      sound = true,
      showLabel = false,
      tilt = true,
      growable = true,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const { isHovered, hoverProps } = useHorrorHover({
      soundEffect: spec.hoverSound,
      soundEnabled: sound && Boolean(spec.hoverSound),
    });

    const dimension = characterSizes[size];
    const accentColor = creatureAccents[spec.accent];
    const glowId = useId();
    const eyeR = 4;

    // Pointer-driven tilt (rotateX/rotateY) for perspective volume.
    const [rot, setRot] = useState({ x: 0, y: 0 });
    const [grow, setGrow] = useState(0);
    const frameRef = useRef<HTMLDivElement>(null);

    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!tilt || !frameRef.current) return;
      const r = frameRef.current.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const py = (e.clientY - r.top) / r.height - 0.5;
      setRot({ x: -py * MAX_TILT * 2, y: px * MAX_TILT * 2 });
    };

    const handlePointerLeave = () => {
      setRot({ x: 0, y: 0 });
      hoverProps.onMouseLeave();
    };

    const lift = isHovered ? characterMotion.bob : 0;
    const growScale = GROW_STEPS[grow];

    return (
      <div
        ref={ref}
        className={`inline-flex flex-col items-center gap-2 select-none ${className}`}
        style={{ width: dimension, perspective: `${dimension * 4}px`, ...style }}
        {...props}
      >
        <div
          ref={frameRef}
          onMouseEnter={hoverProps.onMouseEnter}
          onMouseLeave={handlePointerLeave}
          onPointerMove={handlePointerMove}
          onDoubleClick={() => growable && setGrow((g) => (g + 1) % GROW_STEPS.length)}
          style={{
            width: dimension,
            height: dimension,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) translateY(${-lift}px) scale(${growScale})`,
            transition: `transform ${characterMotion.transition} cubic-bezier(0.16, 1, 0.3, 1)`,
            cursor: 'pointer',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            width={dimension}
            height={dimension}
            className="overflow-visible"
            role="img"
            aria-label={`${spec.name}, ${spec.tagline}`}
            style={{
              filter: `drop-shadow(0 ${dimension * 0.06}px ${dimension * 0.06}px rgba(0,0,0,0.55))`,
            }}
          >
            <defs>
              {/* Soft volume shading: a dark vignette multiplied over the art
                  to fake a rounded, lit-from-upper-left form. */}
              <radialGradient id={`vol-${glowId}`} cx="38%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                <stop offset="55%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
              </radialGradient>
              <filter id={`eyeglow-${glowId}`} x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Silhouette + feature layers, back to front */}
            {spec.layers.map((layer, i) => (
              <path
                key={i}
                d={layer.d}
                fill={layer.fill ?? 'none'}
                stroke={layer.stroke}
                strokeWidth={layer.strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={layer.opacity}
              />
            ))}

            {/* Volume shading overlay clipped to the figure's rough bounds. */}
            <circle cx="50" cy="52" r="46" fill={`url(#vol-${glowId})`} style={{ mixBlendMode: 'multiply' }} />

            {/* Glowing accent eyes with sunken socket depth and high contrast */}
            <g filter={`url(#eyeglow-${glowId})`}>
              {spec.eyes.map((eye, i) => {
                const r = eye.r ?? eyeR;
                return (
                  <g key={i}>
                    {/* Deep sunken abyssal socket - ensures 16:1 contrast against pale sheets & snow */}
                    <circle cx={eye.cx} cy={eye.cy} r={r * 1.3} fill="#050811" />
                    {/* Glowing soul-fire iris */}
                    <circle cx={eye.cx} cy={eye.cy} r={r} fill={accentColor} />
                    {/* Piercing white specular glint */}
                    <circle cx={eye.cx - r * 0.28} cy={eye.cy - r * 0.28} r={r * 0.32} fill="#ffffff" opacity={0.88} />
                  </g>
                );
              })}
            </g>

            {/* Optional foreground flourish */}
            {spec.flourish}
          </svg>
        </div>

        {showLabel && (
          <div className="text-center">
            <p className="font-serif font-semibold text-sm text-grave-bone-100">{spec.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-grave-mist-400">
              {spec.tagline}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Character.displayName = 'Character';
