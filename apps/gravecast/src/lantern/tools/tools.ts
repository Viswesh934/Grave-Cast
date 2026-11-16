/**
 * Lantern's tools: the list, their numbers, and the small pure helpers behind
 * them. Draft: the numbers here are checked against their sources before a
 * production release (vision doc §9).
 */

/** Every tool is a draft for now (vision doc §9). */
export const TOOLS_NOTICE = 'Draft tool, for testing. Always follow official guidance and your local emergency services.'

export type ToolSlug = 'sos-light' | 'sos-sound' | 'cpr-beat' | 'compass' | 'lightning' | 'help-message'

export interface ToolInfo {
  slug: ToolSlug
  name: string
  /** One short line: what it does. */
  summary: string
}

export const TOOLS: readonly ToolInfo[] = [
  { slug: 'sos-light', name: 'SOS light', summary: 'Flashes SOS with the torch or the screen.' },
  { slug: 'sos-sound', name: 'SOS sound', summary: 'A loud whistle, or SOS in beeps.' },
  { slug: 'cpr-beat', name: 'CPR beat', summary: 'Keeps the pace for chest pushes.' },
  { slug: 'help-message', name: 'Help message', summary: 'Your location in a text, ready to send.' },
  { slug: 'compass', name: 'Compass and level', summary: 'Which way you face, and how level the phone is.' },
  { slug: 'lightning', name: 'Lightning distance', summary: 'How far away the lightning is.' },
]

export const findTool = (slug: string | undefined): ToolInfo | undefined => TOOLS.find((tool) => tool.slug === slug)

/** CPR: pushes per minute (inside the 100 to 120 that guidelines give), and when to swap who pushes. */
export const CPR = {
  beatsPerMinute: 110,
  swapEverySeconds: 120,
} as const

/** Lightning: sound takes about 5 seconds to travel a mile (US National Weather Service), so about 3 seconds a kilometre. */
export const LIGHTNING = {
  secondsPerMile: 5,
  secondsPerKm: 3,
} as const

export interface LightningDistance {
  seconds: number
  km: number
  miles: number
}

/** Rough distance to a lightning strike from the time between the flash and the thunder. */
export const lightningDistance = (milliseconds: number): LightningDistance => {
  const seconds = Math.max(0, milliseconds) / 1000
  return { seconds, km: seconds / LIGHTNING.secondsPerKm, miles: seconds / LIGHTNING.secondsPerMile }
}

/** Minutes and seconds, as 1:05. */
export const formatClock = (totalSeconds: number): string => {
  const whole = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

/** A position from the phone's GPS. */
export interface Fix {
  lat: number
  lon: number
  /** How far off it may be, in metres. */
  accuracy: number
}

/** Decimal places for a shared position: 5 is about a metre, plenty for finding someone. */
const POSITION_DECIMALS = 5

/** The help text: the person's words, then where and when, with a map link anyone can open. */
export const helpMessageText = (words: string, fix: Fix | null, at: Date): string => {
  const parts = [words.trim() || 'I need help.']
  if (fix) {
    const lat = fix.lat.toFixed(POSITION_DECIMALS)
    const lon = fix.lon.toFixed(POSITION_DECIMALS)
    parts.push(`I am at ${lat}, ${lon} (within about ${Math.round(fix.accuracy)} m).`)
    parts.push(`Map: https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`)
  } else {
    parts.push('My phone could not find my location.')
  }
  parts.push(`Written ${at.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.`)
  return parts.join(' ')
}

/** A link that opens the phone's SMS app with the text filled in. The person picks who to send it to. */
export const smsLink = (text: string): string => `sms:?&body=${encodeURIComponent(text)}`
