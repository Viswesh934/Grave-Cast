/**
 * ExcavationLoader - Animated loading component with grave-digging theme
 * @module components/crypt/ExcavationLoader
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { Bone } from '../../../assets/svg/base/Bone';

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

    // Size to icon size mapping
    const iconSizes = {
      sm: 24,
      md: 32,
      lg: 48,
    };

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
          {/* Rotating bone tool */}
          <div className="grave-excavation__tool">
            <Bone
              size={iconSizes[size]}
              color="currentColor"
              className="grave-excavation__bone"
            />
          </div>

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
