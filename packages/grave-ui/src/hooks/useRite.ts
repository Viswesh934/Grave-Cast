/**
 * useRite - The shared start/stop lifecycle behind every Grimoire rite
 * @module hooks/useRite
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { checkCapability, type Capability, type CapabilityReason } from '../grimoire/core/capability';
import {
  classifyRiteError,
  resolveRiteMessages,
  type RiteFailure,
  type RiteMessages,
  type RiteStatus,
} from '../grimoire/core/status';
import { useCapability } from './useCapability';
import { useLatest } from './useLatest';
import { usePermissionState, type RitePermission } from './usePermissionState';

/**
 * Handed to a rite's `start`, so it can respond to being stopped and report
 * when its resource ends by itself.
 */
export interface RiteStartContext {
  /**
   * Aborted when the rite is stopped, unmounted, or ends. Pass it to APIs that
   * accept a signal, or listen for `abort` to remove your own listeners.
   */
  signal: AbortSignal;
  /**
   * Call when the resource ended without being asked to, such as the browser
   * releasing a wake lock or a device being unplugged. The rite returns to
   * `idle` and shows `message`, if given. `stop` is not called, because the
   * resource is already gone.
   */
  end: (message?: string) => void;
}

/**
 * Options for {@link useRite}.
 */
export interface RiteOptions<T> {
  /**
   * Acquires the resource, such as a wake lock, a database, or a channel.
   * Runs only when `start()` is called, never on its own. Throw or reject to
   * fail; browser errors are explained automatically.
   */
  start: (context: RiteStartContext) => Promise<T> | T;
  /**
   * Releases the resource. Runs on `stop()`, on unmount, and for results
   * that arrive after the rite was already stopped. Errors here are ignored,
   * since there is nothing left to show them in.
   */
  stop?: (value: T) => void | Promise<void>;
  /** Wording that fits this rite better than the shared messages. */
  messages?: Partial<RiteMessages>;
  /** Called when starting fails (not when it is cancelled). */
  onError?: (failure: RiteFailure, error: unknown) => void;
}

/**
 * Return value of {@link useRite}.
 */
export interface RiteReturn<T> {
  /** Whether this browser and page can run the rite. `false` during server rendering. */
  supported: boolean;
  /** Why it cannot run, or `null`. */
  reason: CapabilityReason | null;
  /** Where the rite stands. `unavailable` whenever it is not supported in the browser. */
  status: RiteStatus;
  /** A plain-language explanation when something went wrong, otherwise `null`. */
  error: string | null;
  /** The running resource, or `null` unless `status` is `active`. */
  value: T | null;
  /** The permission named by the capability, if any. Never asks for it. */
  permission: RitePermission;
  /**
   * Starts the rite. Call it from a click or key press, never on load.
   * Resolves with the resource, or `null` if it could not start or was
   * stopped first. Calling it again while starting shares the same attempt;
   * calling it while active resolves with the running resource.
   */
  start: () => Promise<T | null>;
  /** Stops the rite, releases the resource, and returns to `idle`. */
  stop: () => void;
  /** Clears the error. A failed rite returns to `idle`. */
  clearError: () => void;
}

interface RiteState<T> {
  status: RiteStatus;
  error: string | null;
  value: T | null;
}

const IDLE = { status: 'idle', error: null, value: null } as const;

/**
 * Runs one browser resource through a safe lifecycle: idle, requesting,
 * active, and back, with plain-language errors. Every Grimoire rite is built
 * on it.
 *
 * - Nothing starts until `start()` is called.
 * - Unsupported browsers get `unavailable` and a clear message instead of a
 *   crash, and server rendering is safe.
 * - `stop()`, unmounting, and a second `start()` never leak: a resource that
 *   arrives after the rite was stopped is released at once.
 * - Cancelling (`AbortError`) is not shown as an error.
 *
 * Define the capability at module level so it keeps the same identity.
 *
 * @example
 * ```tsx
 * const wakeLockCapability = defineCapability({
 *   id: 'wake-lock',
 *   label: 'Screen Wake Lock',
 *   secure: true,
 *   detect: () => 'wakeLock' in navigator,
 * });
 *
 * function KeepAwake() {
 *   const vigil = useRite(wakeLockCapability, {
 *     start: async ({ end }) => {
 *       const lock = await navigator.wakeLock.request('screen');
 *       lock.addEventListener('release', () => end('The screen may sleep again.'));
 *       return lock;
 *     },
 *     stop: (lock) => lock.release(),
 *   });
 *
 *   return vigil.status === 'active'
 *     ? <button onClick={vigil.stop}>Let the candle go out</button>
 *     : <button onClick={vigil.start} disabled={!vigil.supported}>Light the candle</button>;
 * }
 * ```
 */
