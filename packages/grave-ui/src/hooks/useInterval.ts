/**
 * useInterval - A repeating timer that cleans up after itself
 * @module hooks/useInterval
 */

import { useEffect } from 'react';
import { useLatest } from './useLatest';

/**
 * Options for {@link useInterval}.
 */
export interface IntervalOptions {
  /** Also run once right away, instead of waiting for the first delay. @default false */
  immediate?: boolean;
}

/**
 * Calls `callback` every `delayMs` milliseconds. Pass `null` to pause.
 *
 * The callback can change on every render without resetting the timer. The
 * timer restarts only when the delay changes.
 *
 * @example
 * ```tsx
 * const [seconds, setSeconds] = useState(0);
 * useInterval(() => setSeconds((s) => s + 1), running ? 1000 : null);
 * ```
 *
 * @param callback - What to run on each tick.
 * @param delayMs - Milliseconds between ticks, or `null` to pause.
 */
export const useInterval = (callback: () => void, delayMs: number | null, options: IntervalOptions = {}): void => {
  const { immediate = false } = options;
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (delayMs === null || !Number.isFinite(delayMs) || delayMs < 0) return undefined;
    if (immediate) callbackRef.current();
    const id = setInterval(() => callbackRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs, immediate, callbackRef]);
};
