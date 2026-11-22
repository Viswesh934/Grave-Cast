import { useSyncExternalStore } from 'react'

/**
 * Whether this browser has found the easter egg games. A right answer to a
 * diary riddle finds them, on the home page or on the HauntedDiary docs page,
 * and every part of the site that hides the games follows this one flag.
 */
const FOUND_KEY = 'gravecast-ghost-run-found'
/** Sent on this page when the games are found, so everything showing them updates at once. */
const FOUND_EVENT = 'gravecast-games-found'

/** Kept when storage is blocked, so the games stay found until the page is reloaded. */
let foundInMemory = false

export const isGamesFound = (): boolean => {
  if (foundInMemory) return true
  try {
    return localStorage.getItem(FOUND_KEY) === 'yes'
  } catch {
    return false
  }
}

/** Marks the games as found. Returns true the first time, false when they already were. */
export const markGamesFound = (): boolean => {
  if (isGamesFound()) return false
  try {
    localStorage.setItem(FOUND_KEY, 'yes')
  } catch {
    foundInMemory = true
  }
  window.dispatchEvent(new Event(FOUND_EVENT))
  return true
}

const subscribe = (onChange: () => void) => {
  window.addEventListener(FOUND_EVENT, onChange)
  // Another tab found them.
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(FOUND_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** Whether the games have been found, kept up to date as soon as they are. */
export const useGamesFound = (): boolean => useSyncExternalStore(subscribe, isGamesFound, () => false)
