/**
 * useNecromancer - Freeze, slow, and scrub every animation on the page
 * @module hooks/useNecromancer
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { NECROMANCER_REFRESH_MS, describeAnimation, listAnimations, type AnimationInfo } from '../grimoire/rites/necromancer';

/**
 * Options for {@link useNecromancer}.
 */
export interface NecromancerOptions {
  /** Where to look for animations. @default the whole page */
  root?: Element | null;
  /** Control animations while `true`. Turning it off lets them go as they were. @default true */
  enabled?: boolean;
  /** How often the list is read again, in ms. @default NECROMANCER_REFRESH_MS */
  refreshMs?: number;
}

/**
 * Return value of {@link useNecromancer}.
 */
export interface NecromancerReturn {
  /** The animations found, refreshed while enabled. */
  animations: AnimationInfo[];
  /** The speed multiplier applied to every animation. */
  multiplier: number;
  /** Whether every animation is held still. */
  frozen: boolean;
  /** Pauses every animation. */
  pauseAll: () => void;
  /** Plays every animation that is not finished. */
  playAll: () => void;
  /** Sets every animation to its own speed times `multiplier`. */
  setRate: (multiplier: number) => void;
  /** Pauses everything and moves each animation to `fraction` (0 to 1) of one run. */
  scrub: (fraction: number) => void;
  /** Puts every animation back to the speed and state it had when first seen. */
  restore: () => void;
}

interface Original {
  rate: number;
  running: boolean;
}

/**
 * Takes control of every animation on the page with the Web Animations API:
 * CSS animations, transitions, and script animations alike. Each one's own
 * speed and state are remembered the first time it is seen, and put back
 * when the hook is turned off or unmounts.
 *
 * @example
 * ```tsx
 * const necro = useNecromancer({ root: stage });
 * <button onClick={necro.pauseAll}>Freeze</button>
 * <button onClick={() => necro.setRate(0.25)}>Slow</button>
 * ```
 */
export const useNecromancer = (options: NecromancerOptions = {}): NecromancerReturn => {
  const { root = null, enabled = true, refreshMs = NECROMANCER_REFRESH_MS } = options;
  const [animations, setAnimations] = useState<AnimationInfo[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [frozen, setFrozen] = useState(false);
  const originalsRef = useRef(new Map<Animation, Original>());
  const controlRef = useRef({ multiplier: 1, frozen: false });

  const current = useCallback((): Animation[] => {
    const found = listAnimations(root);
    const { multiplier: rate, frozen: still } = controlRef.current;
    for (const animation of found) {
      if (originalsRef.current.has(animation)) continue;
      originalsRef.current.set(animation, { rate: animation.playbackRate, running: animation.playState === 'running' });
      // Newcomers fall under the same spell.
      if (rate !== 1) animation.playbackRate = animation.playbackRate * rate;
      if (still) animation.pause();
    }
    return found;
  }, [root]);

  const refresh = useCallback(() => setAnimations(current().map(describeAnimation)), [current]);

  const restore = useCallback(() => {
    originalsRef.current.forEach((original, animation) => {
      try {
        animation.playbackRate = original.rate;
        if (original.running && animation.playState !== 'finished') animation.play();
      } catch {
        // The animation was removed from the page; nothing to put back.
      }
    });
    originalsRef.current.clear();
    controlRef.current = { multiplier: 1, frozen: false };
    setMultiplier(1);
    setFrozen(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setAnimations([]);
      return undefined;
    }
    refresh();
    const timer = setInterval(refresh, refreshMs);
    return () => {
      clearInterval(timer);
      restore();
    };
  }, [enabled, refresh, refreshMs, restore]);

  const pauseAll = useCallback(() => {
    controlRef.current.frozen = true;
    setFrozen(true);
    current().forEach((animation) => animation.pause());
    refresh();
  }, [current, refresh]);

  const playAll = useCallback(() => {
    controlRef.current.frozen = false;
    setFrozen(false);
    current().forEach((animation) => {
      if (animation.playState !== 'finished') animation.play();
    });
    refresh();
  }, [current, refresh]);

  const setRate = useCallback(
    (next: number) => {
      controlRef.current.multiplier = next;
      setMultiplier(next);
      current().forEach((animation) => {
        const original = originalsRef.current.get(animation);
        if (original) animation.playbackRate = original.rate * next;
      });
      refresh();
    },
    [current, refresh]
  );

  const scrub = useCallback(
    (fraction: number) => {
      const clamped = Math.min(1, Math.max(0, fraction));
      controlRef.current.frozen = true;
      setFrozen(true);
      current().forEach((animation) => {
        const duration = animation.effect?.getComputedTiming?.().duration;
        animation.pause();
        if (typeof duration === 'number' && Number.isFinite(duration)) animation.currentTime = clamped * duration;
      });
      refresh();
    },
    [current, refresh]
  );

  return { animations, multiplier, frozen, pauseAll, playAll, setRate, scrub, restore };
};
