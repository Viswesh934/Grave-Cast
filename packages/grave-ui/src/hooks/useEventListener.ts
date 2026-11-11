/**
 * useEventListener - Attach a DOM event listener that cleans up after itself
 * @module hooks/useEventListener
 */

import { useEffect, type RefObject } from 'react';
import { useLatest } from './useLatest';

/**
 * Options for {@link useEventListener}.
 */
export interface EventListenerHookOptions {
  /** Listen during the capture phase, before the event reaches its target. @default false */
  capture?: boolean;
  /** Promise not to call `preventDefault`, which keeps scrolling smooth. @default the browser's choice */
  passive?: boolean;
  /** Remove the listener after the first event. @default false */
  once?: boolean;
  /** Turn the listener off without unmounting. @default true */
  enabled?: boolean;
}

/**
 * Where to listen: `'window'` or `'document'` (safe during server rendering),
 * any event target, or a ref to one.
 */
export type EventListenerTarget =
  | 'window'
  | 'document'
  | EventTarget
  | RefObject<EventTarget | null>
  | null
  | undefined;

/** Turns a target description into the real target, or `null` if there is none yet. */
const resolveTarget = (target: EventListenerTarget): EventTarget | null => {
  if (target === 'window') return typeof window === 'undefined' ? null : window;
  if (target === 'document') return typeof document === 'undefined' ? null : document;
  if (!target) return null;
  if ('current' in target) return target.current;
  return target;
};

/**
 * Listens for an event and removes the listener on unmount or when anything
 * it depends on changes.
 *
 * - The handler can change on every render without re-attaching.
 * - `'window'` and `'document'` are resolved in the browser only, so the hook
 *   is safe during server rendering.
 * - A ref is read when the listener is attached. If the element appears later
 *   (for example, it renders conditionally), pass the element itself instead,
 *   such as one kept in state by a callback ref.
 *
 * @example
 * ```tsx
 * useEventListener('document', 'keydown', (event) => {
 *   if (event.key === 'Escape') close();
 * });
 *
 * const panelRef = useRef<HTMLDivElement>(null);
 * useEventListener(panelRef, 'pointermove', (event) => track(event.clientX), { passive: true });
 * ```
 */
export function useEventListener<K extends keyof WindowEventMap>(
  target: 'window' | Window | null | undefined,
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: EventListenerHookOptions
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  target: 'document' | Document | null | undefined,
  type: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: EventListenerHookOptions
): void;
export function useEventListener<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | RefObject<HTMLElement | null> | null | undefined,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: EventListenerHookOptions
): void;
export function useEventListener(
  target: EventListenerTarget,
  type: string,
  handler: (event: Event) => void,
  options?: EventListenerHookOptions
): void;
export function useEventListener(
  target: EventListenerTarget,
  type: string,
  handler: (event: Event) => void,
  options: EventListenerHookOptions = {}
): void {
  const { capture = false, passive, once = false, enabled = true } = options;
  const handlerRef = useLatest(handler);

  useEffect(() => {
    if (!enabled) return undefined;
    const node = resolveTarget(target);
    if (!node) return undefined;

    const listener = (event: Event) => handlerRef.current(event);
    const listenOptions: AddEventListenerOptions = passive === undefined ? { capture, once } : { capture, once, passive };
    node.addEventListener(type, listener, listenOptions);
    return () => node.removeEventListener(type, listener, { capture });
  }, [target, type, capture, passive, once, enabled, handlerRef]);
}
