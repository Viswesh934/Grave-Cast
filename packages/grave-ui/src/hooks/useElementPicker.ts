/**
 * useElementPicker - Point at and choose elements on the page
 * @module hooks/useElementPicker
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { elementAt } from '../grimoire/dom/describe';
import { isGrimoireNode } from '../grimoire/dom/marker';
import { useEventListener } from './useEventListener';
import { useLatest } from './useLatest';

/** Ways to move the picked element through the page structure. */
export type PickerMove = 'parent' | 'child' | 'next' | 'previous';

/**
 * Options for {@link useElementPicker}.
 */
export interface ElementPickerOptions {
  /**
   * Only elements inside this one can be pointed at and picked. The root
   * itself is not pickable. @default the whole document
   */
  root?: RefObject<Element | null> | Element | null;
  /** Listen for the pointer and clicks. @default true */
  enabled?: boolean;
  /** Called whenever the picked element changes. */
  onPick?: (element: Element | null) => void;
  /** Called when Escape is pressed with nothing picked, so the caller can stop picking. */
  onCancel?: () => void;
}

/**
 * Return value of {@link useElementPicker}.
 */
export interface ElementPickerReturn {
  /** The element under the pointer, or `null`. */
  hovered: Element | null;
  /** The chosen element, or `null`. */
  picked: Element | null;
  /** Chooses an element (or clears the choice with `null`). Elements outside the root are ignored. */
  pick: (element: Element | null) => void;
  /**
   * Moves the choice to the parent, first child, next, or previous element,
   * staying inside the root. Returns the new choice, or `null` if there is
   * nowhere to go (the choice stays where it was).
   */
  move: (direction: PickerMove) => Element | null;
  /** Clears both the hovered and the picked element. */
  clear: () => void;
}

const resolveRoot = (root: ElementPickerOptions['root']): Element | null => {
  if (!root) return typeof document === 'undefined' ? null : document.documentElement;
  return 'current' in root ? root.current : root;
};

/**
 * Lets people point at elements and choose one, the way browser devtools do.
 *
 * - While enabled, a click inside the root picks the element instead of
 *   doing what it normally does (links do not open, buttons do not press).
 *   Keyboard presses on page controls pick them too.
 * - Escape clears the choice; pressed again, it calls `onCancel`.
 * - `move()` walks the page structure, so the picker works without a mouse.
 *   Bind it to buttons or keys in your interface.
 * - Grimoire's own overlays are never pointed at or picked.
 *
 * @example
 * ```tsx
 * const stageRef = useRef<HTMLDivElement>(null);
 * const picker = useElementPicker({ root: stageRef, enabled: inspecting, onCancel: stop });
 * const { description } = useElementBox(picker.picked ?? picker.hovered);
 * ```
 */
export const useElementPicker = (options: ElementPickerOptions = {}): ElementPickerReturn => {
  const { enabled = true } = options;
  const optionsRef = useLatest(options);
  const [hovered, setHovered] = useState<Element | null>(null);
  const [picked, setPicked] = useState<Element | null>(null);
  const pickedRef = useRef<Element | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, frame: 0 });

  /** Whether an element may be pointed at or picked. */
  const allowed = useCallback(
    (element: Element | null): element is Element => {
      if (!element || isGrimoireNode(element)) return false;
      const root = resolveRoot(optionsRef.current.root);
      if (!root) return false;
      return element !== root && root.contains(element);
    },
    [optionsRef]
  );

  const pick = useCallback(
    (element: Element | null) => {
      const next = element && allowed(element) ? element : null;
      if (element && !next) return;
      if (pickedRef.current === next) return;
      pickedRef.current = next;
      setPicked(next);
      optionsRef.current.onPick?.(next);
    },
    [allowed, optionsRef]
  );

  const move = useCallback(
    (direction: PickerMove): Element | null => {
      const from = pickedRef.current;
      if (!from) return null;
      const step = (element: Element | null, advance: (current: Element) => Element | null): Element | null => {
        let current = element;
        while (current && !allowed(current)) current = advance(current);
        return current;
      };
      let target: Element | null = null;
      if (direction === 'parent') target = allowed(from.parentElement) ? from.parentElement : null;
      if (direction === 'child') target = step(from.firstElementChild, (current) => current.nextElementSibling);
      if (direction === 'next') target = step(from.nextElementSibling, (current) => current.nextElementSibling);
      if (direction === 'previous') target = step(from.previousElementSibling, (current) => current.previousElementSibling);
      if (target) pick(target);
      return target;
    },
    [allowed, pick]
  );

  const clear = useCallback(() => {
    setHovered(null);
    pick(null);
  }, [pick]);

  // Pointer moves are read once per frame, and only a change of element re-renders.
  useEventListener(
    'document',
    'pointermove',
    (event) => {
      const pointer = pointerRef.current;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (pointer.frame) return;
      pointer.frame = requestAnimationFrame(() => {
        pointer.frame = 0;
        const element = elementAt(pointer.x, pointer.y);
        setHovered((current) => {
          const next = allowed(element) ? element : null;
          return current === next ? current : next;
        });
      });
    },
    { enabled, passive: true }
  );

  useEventListener(
    'document',
    'pointerout',
    (event) => {
      if (!event.relatedTarget) setHovered(null);
    },
    { enabled, passive: true }
  );

  // Capture runs before the page's own handlers, so clicks never reach them while picking.
  useEventListener(
    'document',
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!allowed(target)) return;
      event.preventDefault();
      event.stopPropagation();
      // A mouse click picks what is under the pointer; a key press picks the focused control.
      const pointed = event.detail > 0 ? elementAt(event.clientX, event.clientY) : null;
      pick(allowed(pointed) ? pointed : target);
    },
    { enabled, capture: true }
  );

  useEventListener(
    'document',
    'keydown',
    (event) => {
      if (event.key !== 'Escape') return;
      if (pickedRef.current) pick(null);
      else optionsRef.current.onCancel?.();
    },
    { enabled }
  );

  // Turning the picker off forgets the hover and any frame still waiting.
  useEffect(() => {
    if (enabled) return undefined;
    setHovered(null);
    return undefined;
  }, [enabled]);
  useEffect(
    () => () => {
      if (pointerRef.current.frame) cancelAnimationFrame(pointerRef.current.frame);
    },
    []
  );

  return { hovered: enabled ? hovered : null, picked, pick, move, clear };
};
