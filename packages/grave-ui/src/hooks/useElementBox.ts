/**
 * useElementBox - An element's description that follows it as it moves
 * @module hooks/useElementBox
 */

import { useCallback, useEffect, useState } from 'react';
import { describeElement, type ElementDescription } from '../grimoire/dom/describe';
import { observeRect } from '../grimoire/dom/geometry';

/**
 * Return value of {@link useElementBox}.
 */
export interface ElementBoxReturn {
  /** The element's box model, layout, and colors, or `null` when there is no element. */
  description: ElementDescription | null;
  /** Reads the element again, for changes that do not move it (a new color, new text). */
  refresh: () => void;
}

/**
 * Describes an element with `describeElement` and keeps the description up to
 * date while the element scrolls, moves, or resizes. Updates at most once per
 * animation frame, and only when the element really moved.
 *
 * @example
 * ```tsx
 * const { description } = useElementBox(picked);
 * return description && (
 *   <RiteLayer>
 *     <RiteHighlight rects={description.rects} />
 *   </RiteLayer>
 * );
 * ```
 *
 * @param element - The element to follow, or `null`.
 */
export const useElementBox = (element: Element | null): ElementBoxReturn => {
  const [description, setDescription] = useState<ElementDescription | null>(null);

  const refresh = useCallback(() => {
    setDescription(element && element.isConnected ? describeElement(element) : null);
  }, [element]);

  useEffect(() => {
    if (!element) {
      setDescription(null);
      return undefined;
    }
    return observeRect(element, () => setDescription(element.isConnected ? describeElement(element) : null));
  }, [element]);

  return { description: element ? description : null, refresh };
};
