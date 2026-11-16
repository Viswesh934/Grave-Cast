import { useEffect, useState } from 'react';
import { watchOrientation, type OrientationReading } from '../signal/orientation';

const NO_READING: OrientationReading = { heading: null, frontBack: null, leftRight: null };

/**
 * The phone's heading and tilt, kept up to date while `active` is true.
 * On iPhone, call `requestOrientationPermission()` from a tap first.
 *
 * @example
 * const { heading, frontBack, leftRight } = useOrientation(started)
 */
export const useOrientation = (active: boolean): OrientationReading => {
  const [reading, setReading] = useState<OrientationReading>(NO_READING);
  useEffect(() => {
    if (!active) return;
    const stop = watchOrientation(setReading);
    return () => {
      stop();
      setReading(NO_READING);
    };
  }, [active]);
  return reading;
};
