/**
 * useNow - The current time, refreshed on a schedule
 * @module hooks/useNow
 */

import { useEffect, useState } from 'react';

/** Default refresh interval in milliseconds. */
export const DEFAULT_NOW_INTERVAL = 1000;

/**
 * Returns the current date and refreshes it every `intervalMs`.
 *
 * Useful for clocks and timers. It re-renders once per interval, not once per
 * frame, and stops when `enabled` is `false`.
 *
 * @example
 * ```tsx
 * const now = useNow(1000);
 * return <time>{now.toLocaleTimeString()}</time>;
 * ```
 */
export const useNow = (intervalMs: number = DEFAULT_NOW_INTERVAL, enabled: boolean = true): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return undefined;
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, enabled]);

  return now;
};
