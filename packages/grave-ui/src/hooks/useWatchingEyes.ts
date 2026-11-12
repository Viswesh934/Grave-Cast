/**
 * useWatchingEyes - How long each part of the page has been on screen
 * @module hooks/useWatchingEyes
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { shortSelector } from '../grimoire/dom/selector';
import { WATCHED_SELECTOR, WATCH_THRESHOLD, WATCH_TICK_MS, findWatchable } from '../grimoire/rites/watchingEyes';

/** Characters of an element's text shown next to its name. */
const SNIPPET_LENGTH = 32;

/**
 * Options for {@link useWatchingEyes}.
 */
export interface WatchingEyesOptions {
  /** Where to watch, or `null` to watch nothing. */
  root: Element | null;
  /** Watch while `true`. @default true */
  enabled?: boolean;
  /** Which elements to watch. @default WATCHED_SELECTOR */
  selector?: string;
  /** How much of an element must show to count, from 0 to 1. @default WATCH_THRESHOLD */
  threshold?: number;
}

/** One watched element. */
export interface WatchedElement {
  element: Element;
  /** Its name and the start of its text, such as `h3.title “Fresh coffee”`. */
  label: string;
  /** Time spent on screen, in ms, while the tab was showing. */
  dwellMs: number;
  /** Whether it is on screen now. */
  visible: boolean;
}

/**
 * Return value of {@link useWatchingEyes}.
 */
export interface WatchingEyesReturn {
  /** Every watched element, longest looked at first. */
  watched: WatchedElement[];
  /** How many are on screen now. */
  seenNow: number;
  /** The longest time any one element has been on screen, in ms. */
  longestMs: number;
  /** Forgets every time on screen and starts counting again. */
  reset: () => void;
}

interface Tally {
  dwellMs: number;
  visibleSince: number | null;
}

const describe = (element: Element): string => {
  const text = (element.textContent ?? element.getAttribute('aria-label') ?? '').replace(/\s+/g, ' ').trim();
  const snippet = text.length > SNIPPET_LENGTH ? `${text.slice(0, SNIPPET_LENGTH - 1)}…` : text;
  return snippet ? `${shortSelector(element)} “${snippet}”` : shortSelector(element);
};

/**
 * Watches elements under `root` with an IntersectionObserver and adds up how
 * long each one is on screen. Time only counts while the tab is showing.
 * Nothing is stored or sent anywhere.
 *
 * @example
 * ```tsx
 * const eyes = useWatchingEyes({ root: article });
 * <p>Read most: {eyes.watched[0]?.label}</p>
 * ```
 */
export const useWatchingEyes = (options: WatchingEyesOptions): WatchingEyesReturn => {
  const { root, enabled = true, selector = WATCHED_SELECTOR, threshold = WATCH_THRESHOLD } = options;
  const talliesRef = useRef(new Map<Element, Tally>());
  const [snapshot, setSnapshot] = useState<WatchedElement[]>([]);

  const publish = useCallback(() => {
    const now = performance.now();
    const showing = typeof document === 'undefined' || document.visibilityState !== 'hidden';
    const list: WatchedElement[] = [];
    talliesRef.current.forEach((tally, element) => {
      if (tally.visibleSince !== null) {
        if (showing) tally.dwellMs += now - tally.visibleSince;
        tally.visibleSince = now;
      }
      list.push({ element, label: describe(element), dwellMs: tally.dwellMs, visible: tally.visibleSince !== null });
    });
    setSnapshot(list.sort((a, b) => b.dwellMs - a.dwellMs));
  }, []);

  useEffect(() => {
    const tallies = talliesRef.current;
    tallies.clear();
    if (!enabled || !root || typeof IntersectionObserver !== 'function') {
      setSnapshot([]);
      return undefined;
    }
    const elements = findWatchable(root, selector);
    elements.forEach((element) => tallies.set(element, { dwellMs: 0, visibleSince: null }));
    const observer = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        for (const entry of entries) {
          const tally = tallies.get(entry.target);
          if (!tally) continue;
          const visible = entry.isIntersecting && entry.intersectionRatio >= threshold;
          if (visible && tally.visibleSince === null) tally.visibleSince = now;
          if (!visible && tally.visibleSince !== null) {
            if (document.visibilityState !== 'hidden') tally.dwellMs += now - tally.visibleSince;
            tally.visibleSince = null;
          }
        }
        publish();
      },
      { threshold: [0, threshold, 1] }
    );
    elements.forEach((element) => observer.observe(element));
    publish();
    const timer = setInterval(publish, WATCH_TICK_MS);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      tallies.clear();
    };
  }, [root, enabled, selector, threshold, publish]);

  const reset = useCallback(() => {
    const now = performance.now();
    talliesRef.current.forEach((tally) => {
      tally.dwellMs = 0;
      if (tally.visibleSince !== null) tally.visibleSince = now;
    });
    publish();
  }, [publish]);

  return {
    watched: snapshot,
    seenNow: snapshot.filter((item) => item.visible).length,
    longestMs: snapshot[0]?.dwellMs ?? 0,
    reset,
  };
};
