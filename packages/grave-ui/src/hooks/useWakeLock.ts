import { useEffect, useState } from 'react';

/** What {@link useWakeLock} reports. */
export interface WakeLockState {
  /** Whether this browser can keep the screen on. */
  supported: boolean;
  /** Whether the screen is being kept on right now. */
  held: boolean;
}

const wakeLockSupported = (): boolean => typeof navigator !== 'undefined' && 'wakeLock' in navigator;

/**
 * Keeps the screen on while `active` is true, such as while a tool is running.
 * The browser drops the lock when the page is hidden; this takes it again when
 * the page comes back.
 *
 * @example
 * const { held } = useWakeLock(running)
 */
export const useWakeLock = (active: boolean): WakeLockState => {
  const [held, setHeld] = useState(false);
  const supported = wakeLockSupported();

  useEffect(() => {
    if (!active || !supported) return;
    let sentinel: WakeLockSentinel | null = null;
    let live = true;
    const take = async () => {
      if (document.visibilityState !== 'visible' || sentinel) return;
      try {
        const next = await navigator.wakeLock.request('screen');
        if (!live) {
          void next.release();
          return;
        }
        sentinel = next;
        setHeld(true);
        next.addEventListener('release', () => {
          sentinel = null;
          if (live) setHeld(false);
        });
      } catch {
        if (live) setHeld(false);
      }
    };
    const onVisible = () => void take();
    void take();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      live = false;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
      setHeld(false);
    };
  }, [active, supported]);

  return { supported, held: active && held };
};
