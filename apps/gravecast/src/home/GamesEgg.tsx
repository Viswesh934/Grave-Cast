import { useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Backwards, GhostIcon, GhostRun, ReverseMark, gameDialogTokens, useEventListener } from 'groove-ui'
import { DIARY_ENTRIES } from '../diary/entries'
import { GAME_SLOT_ID, useTopBarSlot } from '../site/penSlot'
import type { Game } from './useGamesEgg'

const BEST_KEYS: Record<Game, string> = { ghost: 'gravecast-ghost-run-best', backwards: 'gravecast-backwards-best' }

const GAMES: readonly { id: Game; name: string; about: string; icon: ReactNode }[] = [
  { id: 'ghost', name: 'Ghost run', about: 'Drift left, jump the tombstones, collect coins.', icon: <GhostIcon size={gameDialogTokens.iconSize} /> },
  { id: 'backwards', name: 'Backwards', about: 'Type each line with its words in reverse order.', icon: <ReverseMark size={gameDialogTokens.iconSize} /> },
]

/** The diary's riddles, which Backwards mixes in now and then. It keeps only the short ones. */
const DIARY_LINES = DIARY_ENTRIES.filter((entry) => entry.kind === 'riddle').map((entry) => entry.text)

/** The ghost button in the top bar, the list of games it opens, and the game picked. */
export function GamesEgg({ found, game, onPick, onClose }: { found: boolean; game: Game | null; onPick: (game: Game) => void; onClose: () => void }) {
  const slot = useTopBarSlot(GAME_SLOT_ID)
  const [listOpen, setListOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const listId = useId()

  // The list closes on a click outside it, or on Escape (focus goes back to the ghost).
  useEventListener('document', 'pointerdown', (event) => {
    if (listOpen && box.current && !box.current.contains(event.target as Node)) setListOpen(false)
  })

  const choose = (id: Game) => {
    setListOpen(false)
    onPick(id)
  }

  return (
    <>
      {found &&
        slot &&
        createPortal(
          <div
            ref={box}
            className="relative"
            onKeyDown={(event) => {
              if (event.key === 'Escape' && listOpen) {
                event.stopPropagation()
                setListOpen(false)
                toggle.current?.focus()
              }
            }}
          >
            <button
              ref={toggle}
              type="button"
              onClick={() => setListOpen((open) => !open)}
              aria-expanded={listOpen}
              aria-controls={listId}
              aria-label="Games"
              title="Games"
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-grave-dark-600 bg-grave-dark-950/70 text-grave-bone-200 hover:border-grave-mist-400 hover:text-grave-bone-100"
            >
              <GhostIcon size={gameDialogTokens.iconSize} />
            </button>
            {listOpen && (
              <ul
                id={listId}
                aria-label="Games"
                className="absolute right-0 mt-2 w-72 list-none space-y-1 rounded-xl border border-grave-dark-600 bg-grave-dark-950/95 p-2 shadow-lg shadow-black/60 backdrop-blur-sm"
              >
                {GAMES.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      autoFocus={i === 0}
                      onClick={() => choose(item.id)}
                      className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-grave-dark-800 focus-visible:bg-grave-dark-800"
                    >
                      <span className="mt-1 shrink-0 text-grave-grove-glow">{item.icon}</span>
                      <span>
                        <span className="block font-serif text-lg text-grave-bone-100">{item.name}</span>
                        <span className="block text-sm text-grave-mist-300">{item.about}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>,
          slot,
        )}
      <GhostRun open={game === 'ghost'} onClose={onClose} storageKey={BEST_KEYS.ghost} />
      <Backwards open={game === 'backwards'} onClose={onClose} storageKey={BEST_KEYS.backwards} lines={DIARY_LINES} />
    </>
  )
}
