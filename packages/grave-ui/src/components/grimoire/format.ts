/**
 * Number formatting shared by Grimoire panels.
 * @module components/grimoire/format
 */

/** Decimal places shown for pixel values. */
const PX_DECIMALS = 1;

/** Shown in place of zero in box-model diagrams, the way browser devtools do. */
export const EMPTY_SIDE = '–';

/** A pixel value for reading: one decimal at most, trailing zeros dropped. */
export const formatPx = (value: number): string => {
  const factor = 10 ** PX_DECIMALS;
  return String(Math.round(value * factor) / factor);
};

/** A box-model side: the value, or a dash for zero. */
export const formatSide = (value: number): string => (Math.abs(value) < 1 / 10 ** PX_DECIMALS ? EMPTY_SIDE : formatPx(value));

/** A size as `width × height`. */
export const formatSize = (width: number, height: number): string => `${formatPx(width)} × ${formatPx(height)}`;
