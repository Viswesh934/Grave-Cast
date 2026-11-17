/**
 * Noticing a deliberate shake of the phone: a few hard jolts close together, read
 * from the motion sensor. Ordinary walking or a bump in a bag stays under the
 * threshold. It only works while the page is open; browsers don't share motion
 * with a page in the background.
 * @module signal/shake
 */
import { signalTokens } from './tokens';

type MotionEventConstructor = typeof DeviceMotionEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

/** Standard gravity, in metres per second squared. */
const GRAVITY = 9.81;

/** Whether this browser has a motion sensor to read. */
export const motionSupported = (): boolean => typeof window !== 'undefined' && typeof window.DeviceMotionEvent !== 'undefined';

/** Whether the browser asks before sharing motion (iPhone and iPad do). */
export const motionNeedsPermission = (): boolean =>
  motionSupported() && typeof (window.DeviceMotionEvent as MotionEventConstructor).requestPermission === 'function';

/**
 * Asks to read the motion sensor, where the browser requires it. Call it from a
 * tap: iPhone only shows the question then.
 *
 * @returns `true` once motion can be read.
 */
export const requestMotionPermission = async (): Promise<boolean> => {
  if (!motionSupported()) return false;
  if (!motionNeedsPermission()) return true;
  try {
    return (await (window.DeviceMotionEvent as MotionEventConstructor).requestPermission!()) === 'granted';
  } catch {
    return false;
  }
};

/** Options for {@link watchShake}. Each defaults to its {@link signalTokens.shake} value. */
export interface ShakeOptions {
  /** How hard a jolt must be, in metres per second squared beyond gravity. */
  jolt?: number;
  /** How many jolts make a shake. */
  count?: number;
  /** All of them must happen within this many milliseconds. */
  windowMs?: number;
  /** Jolts closer together than this count as one. */
  minGapMs?: number;
}

/**
 * Calls `onShake` each time the phone is shaken hard a few times in a row.
 *
 * @returns A function that stops watching.
 * @example
 * const stop = watchShake(() => startHelpSignal())
 */
export const watchShake = (onShake: () => void, options: ShakeOptions = {}): (() => void) => {
  if (!motionSupported()) return () => {};
  const { jolt, count, windowMs, minGapMs } = { ...signalTokens.shake, ...options };
  let jolts: number[] = [];
  const onMotion = (event: DeviceMotionEvent) => {
    const a = event.accelerationIncludingGravity;
    if (!a || a.x === null || a.y === null || a.z === null) return;
    const force = Math.abs(Math.hypot(a.x, a.y, a.z) - GRAVITY);
    if (force < jolt) return;
    const now = performance.now();
    const latest = jolts[jolts.length - 1];
    if (latest !== undefined && now - latest < minGapMs) return;
    jolts = [...jolts.filter((t) => now - t <= windowMs), now];
    if (jolts.length >= count) {
      jolts = [];
      onShake();
    }
  };
  window.addEventListener('devicemotion', onMotion);
  return () => window.removeEventListener('devicemotion', onMotion);
};
