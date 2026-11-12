/**
 * usePageVisible - Whether the tab is showing
 * @module hooks/usePageVisible
 */

import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void): (() => void) => {
  if (typeof document === 'undefined') return () => undefined;
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
};

/** `true` unless the tab is hidden (minimized, behind another tab, or the screen is off). `true` on the server. */
export const isPageVisible = (): boolean => typeof document === 'undefined' || document.visibilityState !== 'hidden';

const getServerSnapshot = (): boolean => true;

/**
 * `true` while the tab is showing, `false` while it is hidden. Use it to
 * pause timers and measurements, take back a wake lock, or send queued
 * events before the tab may be closed.
 *
 * @example
 * ```tsx
 * const visible = usePageVisible();
 * useInterval(tick, visible ? 1000 : null);
 * ```
 */
export const usePageVisible = (): boolean => useSyncExternalStore(subscribe, isPageVisible, getServerSnapshot);
