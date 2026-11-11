/**
 * useAriaAnnounce - Tell screen reader users about changes they cannot see
 * @module hooks/useAriaAnnounce
 */

import { useCallback, useEffect } from 'react';
import { srOnlyStyle } from '../tokens/accessibility';

/**
 * How urgently a message is read.
 *
 * - `polite`: read when the screen reader is idle. Use for most updates.
 * - `assertive`: interrupts. Use only for errors and time-critical news.
 */
export type AnnouncePoliteness = 'polite' | 'assertive';

/**
 * Milliseconds between clearing a region and writing the new message, so a
 * message that repeats word for word is still read again.
 */
export const ANNOUNCE_DELAY_MS = 50;

/** Attribute that marks the shared live regions. Overlays can skip elements with it. */
export const ANNOUNCER_ATTRIBUTE = 'data-grave-announcer';

/**
 * Return value of {@link useAriaAnnounce}.
 */
export interface AriaAnnounceReturn {
  /** Reads `message` aloud to screen reader users. Empty messages are ignored. */
  announce: (message: string, politeness?: AnnouncePoliteness) => void;
  /** Clears anything waiting to be read. */
  clear: () => void;
}

interface LiveRegion {
  node: HTMLElement;
  timer: ReturnType<typeof setTimeout> | null;
}

// One pair of live regions for the whole page, shared by every hook instance.
const regions = new Map<AnnouncePoliteness, LiveRegion>();
let users = 0;

const canAnnounce = (): boolean => typeof document !== 'undefined' && document.body !== null;

/** Finds or creates the live region for a politeness level. */
const getRegion = (politeness: AnnouncePoliteness): LiveRegion => {
  const existing = regions.get(politeness);
  if (existing && existing.node.isConnected) return existing;

  const node = document.createElement('div');
  node.setAttribute(ANNOUNCER_ATTRIBUTE, politeness);
  node.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
  node.setAttribute('aria-live', politeness);
  node.setAttribute('aria-atomic', 'true');
  Object.assign(node.style, srOnlyStyle);
  document.body.appendChild(node);

  const region: LiveRegion = { node, timer: null };
  regions.set(politeness, region);
  return region;
};

const clearRegions = () => {
  regions.forEach((region) => {
    if (region.timer !== null) clearTimeout(region.timer);
    region.timer = null;
    region.node.textContent = '';
  });
};

const removeRegions = () => {
  clearRegions();
  regions.forEach((region) => region.node.remove());
  regions.clear();
};

/**
 * Announces messages through shared, visually hidden live regions.
 *
 * - The regions are added to the page when the first component using this
 *   hook mounts, so they exist before anything is announced (screen readers
 *   can miss messages written into brand-new regions). They are removed when
 *   the last one unmounts.
 * - Every instance shares the same two regions, so the page never fills up
 *   with announcers.
 * - Safe during server rendering: `announce` does nothing there.
 *
 * Prefer visible status text where there is room for it. Use this for changes
 * that are only visual, such as an overlay moving to a new element.
 *
 * @example
 * ```tsx
 * const { announce } = useAriaAnnounce();
 *
 * const save = async () => {
 *   await store.put(item);
 *   announce('Saved.');
 * };
 * ```
 */
export const useAriaAnnounce = (): AriaAnnounceReturn => {
  useEffect(() => {
    if (!canAnnounce()) return undefined;
    users += 1;
    getRegion('polite');
    getRegion('assertive');
    return () => {
      users -= 1;
      if (users === 0) removeRegions();
    };
  }, []);

  const announce = useCallback((message: string, politeness: AnnouncePoliteness = 'polite') => {
    if (!canAnnounce() || message.trim() === '') return;
    const region = getRegion(politeness);
    if (region.timer !== null) clearTimeout(region.timer);
    region.node.textContent = '';
    region.timer = setTimeout(() => {
      region.node.textContent = message;
      region.timer = null;
    }, ANNOUNCE_DELAY_MS);
  }, []);

  const clear = useCallback(() => {
    if (canAnnounce()) clearRegions();
  }, []);

  return { announce, clear };
};
