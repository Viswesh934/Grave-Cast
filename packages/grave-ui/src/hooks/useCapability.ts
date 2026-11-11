/**
 * useCapability - Whether a browser feature can run here
 * @module hooks/useCapability
 */

import { useCallback, useSyncExternalStore } from 'react';
import { SERVER_SUPPORT, checkCapability, type Capability, type CapabilitySupport } from '../grimoire/core/capability';

/** Support never changes while a page is open, so there is nothing to subscribe to. */
const subscribeNever = (): (() => void) => () => undefined;

const getServerSupport = (): CapabilitySupport => SERVER_SUPPORT;

/**
 * Reports whether a capability can run in this browser and page.
 *
 * During server rendering, and while a server-rendered page hydrates, it
 * reports `{ supported: false, reason: 'server' }`, then updates to the real
 * answer. Interfaces stay consistent with the server HTML and never show a
 * "not supported" flash for features that do work.
 *
 * @example
 * ```tsx
 * const { supported, reason } = useCapability(wakeLockCapability);
 * if (!supported && reason !== 'server') return <p>This browser cannot keep the screen on.</p>;
 * ```
 */
export const useCapability = (capability: Capability): CapabilitySupport => {
  const getSupport = useCallback(() => checkCapability(capability), [capability]);
  return useSyncExternalStore(subscribeNever, getSupport, getServerSupport);
};
