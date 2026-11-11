/**
 * useFrameSampler - Read small pixel snapshots from a video, canvas, or image
 * @module hooks/useFrameSampler
 */

import { useEffect, useRef, useState, type RefObject } from 'react';
import { fitAsciiSize } from '../ascii/convert';

/** Anything that can be drawn to a canvas and has a size. */
export type FrameSource = HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;

/** Default samples per second. */
export const DEFAULT_SAMPLER_FPS = 12;

/** Default pixels across the sampled grid. */
export const DEFAULT_SAMPLER_COLS = 80;

/** Milliseconds in a second. */
const MS_PER_SECOND = 1000;

/** Messages shown when sampling cannot work. */
export const FRAME_MESSAGES = {
  unreadable: 'This picture cannot be read. It may come from another website.',
  noCanvas: 'A canvas is not available, so the picture cannot be read.',
} as const;

/**
 * Options for {@link useFrameSampler}.
 */
export interface FrameSamplerOptions {
  /** Pixels across the grid. @default 80 */
  cols?: number;
  /** Snapshots per second. @default 12 */
  fps?: number;
  /** Flip left to right, like a mirror. @default false */
  mirror?: boolean;
  /** Set to `false` to pause. @default true */
  enabled?: boolean;
  /**
   * Width over height of one grid cell. Use 1 for pixels and
   * `ASCII_CHAR_ASPECT` for text characters.
   * @default 1
   */
  cellAspect?: number;
}

/**
 * One snapshot passed to the `onFrame` callback.
 */
export interface SampledFrame {
  /** RGBA values, row by row. A new array for every frame, so it is safe to keep. */
  data: Uint8ClampedArray;
  /** Pixels across. */
  cols: number;
  /** Pixels down. */
  rows: number;
  /** Time of the snapshot in milliseconds. */
  now: number;
}

/**
 * Return value of {@link useFrameSampler}.
 */
export interface FrameSamplerReturn {
  /** A readable explanation if the picture could not be read, otherwise `null`. */
  error: string | null;
}

const sizeOf = (source: FrameSource): [number, number] => {
  if ('videoWidth' in source) return [source.videoWidth, source.videoHeight];
  if ('naturalWidth' in source && source.naturalWidth > 0) return [source.naturalWidth, source.naturalHeight];
  return [source.width, source.height];
};

/**
 * Takes small, regular pixel snapshots of a picture and hands each to
 * `onFrame`. It is the shared base for ASCII video and motion detection.
 *
 * - Runs at `fps`, not at the display rate, and pauses while the tab is hidden.
 * - Does nothing until the source has a size.
 * - Stops with a readable error if the picture is cross-origin and unreadable.
 * - `onFrame` may change between renders without restarting the loop.
 *
 * @param sourceRef - Ref to the video, canvas, or image element to read.
 * @param options - How often and how large to sample.
 * @param onFrame - Called with every snapshot.
 *
 * @example
 * ```tsx
 * const video = useRef<HTMLVideoElement>(null);
 * useFrameSampler(video, { cols: 32, fps: 8 }, (frame) => analyse(frame.data));
 * ```
 */
export const useFrameSampler = (
  sourceRef: RefObject<FrameSource | null>,
  options: FrameSamplerOptions,
  onFrame: (frame: SampledFrame) => void
): FrameSamplerReturn => {
  const {
    cols = DEFAULT_SAMPLER_COLS,
    fps = DEFAULT_SAMPLER_FPS,
    mirror = false,
    enabled = true,
    cellAspect = 1,
  } = options;

  const [error, setError] = useState<string | null>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      setError(FRAME_MESSAGES.noCanvas);
      return undefined;
    }
    setError(null);

    const interval = MS_PER_SECOND / Math.max(1, fps);
    let frame = 0;
    let last = -Infinity;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (document.hidden || now - last < interval) return;

      const source = sourceRef.current;
      if (!source) return;
      const [width, height] = sizeOf(source);
      if (!(width > 0) || !(height > 0)) return;
      last = now;

      const grid = fitAsciiSize(width, height, cols, cellAspect);
      if (canvas.width !== grid.cols || canvas.height !== grid.rows) {
        canvas.width = grid.cols;
        canvas.height = grid.rows;
      }

      try {
        if (mirror) {
          ctx.save();
          ctx.translate(grid.cols, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(source, 0, 0, grid.cols, grid.rows);
          ctx.restore();
        } else {
          ctx.drawImage(source, 0, 0, grid.cols, grid.rows);
        }
        const { data } = ctx.getImageData(0, 0, grid.cols, grid.rows);
        onFrameRef.current({ data, cols: grid.cols, rows: grid.rows, now });
      } catch {
        cancelAnimationFrame(frame);
        setError(FRAME_MESSAGES.unreadable);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [sourceRef, enabled, cols, fps, mirror, cellAspect]);

  return { error };
};
