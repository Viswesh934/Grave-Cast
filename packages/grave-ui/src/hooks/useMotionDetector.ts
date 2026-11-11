/**
 * useMotionDetector - Notice when a video picture changes
 * @module hooks/useMotionDetector
 */

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  MOTION_SENSITIVITY,
  changedFraction,
  createMotionDetector,
  type MotionSensitivity,
} from '../video';
import { useFrameSampler, type FrameSource } from './useFrameSampler';

/** Default samples per second. Motion does not need many. */
export const DEFAULT_MOTION_FPS = 8;

/** Default pixels across the sampled grid. Small, which also smooths away camera noise. */
export const DEFAULT_MOTION_COLS = 48;

/** Smallest level change worth re-rendering for. */
const LEVEL_EPSILON = 0.02;

/**
 * Options for {@link useMotionDetector}.
 */
export interface MotionDetectorOptions {
  /** Set to `false` to stop checking. @default true */
  enabled?: boolean;
  /** How easily motion is noticed. @default 'medium' */
  sensitivity?: MotionSensitivity;
  /** Checks per second. @default 8 */
  fps?: number;
  /** Pixels across the grid compared. @default 48 */
  cols?: number;
  /** Called once each time motion begins. */
  onMotion?: () => void;
}

/**
 * Return value of {@link useMotionDetector}.
 */
export interface MotionDetectorReturn {
  /** `true` while something is moving, and briefly after. */
  moving: boolean;
  /** How much of the picture is changing, 0-1, for a meter. */
  level: number;
  /** A readable explanation if the picture could not be read, otherwise `null`. */
  error: string | null;
}

/**
 * Compares each sampled frame with the one before and reports whether the
 * picture is moving. Everything happens on the device; no frames are kept
 * beyond the previous one, and nothing is sent anywhere.
 *
 * @param sourceRef - Ref to the video, canvas, or image to watch.
 *
 * @example
 * ```tsx
 * const video = useRef<HTMLVideoElement>(null);
 * const { moving } = useMotionDetector(video, { sensitivity: 'high' });
 *
 * return <p>{moving ? 'Something moved' : 'All still'}</p>;
 * ```
 */
export const useMotionDetector = (
  sourceRef: RefObject<FrameSource | null>,
  options: MotionDetectorOptions = {}
): MotionDetectorReturn => {
  const {
    enabled = true,
    sensitivity = 'medium',
    fps = DEFAULT_MOTION_FPS,
    cols = DEFAULT_MOTION_COLS,
    onMotion,
  } = options;

  const settings = MOTION_SENSITIVITY[sensitivity];
  const detector = useMemo(() => createMotionDetector(settings), [settings]);

  const [moving, setMoving] = useState(false);
  const [level, setLevel] = useState(0);
  const previous = useRef<Uint8ClampedArray | null>(null);
  const onMotionRef = useRef(onMotion);
  onMotionRef.current = onMotion;

  const { error } = useFrameSampler(sourceRef, { cols, fps, enabled }, (frame) => {
    const before = previous.current;
    previous.current = frame.data;
    if (!before || before.length !== frame.data.length) return;

    const result = detector.update({
      fraction: changedFraction(before, frame.data, settings.pixelThreshold),
      now: frame.now,
    });

    setMoving(result.moving);
    setLevel((current) => (Math.abs(current - result.level) >= LEVEL_EPSILON ? result.level : current));
    if (result.started) onMotionRef.current?.();
  });

  // Start fresh whenever detection is turned off or the sensitivity changes.
  useEffect(() => {
    previous.current = null;
    detector.reset();
    if (!enabled) {
      setMoving(false);
      setLevel(0);
    }
  }, [enabled, detector]);

  return { moving, level, error };
};
