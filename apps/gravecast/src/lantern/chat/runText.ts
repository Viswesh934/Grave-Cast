/** Words and times for the status line under Chat and Radio, kept in one place so both say the same thing. */
import type { RunState } from './useChat'

/** What to say about the state of the last mail run. */
export const STATE_TEXT: Record<RunState, string> = {
  idle: '',
  running: 'Checking\u2026',
  offline: 'No connection. Messages wait here and send when it returns.',
  failed: 'Could not send right now. Messages are kept and will try again.',
}

/** A time of day for a status line, or nothing if the time can't be read. */
export const clock = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
