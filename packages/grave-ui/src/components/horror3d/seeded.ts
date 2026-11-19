/**
 * A small seeded random number source for the 3D scenes.
 *
 * It lives in its own module so the yard, the walk and the haunting
 * effects can share it without importing each other.
 */

/** Linear congruential generator constants (Numerical Recipes). */
const LCG = { multiplier: 1664525, increment: 1013904223 } as const;

/** 2^32: turns an unsigned 32-bit state into a number from 0 up to 1. */
const UINT32_RANGE = 4294967296;

/**
 * Returns a function that gives the same sequence of numbers, 0 up to 1,
 * for the same seed, so a scene is laid out the same on every visit.
 *
 * @param seed - Any integer; only its low 32 bits are used.
 */
export const seeded = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * LCG.multiplier + LCG.increment) >>> 0;
    return s / UINT32_RANGE;
  };
};
