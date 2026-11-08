/**
 * useAnimationState - Reusable animation lifecycle management
 * @module hooks/useAnimationState
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Animation states
 */
export type AnimationState = 'idle' | 'animating' | 'complete';

/**
 * Options for animation state management
 */
export interface AnimationStateOptions {
  /** Auto-reset to idle after animation completes (ms) */
  resetDelay?: number;
  /** Callback when animation starts */
  onAnimationStart?: () => void;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

/**
 * Return type from useAnimationState hook
 */
export interface AnimationStateReturn {
  /** Current animation state */
  state: AnimationState;
  /** Start the animation */
  startAnimation: () => void;
  /** Complete the animation */
  completeAnimation: () => void;
  /** Reset to idle state */
  reset: () => void;
  /** Whether animation is currently running */
  isAnimating: boolean;
}

/**
 * Reusable hook for managing animation lifecycle states.
 * 
 * Handles animation state transitions (idle → animating → complete)
 * with optional auto-reset and callbacks.
 * 
 * @example
 * ```tsx
 * const { state, startAnimation, isAnimating } = useAnimationState({
 *   resetDelay: 1000, // Reset to idle after 1 second
 * });
 * 
 * return (
 *   <div 
 *     onClick={startAnimation}
 *     className={isAnimating ? 'animating' : ''}
 *   >
 *     {state}
 *   </div>
 * );
 * ```
 * 
 * @example With callbacks
 * ```tsx
 * const { startAnimation } = useAnimationState({
 *   onAnimationStart: () => console.log('Started'),
 *   onAnimationComplete: () => console.log('Complete'),
 * });
 * ```
 * 
 * @param options - Configuration options
 * @returns Object with state and control functions
 */
export const useAnimationState = (
  options: AnimationStateOptions = {}
): AnimationStateReturn => {
  const { resetDelay, onAnimationStart, onAnimationComplete } = options;
  
  const [state, setState] = useState<AnimationState>('idle');
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Clean up timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Start the animation
   */
  const startAnimation = useCallback(() => {
    setState('animating');
    onAnimationStart?.();
  }, [onAnimationStart]);

  /**
   * Mark animation as complete
   */
  const completeAnimation = useCallback(() => {
    setState('complete');
    onAnimationComplete?.();

    // Auto-reset if delay is specified
    if (resetDelay !== undefined) {
      resetTimeoutRef.current = setTimeout(() => {
        setState('idle');
      }, resetDelay);
    }
  }, [resetDelay, onAnimationComplete]);

  /**
   * Manual reset to idle
   */
  const reset = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    setState('idle');
  }, []);

  return {
    state,
    startAnimation,
    completeAnimation,
    reset,
    isAnimating: state === 'animating',
  };
};
