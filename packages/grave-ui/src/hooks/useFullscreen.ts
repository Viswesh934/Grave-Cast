/**
 * useFullscreen - Fill the screen with one element
 * @module hooks/useFullscreen
 */

import { useCallback, useState } from 'react';
import { classifyRiteError } from '../grimoire/core/status';
import { fullscreenCapability } from '../grimoire/rites/vigil';
import { useCapability } from './useCapability';
import { useEventListener } from './useEventListener';

/**
 * Return value of {@link useFullscreen}.
 */
export interface FullscreenReturn {
  /** Whether this browser and page allow fullscreen. */
  supported: boolean;
  /** `true` while anything on the page is fullscreen. */
  active: boolean;
  /** The element filling the screen, or `null`. */
  element: Element | null;
  /** Fills the screen with `target` (the whole page by default). Call it from a click. */
  enter: (target?: Element | null) => Promise<boolean>;
  /** Leaves fullscreen. Escape does the same. */
  exit: () => Promise<void>;
  /** Why entering failed, or `null`. */
  error: string | null;
}

/**
 * Enters and leaves fullscreen, and keeps track of it when people leave with
 * Escape or the browser's own controls.
 *
 * @example
 * ```tsx
 * const ritualRef = useRef<HTMLDivElement>(null);
 * const fullscreen = useFullscreen();
 * <button onClick={() => fullscreen.enter(ritualRef.current)}>Begin the ritual</button>
 * ```
 */
export const useFullscreen = (): FullscreenReturn => {
  const { supported } = useCapability(fullscreenCapability);
  const [element, setElement] = useState<Element | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEventListener('document', 'fullscreenchange', () => setElement(document.fullscreenElement));

  const enter = useCallback(async (target?: Element | null): Promise<boolean> => {
    setError(null);
    try {
      await (target ?? document.documentElement).requestFullscreen();
      return true;
    } catch (caught) {
      setError(classifyRiteError(caught).message);
      return false;
    }
  }, []);

  const exit = useCallback(async () => {
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  return { supported, active: element !== null, element, enter, exit, error };
};
