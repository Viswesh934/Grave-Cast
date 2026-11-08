/**
 * useHorrorHover - Reusable hover state management with optional audio
 * @module hooks/useHorrorHover
 */

import { useState, useCallback } from 'react';

/**
 * Sound effect names that can be played on hover
 */
export type SoundEffect = 'stoneGrind' | 'boneClick' | 'coffinCreak' | 'cauldronBubble';

/**
 * Props interface for hover behavior configuration
 */
export interface HorrorHoverOptions {
  /** Sound effect to play on hover (optional) */
  soundEffect?: SoundEffect;
  /** Whether sound is enabled (optional, defaults to checking global audio state) */
  soundEnabled?: boolean;
  /** Callback when hover starts */
  onHoverStart?: () => void;
  /** Callback when hover ends */
  onHoverEnd?: () => void;
}

/**
 * Return type from useHorrorHover hook
 */
export interface HorrorHoverReturn {
  /** Current hover state */
  isHovered: boolean;
  /** Props to spread onto the hoverable element */
  hoverProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  /** Manual function to play the sound effect */
  playSound: () => void;
}

/**
 * Reusable hook for managing hover state with optional horror sound effects.
 * 
 * Provides hover state management and optional audio playback on hover.
 * Respects global audio enable/disable setting.
 * 
 * @example
 * ```tsx
 * const { isHovered, hoverProps } = useHorrorHover({
 *   soundEffect: 'stoneGrind',
 * });
 * 
 * return (
 *   <div {...hoverProps} style={{ opacity: isHovered ? 0.8 : 1 }}>
 *     Hover me
 *   </div>
 * );
 * ```
 * 
 * @example With callbacks
 * ```tsx
 * const { isHovered, hoverProps } = useHorrorHover({
 *   soundEffect: 'boneClick',
 *   onHoverStart: () => console.log('Hover started'),
 *   onHoverEnd: () => console.log('Hover ended'),
 * });
 * ```
 * 
 * @param options - Configuration options for hover behavior
 * @returns Object with hover state and props
 */
export const useHorrorHover = (options: HorrorHoverOptions = {}): HorrorHoverReturn => {
  const { soundEffect, soundEnabled = true, onHoverStart, onHoverEnd } = options;
  
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Play sound effect (placeholder until audio engine is built in Task 6)
   * TODO: Wire up to actual audio engine when available
   */
  const playSound = useCallback(() => {
    if (soundEffect && soundEnabled) {
      // Placeholder: will integrate with Web Audio API in Task 6
      console.log(`[Horror Audio] Playing: ${soundEffect}`);
    }
  }, [soundEffect, soundEnabled]);

  /**
   * Handle mouse enter event
   */
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    playSound();
    onHoverStart?.();
  }, [playSound, onHoverStart]);

  /**
   * Handle mouse leave event
   */
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onHoverEnd?.();
  }, [onHoverEnd]);

  return {
    isHovered,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    playSound,
  };
};
