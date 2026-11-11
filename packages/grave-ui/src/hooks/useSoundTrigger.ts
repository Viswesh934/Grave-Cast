/**
 * useSoundTrigger - Fire an action when the microphone hears a kind of sound
 * @module hooks/useSoundTrigger
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SoundKind } from '../audio';
import type { OccultMicReturn } from './useOccultMic';

/**
 * Options for {@link useSoundTrigger}.
 */
export interface SoundTriggerOptions {
  /** Which sound or sounds set it off. @default 'blow' */
  on?: SoundKind | readonly SoundKind[];
  /**
   * How long the sound must last without a break, in milliseconds. A longer
   * hold turns a brief puff into a deliberate blow. @default 0
   */
  holdMs?: number;
  /**
   * Reset automatically this many milliseconds after triggering. Leave unset
   * to stay triggered until `reset()` is called.
   */
  resetAfterMs?: number | null;
  /** Called once each time it triggers. */
  onTrigger?: (kind: SoundKind) => void;
}

/**
 * Return value of {@link useSoundTrigger}.
 */
export interface SoundTriggerReturn {
  /** `true` once the matching sound has been held long enough. */
  triggered: boolean;
  /** `true` while a matching sound is being held but has not triggered yet. */
  holding: boolean;
  /** Which sound set it off, or `null`. */
  kind: SoundKind | null;
  /** Clears the trigger so it can fire again. */
  reset: () => void;
}

/**
 * Turns "the microphone heard X" into a single, steady "this happened".
 *
 * Pass the object from {@link useOccultMic}. The trigger fires once when a
 * matching sound has been held for `holdMs` without a break, then stays
 * triggered until `reset()` (or `resetAfterMs`).
 *
 * @example Blow out a candle
 * ```tsx
 * const mic = useOccultMic();
 * const { triggered, reset } = useSoundTrigger(mic, { on: 'blow', holdMs: 500 });
 *
 * return <Candle lit={!triggered} onRelight={reset} />;
 * ```
 */
export const useSoundTrigger = (
  mic: Pick<OccultMicReturn, 'sound'>,
  options: SoundTriggerOptions = {}
): SoundTriggerReturn => {
  const { on = 'blow', holdMs = 0, resetAfterMs = null, onTrigger } = options;

  const [triggered, setTriggered] = useState(false);
  const [holding, setHolding] = useState(false);
  const [kind, setKind] = useState<SoundKind | null>(null);

  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const kinds: readonly SoundKind[] = typeof on === 'string' ? [on] : on;
  const kindsKey = kinds.join(',');
  const { sound } = mic;

  const reset = useCallback(() => {
    setTriggered(false);
    setHolding(false);
    setKind(null);
  }, []);

  useEffect(() => {
    if (triggered || !sound || !kindsKey.split(',').includes(sound)) {
      setHolding(false);
      return undefined;
    }

    setHolding(true);
    const timer = window.setTimeout(() => {
      setHolding(false);
      setTriggered(true);
      setKind(sound);
      onTriggerRef.current?.(sound);
    }, holdMs);

    return () => window.clearTimeout(timer);
  }, [sound, kindsKey, holdMs, triggered]);

  useEffect(() => {
    if (!triggered || resetAfterMs === null) return undefined;
    const timer = window.setTimeout(reset, resetAfterMs);
    return () => window.clearTimeout(timer);
  }, [triggered, resetAfterMs, reset]);

  return { triggered, holding, kind, reset };
};
