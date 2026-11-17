/**
 * Access settings, kept on this phone in local storage, so they are there before
 * anything else loads and work with no internet. Changing one tells the rest of
 * Lantern at once, so the distress signal's triggers follow the switches.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

const KEYS = {
  vibrate: 'lantern.access.vibrate',
  shake: 'lantern.access.distress.shake',
  taps: 'lantern.access.distress.taps',
  sound: 'lantern.access.distress.sound',
  contact: 'lantern.access.helpContact',
  mode: 'lantern.access.lastMode',
} as const

/** Sent on `window` whenever a setting changes. */
export const SETTINGS_EVENT = 'lantern:access-settings'

/** A short buzz, a gap, and a second buzz: easy to tell apart from a phone's own alerts. In milliseconds. */
export const MESSAGE_BUZZ: readonly number[] = [180, 120, 180]
/** A single short buzz, to confirm a finger has found a control. */
export const FOUND_BUZZ: readonly number[] = [40]

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Private browsing can refuse storage. The setting then lasts for this visit only.
  }
  window.dispatchEvent(new Event(SETTINGS_EVENT))
}

/** One stored setting as React state, kept in step when it changes anywhere in Lantern. */
function useStored<T>(get: () => T, set: (value: T) => void) {
  const [value, setValue] = useState(get)
  useEffect(() => {
    const sync = () => setValue(get())
    window.addEventListener(SETTINGS_EVENT, sync)
    return () => window.removeEventListener(SETTINGS_EVENT, sync)
  }, [get])
  const update = useCallback((next: T) => set(next), [set])
  return [value, update] as const
}

/** Whether this browser can vibrate the phone. iPhone browsers can't. */
export const canVibrate = (): boolean => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

/** Buzzes the phone, if it can. */
export const buzz = (pattern: readonly number[]) => {
  if (canVibrate()) navigator.vibrate([...pattern])
}

// Vibrate for new messages
export const vibrateOnMessages = (): boolean => read(KEYS.vibrate) === '1'
const setVibrate = (on: boolean) => write(KEYS.vibrate, on ? '1' : null)
export const useVibrateSetting = () => useStored(vibrateOnMessages, setVibrate)

// Distress signal triggers, both off until the person turns them on
export const shakeTrigger = (): boolean => read(KEYS.shake) === '1'
const setShake = (on: boolean) => write(KEYS.shake, on ? '1' : null)
export const useShakeSetting = () => useStored(shakeTrigger, setShake)

export const tapsTrigger = (): boolean => read(KEYS.taps) === '1'
const setTaps = (on: boolean) => write(KEYS.taps, on ? '1' : null)
export const useTapsSetting = () => useStored(tapsTrigger, setTaps)

/** Loud: spoken help and the SOS tone. Silent: vibration and the screen only, for when noise is dangerous. */
export type DistressSound = 'loud' | 'silent'
export const distressSound = (): DistressSound => (read(KEYS.sound) === 'silent' ? 'silent' : 'loud')
const setSound = (sound: DistressSound) => write(KEYS.sound, sound === 'silent' ? 'silent' : null)
export const useSoundSetting = () => useStored(distressSound, setSound)

/** The phone number the help text goes to. Kept on this phone only. */
export const helpContact = (): string => read(KEYS.contact) ?? ''
const setContact = (number: string) => write(KEYS.contact, number.trim() || null)
export const useContactSetting = () => useStored(helpContact, setContact)

/** The Access mode used last, so the spoken help message fits the person. */
export type AccessMode = 'blind' | 'deaf'
export const lastMode = (): AccessMode | null => {
  const saved = read(KEYS.mode)
  return saved === 'blind' || saved === 'deaf' ? saved : null
}
export const rememberMode = (mode: AccessMode) => {
  if (lastMode() !== mode) write(KEYS.mode, mode)
}

/**
 * Buzzes when a new message from someone else arrives, if the person turned that on.
 * Messages already there when the page opens don't count.
 */
export function useBuzzOnNewMessages(messages: readonly { msgid: string; mine: boolean; pending: boolean }[]) {
  const seen = useRef<Set<string> | null>(null)
  useEffect(() => {
    const sent = messages.filter((m) => !m.pending)
    if (seen.current === null) {
      seen.current = new Set(sent.map((m) => m.msgid))
      return
    }
    let fresh = false
    for (const message of sent) {
      if (seen.current.has(message.msgid)) continue
      seen.current.add(message.msgid)
      if (!message.mine) fresh = true
    }
    if (fresh && vibrateOnMessages()) buzz(MESSAGE_BUZZ)
  }, [messages])
}
