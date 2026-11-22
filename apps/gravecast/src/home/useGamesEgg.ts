import { useCallback, useState } from 'react'
import { useAriaAnnounce } from 'groove-ui'

/** The games in the easter egg. */
export type Game = 'ghost' | 'backwards'

/** Whether this browser has found the games. Once found, the button stays. */
const FOUND_KEY = 'gravecast-ghost-run-found'

const readFound = (): boolean => {
  try {
    return localStorage.getItem(FOUND_KEY) === 'yes'
  } catch {
    return false
  }
}

/**
 * The website's easter egg. A right answer to one of the diary's riddles
 * reveals a ghost button beside the Scribble pen; it opens a list of two games.
 * A wrong answer reveals nothing.
 */
export function useGamesEgg() {
  const [found, setFound] = useState(readFound)
  const [game, setGame] = useState<Game | null>(null)
  const { announce } = useAriaAnnounce()

  const reveal = useCallback(() => {
    if (found) return
    setFound(true)
    try {
      localStorage.setItem(FOUND_KEY, 'yes')
    } catch {
      // Storage blocked: the button stays until the page is reloaded.
    }
    announce('Something has appeared in the top bar, beside the pen.')
  }, [announce, found])

  return { found, game, open: game !== null, reveal, pick: setGame, close: () => setGame(null) }
}
