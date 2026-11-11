/**
 * usePermissionState - Watch a browser permission without asking for it
 * @module hooks/usePermissionState
 */

import { useEffect, useState } from 'react';

/**
 * A permission's state.
 *
 * - `unknown`: not known yet, or this browser cannot report it
 * - `prompt`: the browser will ask the next time it is needed
 * - `granted`: allowed
 * - `denied`: blocked. Asking again will fail until the user changes it in settings.
 */
export type RitePermission = 'unknown' | 'prompt' | 'granted' | 'denied';

/** Turns the browser's answer into a {@link RitePermission}. */
const toRitePermission = (state: string): RitePermission =>
  state === 'granted' || state === 'denied' || state === 'prompt' ? state : 'unknown';

/**
 * Reads and follows a permission through the Permissions API, so an interface
 * can say "blocked" before the user presses anything.
 *
 * - Never asks for the permission. Only the feature itself can do that.
 * - Updates live when the user changes it in the browser's settings.
 * - `unknown` on the server, for `null`, and where the browser cannot report
 *   this permission (support for names such as `camera` differs by browser).
 *
 * @example
 * ```tsx
 * const permission = usePermissionState('notifications');
 * if (permission === 'denied') return <p>Notifications are blocked in your browser settings.</p>;
 * ```
 *
 * @param name - A Permissions API name, such as `camera`, or `null` to skip.
 */
export const usePermissionState = (name: string | null | undefined): RitePermission => {
  const [reading, setReading] = useState<{ name: string; state: RitePermission } | null>(null);

  useEffect(() => {
    if (!name || typeof navigator === 'undefined' || typeof navigator.permissions?.query !== 'function') return undefined;

    let cancelled = false;
    let status: PermissionStatus | null = null;
    const onChange = () => {
      if (!cancelled && status) setReading({ name, state: toRitePermission(status.state) });
    };

    navigator.permissions
      .query({ name } as PermissionDescriptor)
      .then((result) => {
        if (cancelled) return;
        status = result;
        setReading({ name, state: toRitePermission(result.state) });
        result.addEventListener('change', onChange);
      })
      // Browsers reject names they do not know. That simply means "unknown".
      .catch(() => undefined);

    return () => {
      cancelled = true;
      status?.removeEventListener('change', onChange);
    };
  }, [name]);

  return reading && reading.name === name ? reading.state : 'unknown';
};
