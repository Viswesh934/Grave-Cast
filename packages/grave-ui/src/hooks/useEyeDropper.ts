/**
 * useEyeDropper - Pick a color from anywhere on the screen
 * @module hooks/useEyeDropper
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { parseColor, type ParsedColor } from '../grimoire/color/parse';
import { classifyRiteError } from '../grimoire/core/status';
import { eyeDropperCapability } from '../grimoire/rites/soulReader';
import { useCapability } from './useCapability';

/** What is said when the browser cannot pick colors. */
export const EYE_DROPPER_MESSAGES = {
  unsupported: 'This browser cannot pick colors from the screen. Chrome and Edge can.',
} as const;

/**
 * Return value of {@link useEyeDropper}.
 */
export interface EyeDropperReturn {
  /** Whether this browser can pick colors from the screen. */
  supported: boolean;
  /** `true` while the picker is open. */
  picking: boolean;
  /** The last color picked, or `null`. */
  color: ParsedColor | null;
  /** Why picking failed, or `null`. Cancelling is not an error. */
  error: string | null;
  /** Opens the picker. Call it from a click. Resolves with the color, or `null` if cancelled. */
  pick: () => Promise<ParsedColor | null>;
  /** Closes the picker if it is open. */
  cancel: () => void;
}

interface EyeDropperLike {
  open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }>;
}

/**
 * Lets people pick any color on the screen, even outside the page, with the
 * browser's EyeDropper. Pressing Escape cancels quietly. Chrome and Edge only;
 * elsewhere `supported` is `false` with a plain message.
 *
 * @example
 * ```tsx
 * const dropper = useEyeDropper();
 * <button onClick={dropper.pick} disabled={!dropper.supported}>Pick a color</button>
 * ```
 */
export const useEyeDropper = (): EyeDropperReturn => {
  const { supported } = useCapability(eyeDropperCapability);
  const [picking, setPicking] = useState(false);
  const [color, setColor] = useState<ParsedColor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const pick = useCallback(async (): Promise<ParsedColor | null> => {
    if (!supported) {
      setError(EYE_DROPPER_MESSAGES.unsupported);
      return null;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setError(null);
    setPicking(true);
    try {
      const Dropper = (window as unknown as { EyeDropper: new () => EyeDropperLike }).EyeDropper;
      const result = await new Dropper().open({ signal: controller.signal });
      const parsed = parseColor(result.sRGBHex);
      if (!controller.signal.aborted) setColor(parsed);
      return parsed;
    } catch (caught) {
      const failure = classifyRiteError(caught);
      if (!failure.aborted && !controller.signal.aborted) setError(failure.message);
      return null;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setPicking(false);
      }
    }
  }, [supported]);

  const cancel = useCallback(() => controllerRef.current?.abort(), []);

  return { supported, picking, color, error, pick, cancel };
};
