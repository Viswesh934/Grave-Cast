/**
 * useFadingTrail - A trail of points that fades out behind the pointer
 * @module hooks/useFadingTrail
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** Most points kept by default. */
export const FADING_TRAIL_LIMIT = 240;

/** One point of a trail. */
export interface TrailPoint {
  x: number;
  y: number;
  /** How far it has faded, from 0 (just added) to 1 (gone). */
  age: number;
  /** The first point of a stroke, so it is not joined to the point before. */
  start: boolean;
}

/**
 * Options for {@link useFadingTrail}.
 */
export interface FadingTrailOptions {
  /** Most points kept; the oldest go first. @default FADING_TRAIL_LIMIT */
  maxPoints?: number;
}

/**
 * Return value of {@link useFadingTrail}.
 */
export interface FadingTrailReturn {
  /** The points still showing, oldest first. */
  points: readonly TrailPoint[];
  /** Adds a point that fades out over `lifeMs`. Pass `newStroke` for the first point of a stroke. */
  add: (point: { x: number; y: number }, lifeMs: number, newStroke?: boolean) => void;
  /** Removes every point at once. */
  clear: () => void;
}

interface Stored {
  x: number;
  y: number;
  born: number;
  life: number;
  start: boolean;
}

/**
 * Keeps a trail of points that fade out on their own, like a laser pointer
 * or an eraser's wake. The animation runs only while something is showing,
 * and stops on unmount.
 *
 * @example
 * ```tsx
 * const trail = useFadingTrail();
 * onPointerMove={(e) => trail.add({ x: e.clientX, y: e.clientY }, 900)}
 * {trail.points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} opacity={1 - p.age} />)}
 * ```
 */
export const useFadingTrail = (options: FadingTrailOptions = {}): FadingTrailReturn => {
  const { maxPoints = FADING_TRAIL_LIMIT } = options;
  const storeRef = useRef<Stored[]>([]);
  const frameRef = useRef<number | null>(null);
  const sweepRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [points, setPoints] = useState<TrailPoint[]>([]);

  /** Drops faded points and shows the rest with their current age. */
  const snapshot = useCallback(() => {
    const now = performance.now();
    storeRef.current = storeRef.current.filter((point) => now - point.born < point.life);
    setPoints(storeRef.current.map((point) => ({ x: point.x, y: point.y, start: point.start, age: Math.min(1, (now - point.born) / point.life) })));
  }, []);

  const tick = useCallback(() => {
    snapshot();
    frameRef.current = storeRef.current.length > 0 ? requestAnimationFrame(tick) : null;
  }, [snapshot]);

  const add = useCallback(
    (point: { x: number; y: number }, lifeMs: number, newStroke = false) => {
      const life = Math.max(1, lifeMs);
      const stored: Stored = { x: point.x, y: point.y, born: performance.now(), life, start: newStroke };
      storeRef.current = [...storeRef.current, stored].slice(-maxPoints);
      // Show the new point at once, then keep fading on each frame.
      snapshot();
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(tick);
      // Browsers pause frames in background tabs; this still clears the trail once it has faded.
      if (sweepRef.current !== null) clearTimeout(sweepRef.current);
      const lastExpiry = Math.max(...storeRef.current.map((kept) => kept.born + kept.life));
      sweepRef.current = setTimeout(() => {
        sweepRef.current = null;
        snapshot();
      }, Math.max(life, lastExpiry - performance.now()));
    },
    [maxPoints, snapshot, tick]
  );

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (sweepRef.current !== null) clearTimeout(sweepRef.current);
    frameRef.current = null;
    sweepRef.current = null;
  }, []);

  const clear = useCallback(() => {
    storeRef.current = [];
    stop();
    setPoints([]);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { points, add, clear };
};