export const useRite = <T,>(capability: Capability, options: RiteOptions<T>): RiteReturn<T> => {
  const optionsRef = useLatest(options);
  const support = useCapability(capability);
  const permission = usePermissionState(support.supported ? capability.permission : null);

  const [state, setState] = useState<RiteState<T>>(IDLE);

  // A box, so a resource that is itself falsy still counts as held.
  const heldRef = useRef<{ value: T } | null>(null);
  const pendingRef = useRef<Promise<T | null> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const attemptRef = useRef(0);
  const mountedRef = useRef(false);

  const runStop = useCallback(
    (value: T) => {
      try {
        const result = optionsRef.current.stop?.(value);
        if (result && typeof (result as Promise<void>).then === 'function') (result as Promise<void>).catch(() => undefined);
      } catch {
        // Releasing failed; the resource is being dropped either way.
      }
    },
    [optionsRef]
  );

  /** Lets go of everything: the held resource, the attempt in progress, and its signal. */
  const release = useCallback(() => {
    attemptRef.current += 1;
    const held = heldRef.current;
    heldRef.current = null;
    pendingRef.current = null;
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (held) runStop(held.value);
  }, [runStop]);

  const stop = useCallback(() => {
    release();
    if (mountedRef.current) setState(IDLE);
  }, [release]);

  const start = useCallback((): Promise<T | null> => {
    if (heldRef.current) return Promise.resolve(heldRef.current.value);
    if (pendingRef.current) return pendingRef.current;

    const messages = resolveRiteMessages(optionsRef.current.messages);
    const check = checkCapability(capability);
    if (!check.supported) {
      if (mountedRef.current && check.reason) setState({ status: 'unavailable', error: messages[check.reason], value: null });
      return Promise.resolve(null);
    }

    attemptRef.current += 1;
    const attempt = attemptRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;
    const isCurrent = () => mountedRef.current && attemptRef.current === attempt;

    const end = (message?: string) => {
      if (!isCurrent() || !heldRef.current) return;
      attemptRef.current += 1;
      heldRef.current = null;
      controllerRef.current = null;
      controller.abort();
      setState({ status: 'idle', error: message ?? null, value: null });
    };

    setState({ status: 'requesting', error: null, value: null });

    const attemptPromise = (async (): Promise<T | null> => {
      try {
        const value = await optionsRef.current.start({ signal: controller.signal, end });
        if (!isCurrent()) {
          // Stopped or unmounted while starting: let go of the late arrival.
          runStop(value);
          return null;
        }
        heldRef.current = { value };
        pendingRef.current = null;
        setState({ status: 'active', error: null, value });
        return value;
      } catch (error) {
        if (!isCurrent()) return null;
        pendingRef.current = null;
        controllerRef.current = null;
        const failure = classifyRiteError(error, messages);
        if (failure.aborted) {
          setState(IDLE);
          return null;
        }
        setState({ status: failure.status, error: failure.message, value: null });
        optionsRef.current.onError?.(failure, error);
        return null;
      }
    })();

    pendingRef.current = attemptPromise;
    return attemptPromise;
  }, [capability, optionsRef, runStop]);

  const clearError = useCallback(() => {
    setState((current) => {
      if (current.error === null) return current;
      const settled = current.status === 'active' || current.status === 'requesting';
      return settled ? { ...current, error: null } : IDLE;
    });
  }, []);

  // A new capability is a different rite: stop the old one.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      release();
    };
  }, [capability, release]);

  const messages = useMemo(() => resolveRiteMessages(options.messages), [options.messages]);
  const blocked = !support.supported && support.reason !== null && support.reason !== 'server';

  return {
    supported: support.supported,
    reason: support.reason,
    status: blocked ? 'unavailable' : state.status,
    error: blocked && support.reason ? messages[support.reason] : state.error,
    value: state.value,
    permission,
    start,
    stop,
    clearError,
  };
};
