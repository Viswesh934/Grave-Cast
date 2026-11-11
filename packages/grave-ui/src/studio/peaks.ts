/**
 * Waveform outlines for drawing recordings.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module studio/peaks
 */

/** Number of bars used to draw a recording by default. */
export const DEFAULT_PEAK_BUCKETS = 200;

/**
 * Reduces audio to a short list of loudness values for drawing a waveform.
 *
 * @param samples - Audio samples from -1 to 1.
 * @param buckets - How many values to produce.
 * @returns One value from 0 to 1 per bucket: the loudest sample in it.
 */
export const computePeaks = (samples: ArrayLike<number>, buckets: number = DEFAULT_PEAK_BUCKETS): number[] => {
  const count = Math.max(1, Math.floor(buckets));
  const peaks = new Array<number>(count).fill(0);
  const length = samples.length;
  if (length === 0) return peaks;

  const size = length / count;
  for (let bucket = 0; bucket < count; bucket += 1) {
    const from = Math.floor(bucket * size);
    const to = Math.min(length, Math.max(from + 1, Math.floor((bucket + 1) * size)));
    let loudest = 0;
    for (let i = from; i < to; i += 1) {
      const value = Math.abs(samples[i]);
      if (Number.isFinite(value) && value > loudest) loudest = value;
    }
    peaks[bucket] = Math.min(1, loudest);
  }
  return peaks;
};
