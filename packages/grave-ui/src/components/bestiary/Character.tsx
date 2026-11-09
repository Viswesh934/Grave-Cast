/**
 * Character - the one renderer behind every creature in the bestiary.
 *
 * Give it a `CharacterSpec` (silhouette layers + eyes + accent) and it draws a
 * consistent, size-preset, hover-animated, accessible figure. Every creature in
 * the cast is this component with different data, so new monsters are cheap to
 * add and automatically share the same polish.
 *
 * @module components/bestiary/Character
 */

import { forwardRef, useId, type HTMLAttributes } from 'react';
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
}

/**
 * Draws a single creature from its spec.
 *
 * @example
 * ```tsx
 * import { Character, pumpkinSpec } from 'groove-ui';
 *
 * <Character spec={pumpkinSpec} size="lg" showLabel />
 * ```
 *
 * @example Build your own monster from a spec
 * ```tsx
 * import { Character, defineCharacter, creatureMaterials } from 'groove-ui';
 *
 * const mimic = defineCharacter({
 *   id: 'mimic',
 *   name: 'Chester',
 *   tagline: 'Looks just like an ordinary chest',
 *   accent: 'gold',
 *   layers: [{ d: 'M15 40 H85 V85 H15 Z', fill: creatureMaterials.cloth.coat }],
 *   eyes: [{ cx: 40, cy: 60 }, { cx: 60, cy: 60 }],
 * });
 *
 * <Character spec={mimic} />
 * ```
 */
export const Character = forwardRef<HTMLDivElement, CharacterProps>(
  (
    { spec, size = 'md', sound = true, showLabel = false, className = '', style, ...props },
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

    return (
      <div
        ref={ref}
        className={`inline-flex flex-col items-center gap-2 select-none ${className}`}
        style={{ width: dimension, ...style }}
        {...hoverProps}
        {...props}
      >
        <svg
          viewBox="0 0 100 100"
          width={dimension}
          height={dimension}
          className="overflow-visible"
          role="img"
          aria-label={`${spec.name}, ${spec.tagline}`}
          style={{
            transform: isHovered ? `translateY(-${characterMotion.bob}px)` : 'translateY(0)',
            transition: `transform ${characterMotion.transition} cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          <defs>
            <radialGradient id={`aura-${glowId}`}>
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.55" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </radialGradient>
            <filter id={`eyeglow-${glowId}`} x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Accent aura, brighter on hover */}
          <circle
            cx="50"
            cy="52"
            r="46"
            fill={`url(#aura-${glowId})`}
            style={{
              opacity: isHovered ? 1 : 0.5,
              transition: `opacity ${characterMotion.transition} ease`,
            }}
          />

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

          {/* Glowing accent eyes */}
          <g filter={`url(#eyeglow-${glowId})`}>
            {spec.eyes.map((eye, i) => (
              <circle key={i} cx={eye.cx} cy={eye.cy} r={eye.r ?? eyeR} fill={accentColor} />
            ))}
          </g>

          {/* Optional foreground flourish */}
          {spec.flourish}
        </svg>

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
