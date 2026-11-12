/**
 * The Watching Eyes: notices what is on screen, and for how long.
 * @module grimoire/rites/watchingEyes
 */

import { defineCapability } from '../core/capability';
import { defineRite } from '../core/rite';
import { isGrimoireNode } from '../dom/marker';

/** Knowing what is on screen. */
export const watchingEyesCapability = defineCapability({
  id: 'watching-eyes',
  label: 'IntersectionObserver',
  detect: () => typeof IntersectionObserver === 'function',
});

export const watchingEyesRite = defineRite({
  id: 'watching-eyes',
  name: 'Watching Eyes',
  tagline: 'Notices which parts of the page are on screen, and for how long, and shows it as heat.',
  sigil: 'eyes',
  accent: 'ectoplasm',
  family: 'watching',
  support: { chromium: 'full', firefox: 'full', safari: 'full' },
  capability: watchingEyesCapability,
});

/** What the eyes watch unless told otherwise. */
export const WATCHED_SELECTOR = 'h1, h2, h3, h4, p, li, img, figure, form, button, [role="img"]';
/** How much of an element must show before it counts as seen, from 0 to 1. */
export const WATCH_THRESHOLD = 0.5;
/** How often the time on screen is added up, in ms. */
export const WATCH_TICK_MS = 250;
/** Most elements watched, to stay quick on long pages. */
export const WATCH_LIMIT = 200;

/** The elements under `root` worth watching, skipping Grimoire's own. */
export const findWatchable = (root: Element, selector: string = WATCHED_SELECTOR, limit: number = WATCH_LIMIT): Element[] =>
  [...root.querySelectorAll(selector)].filter((element) => !isGrimoireNode(element)).slice(0, limit);

/**
 * How warm an element looks in the heat view, from 0 to 1, given its time on
 * screen and the longest time of any element. Uses a square root so short
 * looks still show.
 */
export const heatOf = (dwellMs: number, longestMs: number): number => (longestMs <= 0 ? 0 : Math.sqrt(Math.min(1, dwellMs / longestMs)));
