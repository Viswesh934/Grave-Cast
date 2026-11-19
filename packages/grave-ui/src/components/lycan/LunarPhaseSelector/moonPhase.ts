/**
 * moonPhase - the moon's real phase on a given day, worked out from the date
 * alone, so it needs no network.
 *
 * It counts mean synodic months from a known new moon. The mean month drifts
 * from the true one by up to about 14 hours, which is well inside one of the
 * eight named phases.
 * @module components/lycan/LunarPhaseSelector/moonPhase
 */
import type { MoonPhase } from './LunarPhaseSelector';

/** The mean synodic month: new moon to new moon, in days. */
export const SYNODIC_MONTH_DAYS = 29.530588853;
/** A known new moon: 6 January 2000, 18:14 UTC. */
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;
/** The eight named phases, in order from new, each centred on its share of the month. */
const PHASES_IN_ORDER: readonly MoonPhase[] = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'waning-gibbous',
  'third-quarter',
  'waning-crescent',
];
const HALF_MONTH = 0.5;

/** The moon on one day. */
export interface MoonOnDay {
  /** The named phase. Never `blood-moon`: an eclipse can't be told from the date alone. */
  phase: MoonPhase;
  /** How far through the month, from 0 (new) through 0.5 (full) to 1 (new again). */
  age: number;
  /** Share of the face that is lit, 0 to 1. */
  lit: number;
  /** True while the lit part grows, from new to full. */
  waxing: boolean;
}

/**
 * The moon's phase at a moment.
 *
 * @param date - The moment. @default now
 * @example
 * ```ts
 * moonPhaseOn(new Date('2025-01-13T22:27:00Z')).phase; // 'full'
 * ```
 */
export const moonPhaseOn = (date: Date = new Date()): MoonOnDay => {
  const days = (date.getTime() - KNOWN_NEW_MOON_MS) / DAY_MS;
  const age = (((days / SYNODIC_MONTH_DAYS) % 1) + 1) % 1;
  const slot = Math.round(age * PHASES_IN_ORDER.length) % PHASES_IN_ORDER.length;
  return {
    phase: PHASES_IN_ORDER[slot],
    age,
    lit: (1 - Math.cos(age * Math.PI * 2)) / 2,
    waxing: age < HALF_MONTH,
  };
};
