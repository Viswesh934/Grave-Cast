/**
 * Camera timestamps and recording timers.
 *
 * @module video/timecode
 */

/** Seconds in a minute and in an hour. */
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

/** Milliseconds in a second. */
const MS_PER_SECOND = 1000;

const pad = (value: number, width: number = 2): string => String(value).padStart(width, '0');

/**
 * Formats a date like a camera's on-screen clock, in local time.
 *
 * @example
 * ```ts
 * formatCamTimestamp(new Date(1999, 9, 31, 23, 59, 7)); // '1999-10-31 23:59:07'
 * ```
 */
export const formatCamTimestamp = (date: Date): string =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

/**
 * Formats a length of time like a recording counter: `HH:MM:SS`.
 * Negative or invalid input shows as zero.
 */
export const formatElapsed = (milliseconds: number): string => {
  const total = Number.isFinite(milliseconds) ? Math.max(0, Math.floor(milliseconds / MS_PER_SECOND)) : 0;
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = total % SECONDS_PER_MINUTE;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
