/**
 * useVigil - Keep the screen awake, and take it back after a tab switch
 * @module hooks/useVigil
 */

import { useState } from 'react';
import { VIGIL_MESSAGES, wakeLockCapability } from '../grimoire/rites/vigil';
import { useRite, type RiteReturn } from './useRite';

interface WakeLockSentinelLike extends EventTarget {
  readonly released: boolean;
  release: () => Promise<void>;
}

interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

/** The burning candle: lets go of the screen when the Vigil ends. */
export interface VigilHandle {
  release: () => Promise<void>;
}

/**
 * Return value of {@link useVigil}.
 */
export interface VigilReturn extends RiteReturn<VigilHandle> {
  /** When the candle was lit, in milliseconds since 1970, or `null`. */
  litAt: number | null;
  /** How many times the screen was taken back after the tab was hidden. */
  relit: number;
}

/**
 * Keeps the screen from sleeping with the Screen Wake Lock API.
 *
 * Browsers let go of the lock whenever the tab is hidden. The Vigil takes it
 * back as soon as the tab shows again, and only ends (with a message) when
 * the browser lets go while the tab is still showing, such as when the
 * battery runs low.
 *
 * @example
 * ```tsx
 * const vigil = useVigil();
 * <RiteShell {...vigilRite} rite={vigil} />
 * ```
 */
export const useVigil = (): VigilReturn => {
  const [litAt, setLitAt] = useState<number | null>(null);
  const [relit, setRelit] = useState(0);

  const rite = useRite<VigilHandle>(wakeLockCapability, {
    messages: VIGIL_MESSAGES,
    start: async ({ signal, end }) => {
      const wakeLock = (navigator as Navigator & { wakeLock: WakeLockLike }).wakeLock;
      const state = { sentinel: null as WakeLockSentinelLike | null, letGo: false };

      const onRelease = () => {
        // Hidden tabs always lose the lock; it is taken back when they show again.
        if (state.letGo || document.visibilityState === 'hidden') return;
        end(VIGIL_MESSAGES.ended);
      };
      const request = async () => {
        const sentinel = await wakeLock.request('screen');
        sentinel.addEventListener('release', onRelease);
        state.sentinel = sentinel;
      };
      const onVisible = () => {
        if (document.visibilityState !== 'visible' || state.letGo || !state.sentinel?.released) return;
        request()
          .then(() => setRelit((count) => count + 1))
          .catch(() => end(VIGIL_MESSAGES.ended));
      };

      document.addEventListener('visibilitychange', onVisible);
      signal.addEventListener('abort', () => document.removeEventListener('visibilitychange', onVisible));
      await request();
      setLitAt(Date.now());
      setRelit(0);

      return {
        release: async () => {
          state.letGo = true;
          document.removeEventListener('visibilitychange', onVisible);
          if (state.sentinel && !state.sentinel.released) await state.sentinel.release();
        },
      };
    },
    stop: (handle) => handle.release(),
  });

  return { ...rite, litAt: rite.status === 'active' ? litAt : null, relit };
};
