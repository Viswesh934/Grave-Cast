/**
 * useAsciiVideo - Draw a live video, canvas, or image as text
 * @module hooks/useAsciiVideo
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { ASCII_CHAR_ASPECT, pixelsToAscii, type AsciiConvertOptions } from '../ascii';
import { useFrameSampler, type FrameSource, type SampledFrame } from './useFrameSampler';

/** Anything that can be drawn to a canvas and has a size. */
export type AsciiSource = FrameSource;

/** Default number of characters across. */
export const DEFAULT_ASCII_COLS = 80;

/** Default frames per second. Text redraws are heavy, so this stays modest. */
export const DEFAULT_ASCII_FPS = 12;

/**
 * Options for {@link useAsciiVideo}.
 */
export interface AsciiVideoOptions extends AsciiConvertOptions {
  /** Characters across. More is sharper and slower. @default 80 */
  cols?: number;
  /** Redraws per second. @default 12 */
  fps?: number;
  /** Flip left to right, like a mirror. Good for webcams. @default false */
  mirror?: boolean;
  /** Set to `false` to pause. @default true */
  enabled?: boolean;
}

/**
 * Return value of {@link useAsciiVideo}.
 */
export interface AsciiVideoReturn {
  /** The picture as lines of text. Empty until the source has a size. */
  lines: string[];
  /** A readable explanation if the picture could not be read, otherwise `null`. */
  error: string | null;
}

/**
 * Samples a video (or canvas, or image) at a low resolution and turns each
 * frame into text.
 *
 * - Runs at `fps`, not at the display rate, and pauses while the tab is hidden.
 * - Only updates state when the text actually changes.
 * - Stops with a readable error if the picture is cross-origin and unreadable.
 *
 * @param sourceRef - Ref to the video, canvas, or image element to read.
 *
 * @example
 * ```tsx
 * const video = useRef<HTMLVideoElement>(null);
 * const { lines } = useAsciiVideo(video, { cols: 100, ramp: 'blocks', mirror: true });
 *
 * return <pre>{lines.join('\n')}</pre>;
 * ```
 */
export const useAsciiVideo = (
  sourceRef: RefObject<AsciiSource | null>,
  options: AsciiVideoOptions = {}
): AsciiVideoReturn => {
  const {
    cols = DEFAULT_ASCII_COLS,
    fps = DEFAULT_ASCII_FPS,
    mirror = false,
    enabled = true,
    ramp,
    invert,
    contrast,
    brightness,
  } = options;

  const [lines, setLines] = useState<string[]>([]);
  const previous = useRef('');

  const onFrame = useCallback(
    (frame: SampledFrame) => {
      const next = pixelsToAscii(frame.data, frame.cols, frame.rows, { ramp, invert, contrast, brightness });
      const joined = next.join('\n');
      if (joined === previous.current) return;
      previous.current = joined;
      setLines(next);
    },
    [ramp, invert, contrast, brightness]
  );

  const { error } = useFrameSampler(
    sourceRef,
    { cols, fps, mirror, enabled, cellAspect: ASCII_CHAR_ASPECT },
    onFrame
  );

  // Forget the last picture when sampling restarts, so an identical frame still draws.
  useEffect(() => {
    previous.current = '';
  }, [sourceRef, enabled, cols, fps, mirror]);

  return { lines, error };
};
