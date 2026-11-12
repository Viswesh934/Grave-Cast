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

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * SECONDS_PER_MINUTE;

/** A length of time for reading: `45 s`, `2 min 5 s`, or `1 h 3 min`. */
export const formatDuration = (ms: number): string => {
  const total = Math.max(0, Math.floor(ms / MS_PER_SECOND));
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = total % SECONDS_PER_MINUTE;
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${seconds} s`;
  return `${seconds} s`;
};

/** Why a background reading is an estimate, in plain words. */
const DOUBT_WORDS = {
  image: 'a background image',
  media: 'an image or video',
  positioned: 'layers placed over the page',
  opacity: 'see-through layers',
  filter: 'a filter',
  blend: 'a blend mode',
  scheme: 'the dark page color',
} as const;

/** One sentence on why a background is estimated, or an empty string when it is certain. */
export const describeDoubts = (doubts: readonly (keyof typeof DOUBT_WORDS)[]): string =>
  doubts.length === 0 ? '' : `Estimated, because of ${doubts.map((doubt) => DOUBT_WORDS[doubt]).join(' and ')}.`;

/** WCAG 2 minimum ratios, written for people. */
const MINIMUM_RATIO_TEXT = { normal: '4.5', large: '3' } as const;

/** Plain advice for a contrast rating. */
export const readabilityAdvice = (rating: 'AAA' | 'AA' | 'fail', large: boolean): string => {
  if (rating === 'fail') return `Hard to read. Text this size needs at least ${large ? MINIMUM_RATIO_TEXT.large : MINIMUM_RATIO_TEXT.normal} to 1.`;
  if (rating === 'AA') return 'Readable for most people.';
  return 'Easy to read, even in poor light.';
};

const BYTES_PER_UNIT = 1024;
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** A size in bytes for reading: `512 B`, `1.5 KB`, `20 MB`. */
export const formatBytes = (bytes: number): string => {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= BYTES_PER_UNIT && unit < BYTE_UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unit += 1;
  }
  return `${unit === 0 ? Math.round(value) : formatPx(value)} ${BYTE_UNITS[unit]}`;
};

const CLOCK_DIGITS = 2;
const pad = (value: number): string => String(value).padStart(CLOCK_DIGITS, '0');

/** A moment as a clock time, such as `09:04:31`, in the local time zone. */
export const formatTimeOfDay = (ms: number): string => {
  const date = new Date(ms);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
