/**
 * useRafLoop - Run a callback on every animation frame
 * @module hooks/useRafLoop
 */

import { useEffect } from 'react';
import { useLatest } from './useLatest';

/**
 * Longest step, in milliseconds, a single frame reports. Browsers pause frames
 * in background tabs, so without a cap the first frame back would jump ahead.
 */
export const RAF_MAX_DELTA_MS = 100;

/**
 * Timing for one frame of {@link useRafLoop}.
 */
export interface RafFrame {
  /** The frame's timestamp from `requestAnimationFrame`, in milliseconds. */
  time: number;
  /** Milliseconds since the previous frame, capped at `maxDeltaMs`. `0` on the first frame. */
  delta: number;
  /** Running total of `delta`: time spent running, not counting pauses. */
  elapsed: number;
}

/**
 * Options for {@link useRafLoop}.
 */
export interface RafLoopOptions {
  /** Run the loop. Set to `false` to pause it. @default true */
  enabled?: boolean;
  /** Longest step a frame may report, in milliseconds. @default RAF_MAX_DELTA_MS */
  maxDeltaMs?: number;
}

/**
 * Calls `callback` once per animation frame while enabled, and stops on
 * unmount. The callback can change on every render without restarting the
 * loop. Does nothing on the server.
 *
 * Keep the callback light and avoid setting React state every frame: write to
 * refs or the DOM, and only set state when something visible changes.
 *
 * @example
 * ```tsx
 * const boxRef = useRef<HTMLDivElement>(null);
 *
 * useRafLoop(({ elapsed }) => {
 *   if (boxRef.current) boxRef.current.style.opacity = String(0.5 + Math.sin(elapsed / 500) / 2);
 * }, { enabled: !reducedMotion });
 * ```
 */
export const useRafLoop = (callback: (frame: RafFrame) => void, options: RafLoopOptions = {}): void => {
  const { enabled = true, maxDeltaMs = RAF_MAX_DELTA_MS } = options;
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (!enabled || typeof requestAnimationFrame === 'undefined') return undefined;

    const clock = { id: 0, last: null as number | null, elapsed: 0 };
    const tick = (time: number) => {
      clock.id = requestAnimationFrame(tick);
      const delta = clock.last === null ? 0 : Math.min(maxDeltaMs, Math.max(0, time - clock.last));
      clock.last = time;
      clock.elapsed += delta;
      callbackRef.current({ time, delta, elapsed: clock.elapsed });
    };

    clock.id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(clock.id);
  }, [enabled, maxDeltaMs, callbackRef]);
};
