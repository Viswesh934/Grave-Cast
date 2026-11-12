/**
 * Grimoire color: read any CSS color, convert it to sRGB, blend it, and
 * check contrast.
 * @module grimoire/color
 */

export * from './parse';
export * from './contrast';
export { srgbToLinear, linearToSrgb } from './spaces';
