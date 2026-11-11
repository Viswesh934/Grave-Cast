/**
 * useTypewriter - Count up the characters of a typing effect
 * @module hooks/useTypewriter
 */

import { useEffect, useRef, useState } from 'react';
import { visibleCharCount } from '../ascii';

/** Default typing speed in characters per second. */
export const DEFAULT_TYPING_SPEED = 240;

/**
 * Options for {@link useTypewriter}.
 */
export interface TypewriterOptions {
  /** Characters per second. @default 240 */
  charsPerSecond?: number;
  /** Turn typing off to show everything at once, for example for reduced motion. @default true */
  enabled?: boolean;
  /** Change this value to start typing again from the beginning. */
  restartKey?: string | number;
  /** Called once, when typing finishes. */
  onDone?: () => void;
}

/**
 * Return value of {@link useTypewriter}.
 */
export interface TypewriterReturn {
  /** How many characters should be showing. */
  count: number;
  /** `true` once everything is showing. */
  done: boolean;
}

/**
 * Counts up to `total` over time, for a typing effect. It does not draw
 * anything itself: pair it with `revealLines` from the ASCII toolkit.
 *
 * Typing restarts when `total` or `restartKey` changes, and shows everything
 * at once when `enabled` is `false`.
 *
 * @example
 * ```tsx
 * const { count } = useTypewriter(countTypeable(lines), { charsPerSecond: 400 });
 * return <pre>{revealLines(lines, count, true).join('\n')}</pre>;
 * ```
 */
export const useTypewriter = (total: number, options: TypewriterOptions = {}): TypewriterReturn => {
  const { charsPerSecond = DEFAULT_TYPING_SPEED, enabled = true, restartKey, onDone } = options;

  const [count, setCount] = useState(enabled ? 0 : total);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!enabled || total <= 0) {
      setCount(total);
      return undefined;
    }

    setCount(0);
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const next = visibleCharCount(total, now - started, charsPerSecond);
      setCount((previous) => (previous === next ? previous : next));
      if (next >= total) {
        onDoneRef.current?.();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, total, charsPerSecond, restartKey]);

  const shown = enabled ? Math.min(count, total) : total;
  return { count: shown, done: shown >= total };
};
