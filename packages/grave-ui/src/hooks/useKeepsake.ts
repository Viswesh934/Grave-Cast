/**
 * useKeepsake - Hold one clip in memory until the user decides to keep it
 * @module hooks/useKeepsake
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** File name used when a clip is kept without a name of its own. */
export const DEFAULT_KEEPSAKE_NAME = 'clip';

/**
 * A clip held in memory.
 */
export interface Keepsake {
  /** An address the browser can play, such as for an `<audio>` element. Valid until the clip is replaced or discarded. */
  url: string;
  /** The clip's data. */
  blob: Blob;
  /** The file name used when the clip is kept. */
  filename: string;
  /** Length of the clip in milliseconds, or 0 if unknown. */
  durationMs: number;
  /** A short description, such as the name of the voice used. */
  label: string;
}

/**
 * Details given when holding a clip.
 */
export interface KeepsakeMeta {
  /** File name for the download. @default 'clip' */
  filename?: string;
  /** Length in milliseconds. @default 0 */
  durationMs?: number;
  /** A short description. @default '' */
  label?: string;
}

/**
 * Return value of {@link useKeepsake}.
 */
export interface KeepsakeReturn {
  /** The clip currently held, or `null`. */
  item: Keepsake | null;
  /** Holds a clip. Any clip held before is let go. */
  hold: (blob: Blob, meta?: KeepsakeMeta) => Keepsake;
  /** Saves the held clip to the user's device as a download. Does nothing if none is held. */
  keep: () => void;
  /** Lets go of the held clip. */
  discard: () => void;
}

/**
 * Holds a single clip, such as a recording or a changed voice, in memory only.
 *
 * - Nothing is written to disk, uploaded, or stored in the browser. The clip
 *   lives in memory until it is replaced, discarded, or the component unmounts.
 * - `keep()` is the only way a clip leaves memory, and only by a download the
 *   user can see and cancel.
 * - Object URLs are released as soon as they are no longer needed.
 *
 * @example
 * ```tsx
 * const { item, hold, keep, discard } = useKeepsake();
 * hold(blob, { filename: 'ghost.wav', label: 'Ghost' });
 *
 * return item && (
 *   <>
 *     <audio src={item.url} controls />
 *     <button onClick={keep}>Keep it</button>
 *     <button onClick={discard}>Let it go</button>
 *   </>
 * );
 * ```
 */
export const useKeepsake = (): KeepsakeReturn => {
  const [item, setItem] = useState<Keepsake | null>(null);
  const currentRef = useRef<Keepsake | null>(null);

  const release = useCallback(() => {
    if (currentRef.current) URL.revokeObjectURL(currentRef.current.url);
    currentRef.current = null;
  }, []);

  const hold = useCallback(
    (blob: Blob, meta: KeepsakeMeta = {}): Keepsake => {
      release();
      const next: Keepsake = {
        url: URL.createObjectURL(blob),
        blob,
        filename: meta.filename ?? DEFAULT_KEEPSAKE_NAME,
        durationMs: meta.durationMs ?? 0,
        label: meta.label ?? '',
      };
      currentRef.current = next;
      setItem(next);
      return next;
    },
    [release]
  );

  const discard = useCallback(() => {
    release();
    setItem(null);
  }, [release]);

  const keep = useCallback(() => {
    const held = currentRef.current;
    if (!held || typeof document === 'undefined') return;
    const link = document.createElement('a');
    link.href = held.url;
    link.download = held.filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  useEffect(() => release, [release]);

  return { item, hold, keep, discard };
};
