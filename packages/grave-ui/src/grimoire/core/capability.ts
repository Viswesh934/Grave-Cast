/**
 * Capabilities: what a rite needs from the browser, checked safely.
 * @module grimoire/core/capability
 */

/**
 * Why a capability is not available.
 *
 * - `server`: the code is running during server rendering
 * - `insecure`: the API only works on secure (https or localhost) pages
 * - `unsupported`: this browser does not have the API
 */
export type CapabilityReason = 'server' | 'insecure' | 'unsupported';

/**
 * The description of what a rite needs. Write one per rite, at module level.
 */
export interface CapabilitySpec {
  /** Stable id, such as `wake-lock`. */
  id: string;
  /** The browser feature's name, shown to people, such as `Screen Wake Lock`. */
  label: string;
  /**
   * Returns `true` when the browser has what is needed. Runs in the browser
   * only, so it can read `window` and `navigator` freely. If it throws, the
   * capability counts as unsupported.
   */
  detect: () => boolean;
  /** The API only works on secure pages. @default false */
  secure?: boolean;
  /**
   * The Permissions API name to watch, such as `camera` or `notifications`.
   * Lets interfaces show "blocked" before the user even tries.
   */
  permission?: string;
}

/** A capability made with {@link defineCapability}. */
export type Capability = Readonly<CapabilitySpec>;

/**
 * The answer to "can this run here?".
 */
export interface CapabilitySupport {
  supported: boolean;
  /** Why not, or `null` when supported. */
  reason: CapabilityReason | null;
}

/** The answer during server rendering. */
export const SERVER_SUPPORT: CapabilitySupport = Object.freeze({ supported: false, reason: 'server' });

const SUPPORTED: CapabilitySupport = Object.freeze({ supported: true, reason: null });
const INSECURE: CapabilitySupport = Object.freeze({ supported: false, reason: 'insecure' });
const UNSUPPORTED: CapabilitySupport = Object.freeze({ supported: false, reason: 'unsupported' });

/** `true` in a browser, `false` during server rendering and in workers without a page. */
export const isBrowser = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Describes a browser feature a rite needs. Identity at runtime; it exists
 * for type checking and to freeze the description.
 *
 * @example
 * ```ts
 * export const wakeLockCapability = defineCapability({
 *   id: 'wake-lock',
 *   label: 'Screen Wake Lock',
 *   secure: true,
 *   detect: () => 'wakeLock' in navigator,
 * });
 * ```
 */
export const defineCapability = (spec: CapabilitySpec): Capability => Object.freeze({ ...spec });

const cache = new WeakMap<Capability, CapabilitySupport>();

/**
 * Checks whether a capability can run here.
 *
 * Browser support does not change while a page is open, so the answer is
 * worked out once per capability and reused. The same object is returned
 * each time, which keeps React renders stable. During server rendering the
 * answer is always {@link SERVER_SUPPORT} and is not stored.
 */
export const checkCapability = (capability: Capability): CapabilitySupport => {
  if (!isBrowser()) return SERVER_SUPPORT;
  const known = cache.get(capability);
  if (known) return known;

  let support = SUPPORTED;
  if (capability.secure && window.isSecureContext === false) {
    support = INSECURE;
  } else {
    try {
      if (!capability.detect()) support = UNSUPPORTED;
    } catch {
      support = UNSUPPORTED;
    }
  }
  cache.set(capability, support);
  return support;
};
