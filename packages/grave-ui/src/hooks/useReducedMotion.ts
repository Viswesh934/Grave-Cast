/**
 * useReducedMotion - Whether the user asked for less motion
 * @module hooks/useReducedMotion
 */

import { useSyncExternalStore } from 'react';
import { breakpoints } from './useMediaQuery';

/** The reduced-motion media query, or `null` where it cannot be read. */
const reducedMotionQuery = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(breakpoints.reducedMotion)
    : null;

const subscribe = (onChange: () => void): (() => void) => {
  const query = reducedMotionQuery();
  if (!query) return () => undefined;
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }
  // Older Safari only has the deprecated listener API.
  query.addListener(onChange);
  return () => query.removeListener(onChange);
};

const getServerSnapshot = (): boolean => false;

/**
 * Reads the reduced-motion preference once, outside React. `false` on the
 * server or where the preference cannot be read.
 */
export const prefersReducedMotion = (): boolean => reducedMotionQuery()?.matches ?? false;

/**
 * `true` when the user has asked their device for reduced motion. Updates live
 * when the setting changes.
 *
 * Unlike `useMediaQuery`, the first render in the browser already has the
 * right answer, so motion never flashes on for people who turned it off.
 * During server rendering it is `false`.
 *
 * @example
 * ```tsx
 * const reducedMotion = useReducedMotion();
 * useRafLoop(drift, { enabled: !reducedMotion });
 * ```
 */
export const useReducedMotion = (): boolean => useSyncExternalStore(subscribe, prefersReducedMotion, getServerSnapshot);
