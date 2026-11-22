/**
 * useBestScore - A game's best score, kept in this browser
 * @module hooks/useBestScore
 */
import { useCallback, useRef, useState } from 'react';

const read = (key: string | undefined): number => {
  if (!key || typeof localStorage === 'undefined') return 0;
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
};

export interface BestScore {
  /** The best score so far, or 0 before the first one. */
  best: number;
  /**
   * Offers a finished round's score. Returns the best score before it, and
   * whether this one beat it (it is kept when it does).
   */
  offer: (score: number) => { previous: number; record: boolean };
}

/**
 * Remembers the highest score a game has seen. With `storageKey` it lasts in
 * this browser (localStorage); without one it lasts until the component unmounts.
 * Storage that is full or blocked is ignored: the score is still kept in memory.
 *
 * @example
 * ```tsx
 * const { best, offer } = useBestScore('my-game-best');
 * const { record } = offer(score);
 * ```
 */
export const useBestScore = (storageKey?: string): BestScore => {
  const [best, setBest] = useState(() => read(storageKey));
  const bestRef = useRef(best);

  const offer = useCallback(
    (score: number) => {
      const previous = bestRef.current;
      const record = score > previous;
      if (record) {
        bestRef.current = score;
        setBest(score);
        if (storageKey && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(storageKey, String(score));
          } catch {
            // Storage full or blocked: the best score is kept until the page closes.
          }
        }
      }
      return { previous, record };
    },
    [storageKey]
  );

  return { best, offer };
};
