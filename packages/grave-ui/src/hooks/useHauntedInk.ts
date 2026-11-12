/**
 * useHauntedInk - Find words on the page and make them glow
 * @module hooks/useHauntedInk
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { findText } from '../grimoire/dom/text';
import { inkMatches, type InkColor, type InkHandle, type InkMode } from '../grimoire/rites/hauntedInk';

/**
 * Options for {@link useHauntedInk}.
 */
export interface HauntedInkOptions {
  /** Where to look, or `null` to ink nothing. */
  root: Element | null;
  /** The words to find. Empty finds nothing. */
  query: string;
  /** Ink while `true`. @default true */
  enabled?: boolean;
  /** @default 'ectoplasm' */
  ink?: InkColor;
  /** @default false */
  caseSensitive?: boolean;
  /** @default false */
  wholeWord?: boolean;
  /** Most matches inked. @default FIND_TEXT_LIMIT */
  limit?: number;
}

/**
 * Return value of {@link useHauntedInk}.
 */
export interface HauntedInkReturn {
  /** How many matches are inked. */
  count: number;
  /** The current match, from 0, or -1 before stepping through them. */
  index: number;
  /** How the ink is applied, or `null` when nothing is inked. */
  mode: InkMode | null;
  /** Moves to the next match, wrapping around, and scrolls to it. */
  next: () => void;
  /** Moves to the previous match, wrapping around, and scrolls to it. */
  previous: () => void;
  /** Moves to one match by its number, from 0. */
  go: (index: number) => void;
}

const EMPTY = { count: 0, index: -1, mode: null } as const;

/**
 * Inks every match of `query` under `root` and lets people step through them.
 * The ink is removed whenever the search changes and when the component
 * unmounts, so the page is always left as it was.
 *
 * @example
 * ```tsx
 * const ink = useHauntedInk({ root: article, query, ink: 'blood' });
 * <p>{ink.count} found</p>
 * <button onClick={ink.next}>Next</button>
 * ```
 */
export const useHauntedInk = (options: HauntedInkOptions): HauntedInkReturn => {
  const { root, query, enabled = true, ink = 'ectoplasm', caseSensitive = false, wholeWord = false, limit } = options;
  const handleRef = useRef<InkHandle | null>(null);
  const indexRef = useRef(-1);
  const [state, setState] = useState<{ count: number; index: number; mode: InkMode | null }>(EMPTY);

  useEffect(() => {
    indexRef.current = -1;
    if (!enabled || !root || query.trim() === '') {
      setState(EMPTY);
      return undefined;
    }
    const handle = inkMatches(findText(root, query, { caseSensitive, wholeWord, limit }), { ink });
    handleRef.current = handle;
    setState({ count: handle.count, index: -1, mode: handle.count > 0 ? handle.mode : null });
    return () => {
      handle.clear();
      if (handleRef.current === handle) handleRef.current = null;
    };
  }, [root, query, enabled, ink, caseSensitive, wholeWord, limit]);

  const go = useCallback((index: number) => {
    const handle = handleRef.current;
    if (!handle || handle.count === 0) return;
    const wrapped = ((index % handle.count) + handle.count) % handle.count;
    const target = handle.focus(wrapped);
    const element = target && 'startContainer' in target ? target.startContainer.parentElement : target;
    element?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    indexRef.current = wrapped;
    setState((current) => ({ ...current, index: wrapped }));
  }, []);

  const next = useCallback(() => go(indexRef.current + 1), [go]);
  const previous = useCallback(() => go(indexRef.current < 0 ? -1 : indexRef.current - 1), [go]);

  return { ...state, next, previous, go };
};
