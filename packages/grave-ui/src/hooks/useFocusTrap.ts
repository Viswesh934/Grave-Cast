/**
 * useFocusTrap - Keep Tab inside a dialog while it is open
 * @module hooks/useFocusTrap
 */
import { useCallback, type KeyboardEvent, type RefObject } from 'react';

/** Everything Tab can reach inside a trapped container. */
export const FOCUS_TRAP_SELECTOR =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * Returns a keydown handler for a dialog's container. Tab and Shift+Tab wrap
 * around the focusable elements inside it instead of leaving it, so keyboard
 * users stay in the dialog until they close it. The handler returns `true` when
 * it handled the key, so the caller can stop there.
 *
 * @example
 * ```tsx
 * const box = useRef<HTMLDivElement>(null);
 * const trapTab = useFocusTrap(box);
 * <div ref={box} role="dialog" aria-modal="true" onKeyDown={(event) => { if (trapTab(event)) return; }} />
 * ```
 */
export const useFocusTrap = (container: RefObject<HTMLElement | null>) =>
  useCallback(
    (event: KeyboardEvent<HTMLElement>): boolean => {
      if (event.key !== 'Tab') return false;
      const box = container.current;
      const items = Array.from(box?.querySelectorAll<HTMLElement>(FOCUS_TRAP_SELECTOR) ?? []);
      if (!box || items.length === 0) return true;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === box)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
      return true;
    },
    [container]
  );
