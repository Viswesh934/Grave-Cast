/**
 * useLatest - A ref that always holds the newest value
 * @module hooks/useLatest
 */

import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

/**
 * Keeps the newest value in a ref, so long-lived callbacks (listeners, timers,
 * animation loops) can read fresh props without being set up again.
 *
 * The ref updates after each render, before effects run. Read it inside
 * callbacks and effects, not during render.
 *
 * @example
 * ```tsx
 * const onTickRef = useLatest(onTick);
 *
 * useEffect(() => {
 *   const id = setInterval(() => onTickRef.current(), 1000);
 *   return () => clearInterval(id);
 * }, [onTickRef]);
 * ```
 *
 * @param value - The value to keep current.
 * @returns A stable ref whose `current` is the latest value.
 */
export const useLatest = <T,>(value: T): { readonly current: T } => {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
};
