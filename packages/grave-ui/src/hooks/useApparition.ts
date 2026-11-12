/**
 * useApparition - Animate changes with View Transitions, or a fade
 * @module hooks/useApparition
 */

import { useCallback, useRef, useState } from 'react';
import { APPARITION_DURATION_MS, summon as summonChange, type ApparitionMode, type ApparitionPreset } from '../grimoire/rites/apparition';

/**
 * Options for {@link useApparition}.
 */
export interface ApparitionOptions {
  /** @default 'fade' */
  preset?: ApparitionPreset;
  /** @default APPARITION_DURATION_MS */
  durationMs?: number;
}

/**
 * Return value of {@link useApparition}.
 */
export interface ApparitionReturn {
  /**
   * Runs `update` and animates how `element` changes. While one change is
   * still moving, the next one happens at once, so quick clicks never queue
   * up. Resolves with how the change was shown.
   */
  summon: (update: () => void | Promise<void>, element: HTMLElement | null) => Promise<ApparitionMode>;
  /** How the latest change was shown, or `null` before the first. */
  lastMode: ApparitionMode | null;
  /** Whether a change is moving now. */
  busy: boolean;
}

/**
 * Animates changes to one element with {@link summon}: View Transitions
 * with the chosen preset, a fade where they are missing, and no motion at
 * all for people who ask for less.
 *
 * @example
 * ```tsx
 * const apparition = useApparition({ preset: 'slide' });
 * <button onClick={() => apparition.summon(() => flushSync(() => setPage(page + 1)), cardRef.current)}>Next</button>
 * ```
 */
export const useApparition = (options: ApparitionOptions = {}): ApparitionReturn => {
  const { preset = 'fade', durationMs = APPARITION_DURATION_MS } = options;
  const [lastMode, setLastMode] = useState<ApparitionMode | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const summon = useCallback(
    async (update: () => void | Promise<void>, element: HTMLElement | null): Promise<ApparitionMode> => {
      if (busyRef.current || !element) {
        await update();
        return 'instant';
      }
      busyRef.current = true;
      setBusy(true);
      try {
        const mode = await summonChange(update, { element, preset, durationMs });
        setLastMode(mode);
        return mode;
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [preset, durationMs]
  );

  return { summon, lastMode, busy };
};
