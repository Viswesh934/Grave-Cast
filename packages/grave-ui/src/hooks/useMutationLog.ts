/**
 * useMutationLog - A plain-language log of every change to part of the page
 * @module hooks/useMutationLog
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { isGrimoireNode } from '../grimoire/dom/marker';
import { describeMutation, type MutationSummary } from '../grimoire/rites/poltergeist';

/** Changes kept by default. */
export const MUTATION_LOG_LIMIT = 60;

/**
 * Options for {@link useMutationLog}.
 */
export interface MutationLogOptions {
  /** What to watch, or `null` to watch nothing. */
  root: Node | null;
  /** Watch while `true`. @default true */
  enabled?: boolean;
  /** Changes kept; older ones are forgotten. @default MUTATION_LOG_LIMIT */
  limit?: number;
}

/** One logged change. */
export interface MutationLogEntry extends MutationSummary {
  /** Stable key. */
  id: number;
  /** When it was seen, in ms since 1970. */
  at: number;
}

/**
 * Return value of {@link useMutationLog}.
 */
export interface MutationLogReturn {
  /** Changes, newest first. */
  entries: MutationLogEntry[];
  /** How many changes were seen in total, including forgotten ones. */
  total: number;
  /** Empties the log. */
  clear: () => void;
}

/**
 * Watches `root` with a MutationObserver and turns every change into a short
 * sentence: what was added, removed, rewritten, or restyled. Grimoire's own
 * panels and markers are skipped.
 *
 * @example
 * ```tsx
 * const log = useMutationLog({ root: article });
 * <RiteLog label="Changes" entries={log.entries.map((e) => ({ id: e.id, text: e.label, detail: e.detail }))} />
 * ```
 */
export const useMutationLog = (options: MutationLogOptions): MutationLogReturn => {
  const { root, enabled = true, limit = MUTATION_LOG_LIMIT } = options;
  const [entries, setEntries] = useState<MutationLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const nextIdRef = useRef(0);

  useEffect(() => {
    if (!enabled || !root || typeof MutationObserver !== 'function') return undefined;
    const observer = new MutationObserver((records) => {
      const at = Date.now();
      const fresh: MutationLogEntry[] = [];
      for (const record of records) {
        if (isGrimoireNode(record.target)) continue;
        for (const summary of describeMutation(record)) {
          nextIdRef.current += 1;
          fresh.push({ ...summary, id: nextIdRef.current, at });
        }
      }
      if (fresh.length === 0) return;
      setTotal((count) => count + fresh.length);
      setEntries((previous) => [...fresh.reverse(), ...previous].slice(0, limit));
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true,
      attributes: true,
      attributeOldValue: true,
    });
    return () => observer.disconnect();
  }, [root, enabled, limit]);

  const clear = useCallback(() => {
    setEntries([]);
    setTotal(0);
  }, []);

  return { entries, total, clear };
};
