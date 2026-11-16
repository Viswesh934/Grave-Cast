/**
 * Compass and level readings from the phone's motion sensors, and compass
 * headings in words.
 * @module signal/orientation
 */

/** The eight compass points, clockwise from north. */
export const COMPASS_POINTS = ['North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west'] as const;

/** One of the eight compass points. */
export type CompassPoint = (typeof COMPASS_POINTS)[number];

const FULL_TURN = 360;
const POINT_WIDTH = FULL_TURN / COMPASS_POINTS.length;

/** A heading turned into 0 up to (not including) 360 degrees. */
export const normalizeHeading = (degrees: number): number => ((degrees % FULL_TURN) + FULL_TURN) % FULL_TURN;

/**
 * The nearest of the eight compass points to a heading.
 *
 * @example
 * compassPoint(40) // 'North-east'
 */
export const compassPoint = (degrees: number): CompassPoint =>
  COMPASS_POINTS[Math.round(normalizeHeading(degrees) / POINT_WIDTH) % COMPASS_POINTS.length];

/** What the motion sensors say. A value is `null` when the phone doesn't give it. */
export interface OrientationReading {
  /** Degrees clockwise from north that the top of the phone points to. */
  heading: number | null;
  /** Front-to-back tilt in degrees (0 when lying flat). */
  frontBack: number | null;
  /** Left-to-right tilt in degrees (0 when lying flat). */
  leftRight: number | null;
}

type OrientationEventWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number };
type OrientationEventConstructor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

/** Whether the browser must ask before it shares motion sensors (iPhone and iPad do). */
export const orientationNeedsPermission = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.DeviceOrientationEvent !== 'undefined' &&
  typeof (window.DeviceOrientationEvent as OrientationEventConstructor).requestPermission === 'function';

/**
 * Asks to read the motion sensors where the browser needs that. Call it from a tap.
 *
 * @returns `true` when readings may be taken.
 */
export const requestOrientationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || typeof window.DeviceOrientationEvent === 'undefined') return false;
  if (!orientationNeedsPermission()) return true;
  try {
    return (await (window.DeviceOrientationEvent as OrientationEventConstructor).requestPermission!()) === 'granted';
  } catch {
    return false;
  }
};

/**
 * Reports the phone's heading and tilt as they change.
 * The heading comes from the iPhone's compass, or Android's absolute orientation; other browsers give none.
 *
 * @returns A function that stops watching.
 * @example
 * const stop = watchOrientation((reading) => setReading(reading))
 */
export const watchOrientation = (onReading: (reading: OrientationReading) => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  let reading: OrientationReading = { heading: null, frontBack: null, leftRight: null };
  const update = (next: Partial<OrientationReading>) => {
    reading = { ...reading, ...next };
    onReading(reading);
  };
  const onRelative = (event: Event) => {
    const e = event as OrientationEventWithCompass;
    const next: Partial<OrientationReading> = { frontBack: e.beta, leftRight: e.gamma };
    if (typeof e.webkitCompassHeading === 'number') next.heading = normalizeHeading(e.webkitCompassHeading);
    else if (e.absolute && e.alpha !== null) next.heading = normalizeHeading(FULL_TURN - e.alpha);
    update(next);
  };
  const onAbsolute = (event: Event) => {
    const e = event as DeviceOrientationEvent;
    if (e.alpha !== null) update({ heading: normalizeHeading(FULL_TURN - e.alpha) });
  };
  window.addEventListener('deviceorientation', onRelative);
  window.addEventListener('deviceorientationabsolute', onAbsolute);
  return () => {
    window.removeEventListener('deviceorientation', onRelative);
    window.removeEventListener('deviceorientationabsolute', onAbsolute);
  };
};
