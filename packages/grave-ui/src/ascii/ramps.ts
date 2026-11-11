/**
 * Character ramps: text characters ordered from empty to dense.
 *
 * A ramp turns brightness into a character. The first character is used for
 * the darkest pixels and the last for the brightest, which suits light text on
 * a dark background. Pass `invert` to flip it for dark text on light.
 *
 * @module ascii/ramps
 */

/**
 * Built-in ramps.
 *
 * - `standard`: ten classic characters, a good all-rounder
 * - `detailed`: more steps for smoother shading at larger sizes
 * - `blocks`: Unicode shade blocks for a chunky, filled look
 * - `minimal`: five steps, bold and graphic
 * - `binary`: on or off
 */
export const ASCII_RAMPS = {
  standard: ' .:-=+*#%@',
  detailed: ' .,:;i1tfLCG08@',
  blocks: ' ░▒▓█',
  minimal: ' .oO@',
  binary: ' #',
} as const;

/** Name of a built-in ramp. */
export type RampName = keyof typeof ASCII_RAMPS;

/** Every built-in ramp name, handy for building pickers. */
export const RAMP_NAMES = Object.keys(ASCII_RAMPS) as RampName[];

/**
 * Turns a ramp name or a custom string into a list of characters, darkest
 * first. A custom string must have at least two characters.
 *
 * @throws If a custom ramp has fewer than two characters.
 */
export const resolveRamp = (ramp: RampName | string = 'standard'): string[] => {
  const text = ramp in ASCII_RAMPS ? ASCII_RAMPS[ramp as RampName] : ramp;
  const characters = Array.from(text);
  if (characters.length < 2) {
    throw new Error('[grave-ui] An ASCII ramp needs at least two characters.');
  }
  return characters;
};
