import { useCallback, useState } from 'react'
import { useAriaAnnounce } from 'groove-ui'
import { markGamesFound, useGamesFound } from '../site/gamesFound'

/** The games in the easter egg. */
export type Game = 'ghost' | 'backwards'

/**
 * The website's easter egg. A right answer to one of the diary's riddles
 * reveals a ghost button beside the Scribble pen; it opens a list of two games.
 * A wrong answer reveals nothing. Finding them in the docs counts too.
 */
export function useGamesEgg() {
  const found = useGamesFound()
  const [game, setGame] = useState<Game | null>(null)
  const { announce } = useAriaAnnounce()

  const reveal = useCallback(() => {
    if (markGamesFound()) announce('Something has appeared in the top bar, beside the pen.')
  }, [announce])

  return { found, game, open: game !== null, reveal, pick: setGame, close: () => setGame(null) }
}
