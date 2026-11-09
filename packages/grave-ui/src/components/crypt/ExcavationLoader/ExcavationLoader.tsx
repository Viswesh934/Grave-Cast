/**
 * ExcavationLoader - Animated loading component with grave-digging theme
 * @module components/crypt/ExcavationLoader
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { excavationTokens } from './tokens';

/**
 * GraveSpadeIcon - An authentic forged graveyard digging spade.
 * Material colors are sourced from the component token extension.
 */
function GraveSpadeIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
  const { spade } = excavationTokens;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      {/* T-grip Handle */}
      <rect x="22" y="4" width="20" height="4" rx="2" fill={spade.handleGrip} stroke={spade.handleGripEdge} strokeWidth="1" />
      <rect x="30" y="8" width="4" height="28" rx="1" fill={spade.handleShaft} stroke={spade.handleShaftEdge} strokeWidth="1" />
      {/* Steel Collar */}
      <rect x="28" y="34" width="8" height="6" rx="1" fill={spade.collar} stroke={spade.collarEdge} strokeWidth="1" />
      {/* Curved Spade Blade */}
      <path
        d="M23 40 L41 40 L43 50 C43 58, 32 62, 32 62 C32 62, 21 58, 21 50 Z"
        fill={spade.blade}
        stroke={spade.bladeEdge}
        strokeWidth="1.5"
      />
      {/* Blade spine highlight */}
      <line x1="32" y1="41" x2="32" y2="58" stroke={spade.bladeHighlight} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Loader size options
 */
export type ExcavationSize = 'sm' | 'md' | 'lg';

/**
 * Loader animation speed
 */
export type ExcavationSpeed = 'slow' | 'normal' | 'fast';

/**
 * ExcavationLoader component props
 */
export interface ExcavationLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the loader */
  size?: ExcavationSize;
  /** Animation speed */
  speed?: ExcavationSpeed;
  /** Loading message text */
  message?: string;
  /** Show message below loader */
  showMessage?: boolean;
}

/**
 * ExcavationLoader - An animated loading component with a grave-digging metaphor.
 * 
 * Features a rotating bone icon with dirt-flying animation effects,
 * evoking the imagery of archaeological excavation or grave digging.
 * 
 * Uses animation tokens for timing and easing, demonstrating proper
 * token integration for animated components.
 * 
 * @example Basic usage
 * ```tsx
 * <ExcavationLoader />
 * ```
 * 
 * @example With message
 * ```tsx
 * <ExcavationLoader
 *   size="lg"
 *   message="Excavating ancient tombs..."
 *   showMessage
 * />
 * ```
 * 
 * @example Fast loading
 * ```tsx
 * <ExcavationLoader
 *   speed="fast"
 *   message="Quick dig..."
 * />
 * ```
 */
export const ExcavationLoader = forwardRef<HTMLDivElement, ExcavationLoaderProps>(
  (
    {
      size = 'md',
      speed = 'normal',
      message = 'Loading...',
      showMessage = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Size-specific classes
    const sizeClasses = {
      sm: 'grave-excavation--sm',
      md: 'grave-excavation--md',
      lg: 'grave-excavation--lg',
    };

    // Speed-specific classes
    const speedClasses = {
      slow: 'grave-excavation--slow',
      normal: 'grave-excavation--normal',
      fast: 'grave-excavation--fast',
    };

    const loaderClasses = [
      'grave-excavation',
      sizeClasses[size],
      speedClasses[speed],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={loaderClasses}
        role="status"
        aria-live="polite"
        aria-busy="true"
        {...props}
      >
        {/* Main excavation animation container */}
        <div className="grave-excavation__container">
          {/* Digging spade tool */}
          <div className="grave-excavation__tool">
            <GraveSpadeIcon
              size={excavationTokens.iconSizes[size]}
              className="grave-excavation__spade drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Dirt mound base */}
          <div
            className="absolute -bottom-1 inset-x-2 h-2.5 rounded-full border-t opacity-80"
            style={{
              backgroundColor: excavationTokens.dirt.mound,
              borderTopColor: excavationTokens.dirt.moundEdge,
            }}
          />

          {/* Dirt particles flying effect */}
          <div className="grave-excavation__particles">
            <span className="grave-excavation__particle grave-excavation__particle--1" />
            <span className="grave-excavation__particle grave-excavation__particle--2" />
            <span className="grave-excavation__particle grave-excavation__particle--3" />
          </div>
        </div>

        {/* Optional loading message */}
        {showMessage && (
          <p className="grave-excavation__message">
            {message}
          </p>
        )}

        {/* Screen reader text */}
        <span className="sr-only">{message}</span>
      </div>
    );
  }
);

ExcavationLoader.displayName = 'ExcavationLoader';
