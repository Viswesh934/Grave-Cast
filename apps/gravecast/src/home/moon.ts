/** The moon's phase tonight, worked out from the date. Accurate to about a day. */

const SYNODIC_MONTH_DAYS = 29.530588853
/** A known new moon: 6 January 2000, 18:14 UTC. */
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14)
const DAY_MS = 86_400_000

const PHASES: readonly { until: number; name: string }[] = [
  { until: 1.85, name: 'New moon' },
  { until: 5.54, name: 'Waxing crescent' },
  { until: 9.23, name: 'First quarter' },
  { until: 12.92, name: 'Waxing gibbous' },
  { until: 16.61, name: 'Full moon' },
  { until: 20.3, name: 'Waning gibbous' },
  { until: 23.99, name: 'Last quarter' },
  { until: 27.68, name: 'Waning crescent' },
  { until: Infinity, name: 'New moon' },
]

export const moonPhase = (date: Date): string => {
  const days = (date.getTime() - KNOWN_NEW_MOON_MS) / DAY_MS
  const age = ((days % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS
  return PHASES.find((phase) => age < phase.until)!.name
}