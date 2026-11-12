/**
 * Marking Grimoire's own elements, so inspection rites never inspect themselves.
 * @module grimoire/dom/marker
 */

import { ANNOUNCER_ATTRIBUTE } from '../../hooks/useAriaAnnounce';

/**
 * Attribute on everything Grimoire draws over the page (highlights, labels,
 * panels). Elements with it, and everything inside them, are skipped by
 * every DOM helper here.
 */
export const GRIMOIRE_IGNORE_ATTRIBUTE = 'data-grimoire-ignore';

/** Spread onto an element to hide it from Grimoire's inspection. */
export const grimoireIgnoreProps = { [GRIMOIRE_IGNORE_ATTRIBUTE]: '' } as const;

const IGNORED_SELECTOR = `[${GRIMOIRE_IGNORE_ATTRIBUTE}], [${ANNOUNCER_ATTRIBUTE}]`;

/**
 * `true` for Grimoire's own overlays and the shared screen reader announcers,
 * and for anything inside them. Text nodes are judged by their parent.
 */
export const isGrimoireNode = (node: Node | null): boolean => {
  const element = node && (node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement);
  return Boolean(element?.closest(IGNORED_SELECTOR));
};
