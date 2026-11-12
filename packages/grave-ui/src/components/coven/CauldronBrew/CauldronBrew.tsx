/**
 * CauldronBrew - Bubbling witch cauldron component
 * @module components/coven/CauldronBrew
 */

import { forwardRef, useId, useState, type HTMLAttributes } from 'react';
import { playSound } from '../../../audio';
import { brewVariants, cauldronBody, bubbleTiming, type BrewColor } from './tokens';

export type { BrewColor };

export interface CauldronBrewProps extends HTMLAttributes<HTMLDivElement> {
  /** Potion brew color */
  brewColor?: BrewColor;
  /** Whether the brew is actively boiling */
  boiling?: boolean;
  /** Play bubble sound effect on click */
  soundOnBubble?: boolean;
  /** Label or potion name */
  label?: string;
}

export const CauldronBrew = forwardRef<HTMLDivElement, CauldronBrewProps>(
  (
    {
      brewColor = 'emerald',
      boiling = true,
      soundOnBubble = true,
      label = 'Eldritch Concoction',
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const [bubbleTrigger, setBubbleTrigger] = useState(0);

    const currentConfig = brewVariants[brewColor];
    // Unique gradient ids, so several cauldrons on one page never share colors.
    const gradientId = useId();
    const brewGradientId = `brew-${gradientId}`;
    const bellyGradientId = `belly-${gradientId}`;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      setBubbleTrigger((prev) => prev + 1);
      if (soundOnBubble) {
        playSound('cauldronBubble');
      }
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={`relative inline-flex flex-col items-center justify-center p-6 cursor-pointer select-none group ${className}`}
        {...props}
      >
        {/* Steam / Occult Smoke particles */}
        {boiling && (
          <div className="absolute top-2 w-28 h-20 pointer-events-none overflow-visible flex justify-center">
            <span
              className="absolute w-6 h-6 rounded-full blur-md animate-pulse opacity-60"
              style={{
                backgroundColor: currentConfig.steam,
                top: '-8px',
                animationDuration: bubbleTiming.steamSlow,
              }}
            />
            <span
              className="absolute w-8 h-8 rounded-full blur-lg opacity-40 -translate-x-3"
              style={{
                backgroundColor: currentConfig.steam,
                top: '-16px',
                animation: `grave-particle-arc-3 ${bubbleTiming.steamArc} infinite ease-out`,
              }}
            />
          </div>
        )}

        {/* Cauldron SVG Container */}
        <div className="relative w-36 h-32 flex items-center justify-center">
          <svg
            viewBox="0 0 140 120"
            className="w-full h-full drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]"
          >
            {/* Hanging chain hooks / side handles */}
            <circle cx="15" cy="55" r="10" fill="none" stroke={cauldronBody.handleStroke} strokeWidth="4" />
            <circle cx="125" cy="55" r="10" fill="none" stroke={cauldronBody.handleStroke} strokeWidth="4" />

            {/* Cauldron Legs / Feet */}
            <path d="M 28 95 L 20 114 L 32 114 Z" fill={cauldronBody.legLight} stroke={cauldronBody.legEdge} strokeWidth="2" />
            <path d="M 70 98 L 70 115 L 76 115 Z" fill={cauldronBody.legDark} stroke={cauldronBody.legEdge} strokeWidth="2" />
            <path d="M 112 95 L 120 114 L 108 114 Z" fill={cauldronBody.legLight} stroke={cauldronBody.legEdge} strokeWidth="2" />

            {/* Main Cast-Iron Cauldron Belly */}
            <path
              d="M 20 40 Q 12 75 35 96 Q 70 112 105 96 Q 128 75 120 40 Z"
              fill={`url(#${bellyGradientId})`}
              stroke={cauldronBody.bellyStroke}
              strokeWidth="3"
            />

            {/* Cauldron Cast-Iron Rim */}
            <ellipse cx="70" cy="40" rx="52" ry="12" fill={cauldronBody.rimFill} stroke={cauldronBody.rimStroke} strokeWidth="3" />

            {/* Liquid Surface */}
            <ellipse
              cx="70"
              cy="41"
              rx="46"
              ry="9.5"
              style={{
                fill: currentConfig.glow,
                filter: `drop-shadow(0 0 8px ${currentConfig.glow})`,
              }}
            />

            {/* Inner brew gradient */}
            <ellipse cx="70" cy="42" rx="42" ry="8" fill={`url(#${brewGradientId})`} />

            {/* Animated Bubbles on liquid surface */}
            {boiling && (
              <g>
                <circle cx="56" cy="40" r="3" fill="#ffffff" opacity="0.8" className="animate-ping" style={{ animationDuration: bubbleTiming.bubbleA }} />
                <circle cx="82" cy="42" r="2.5" fill="#ffffff" opacity="0.7" className="animate-ping" style={{ animationDuration: bubbleTiming.bubbleB }} />
                <circle cx="68" cy="43" r="4" fill="#ffffff" opacity="0.6" className="animate-pulse" style={{ animationDuration: bubbleTiming.bubbleC }} />
              </g>
            )}

            <defs>
              <linearGradient id={bellyGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={currentConfig.glow} stopOpacity={cauldronBody.glowOnBelly} />
                <stop offset="35%" stopColor={cauldronBody.bellyFill} />
                <stop offset="100%" stopColor={cauldronBody.bellyShade} />
              </linearGradient>
              <linearGradient id={brewGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={currentConfig.glow} />
                <stop offset="100%" stopColor={cauldronBody.gradientBase} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Label & Hint */}
        {label && (
          <div className="mt-2 text-center">
            <span className="text-sm font-serif italic text-grave-bone-100 group-hover:text-emerald-300 transition-colors">
              {label}
            </span>
            <p className="text-[10px] font-mono tracking-widest text-grave-mist-400 uppercase mt-0.5">
              Click to Brew ({bubbleTrigger} stirs)
            </p>
          </div>
        )}
      </div>
    );
  }
);

CauldronBrew.displayName = 'CauldronBrew';
