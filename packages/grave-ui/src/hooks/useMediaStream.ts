/**
 * useMediaStream - Camera and microphone access that cleans up after itself
 * @module hooks/useMediaStream
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Where a media request stands.
 *
 * - `idle`: nothing requested, or stopped
 * - `requesting`: waiting for the browser permission prompt
 * - `active`: the stream is live
 * - `denied`: the user or browser refused permission
 * - `unavailable`: no device, or the browser cannot do this here
 * - `error`: something else went wrong, such as the device being busy
 */
export type MediaStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error';

/**
 * Options for {@link useMediaStream}.
 */
export interface MediaStreamOptions {
  /** Ask for a camera. Pass constraints to pick a size or facing mode. @default false */
  video?: boolean | MediaTrackConstraints;
  /** Ask for a microphone. Pass constraints to tune processing. @default false */
  audio?: boolean | MediaTrackConstraints;
}

/**
 * Return value of {@link useMediaStream}.
 */
export interface MediaStreamReturn {
  /** The live stream, or `null` until `start` succeeds. */
  stream: MediaStream | null;
  /** Current status. */
  status: MediaStatus;
  /** A readable explanation when something went wrong, otherwise `null`. */
  error: string | null;
  /**
   * Asks for access. Call this from a click, never on load. Resolves with the
   * stream, or `null` if access was refused or is not possible.
   */
  start: () => Promise<MediaStream | null>;
  /** Releases the camera or microphone and returns to `idle`. */
  stop: () => void;
}

/** Explanations shown for each failure, kept in one place for consistent wording. */
export const MEDIA_MESSAGES = {
  unsupported: 'This browser cannot access a camera or microphone here. It needs a secure (https) page.',
  nothingRequested: 'Ask for a camera or a microphone before starting.',
  denied: 'Permission was denied. Allow access in your browser settings and try again.',
  missing: 'No matching camera or microphone was found.',
  busy: 'The device is busy or could not be read. Close other apps using it and try again.',
  unknown: 'Something went wrong while opening the device.',
  disconnected: 'The device was disconnected.',
} as const;

/**
 * Whether this browser and page can ask for camera or microphone access.
 * `false` on the server and on insecure pages.
 */
export const isMediaSupported = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function';

/**
 * Turns a `getUserMedia` failure into a status and a readable message.
 */
export const classifyMediaError = (error: unknown): { status: MediaStatus; message: string } => {
  const name = error instanceof Error || (typeof error === 'object' && error !== null)
    ? String((error as { name?: unknown }).name ?? '')
    : '';

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return { status: 'denied', message: MEDIA_MESSAGES.denied };
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
    return { status: 'unavailable', message: MEDIA_MESSAGES.missing };
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return { status: 'error', message: MEDIA_MESSAGES.busy };
  }
  return { status: 'error', message: MEDIA_MESSAGES.unknown };
};

/**
 * Opens a camera and/or microphone, only when asked, and always lets go.
 *
 * - Never prompts on its own. Nothing happens until `start()` is called.
 * - Stops every track on `stop()` and on unmount, so the camera light and the
 *   browser's recording indicator turn off.
 * - If the component unmounts, or `stop()` is called, while the permission
 *   prompt is still open, the stream that arrives late is shut down at once.
 * - Calling `start()` twice shares one request.
 * - If the device is unplugged, the status returns to `idle` with a message.
 *
 * Streams stay on the user's device. This hook records and uploads nothing.
 *
 * @example
 * ```tsx
 * const { stream, status, error, start, stop } = useMediaStream({ video: true });
 *
 * return status === 'active'
 *   ? <button onClick={stop}>Turn camera off</button>
 *   : <button onClick={start}>Turn camera on</button>;
 * ```
 */
export const useMediaStream = (options: MediaStreamOptions): MediaStreamReturn => {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<MediaStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const pendingRef = useRef<Promise<MediaStream | null> | null>(null);
  const requestRef = useRef(0);
  const mountedRef = useRef(true);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    requestRef.current += 1;
    pendingRef.current = null;
    release();
    if (mountedRef.current) {
      setStream(null);
      setStatus('idle');
      setError(null);
    }
  }, [release]);

  const start = useCallback((): Promise<MediaStream | null> => {
    if (streamRef.current) return Promise.resolve(streamRef.current);
    if (pendingRef.current) return pendingRef.current;

    const { video = false, audio = false } = optionsRef.current;
    if (!video && !audio) {
      setStatus('error');
      setError(MEDIA_MESSAGES.nothingRequested);
      return Promise.resolve(null);
    }
    if (!isMediaSupported()) {
      setStatus('unavailable');
      setError(MEDIA_MESSAGES.unsupported);
      return Promise.resolve(null);
    }

    const id = ++requestRef.current;
    setStatus('requesting');
    setError(null);

    const request = navigator.mediaDevices
      .getUserMedia({ video, audio })
      .then((next) => {
        // Stopped or unmounted while the prompt was open: let the hardware go.
        if (id !== requestRef.current || !mountedRef.current) {
          next.getTracks().forEach((track) => track.stop());
          return null;
        }

        streamRef.current = next;
        next.getTracks().forEach((track) => {
          track.addEventListener(
            'ended',
            () => {
              if (streamRef.current !== next) return;
              release();
              if (mountedRef.current) {
                setStream(null);
                setStatus('idle');
                setError(MEDIA_MESSAGES.disconnected);
              }
            },
            { once: true }
          );
        });

        setStream(next);
        setStatus('active');
        return next;
      })
      .catch((failure: unknown) => {
        if (id === requestRef.current && mountedRef.current) {
          const { status: failed, message } = classifyMediaError(failure);
          setStatus(failed);
          setError(message);
        }
        return null;
      })
      .finally(() => {
        if (id === requestRef.current) pendingRef.current = null;
      });

    pendingRef.current = request;
    return request;
  }, [release]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
      pendingRef.current = null;
      release();
    };
  }, [release]);

  return { stream, status, error, start, stop };
};
