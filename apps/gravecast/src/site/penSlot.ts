import { useEffect, useState } from 'react'

/** The id of the slot at the right end of the top bar where the home page's Scribble pen lives. */
export const PEN_SLOT_ID = 'gc-pen-slot'

/** The id of the slot beside the pen, where the Ghost run button appears once it has been found. */
export const GAME_SLOT_ID = 'gc-game-slot'

/** A slot in the top bar, once it is on the page. */
export function useTopBarSlot(id: string): HTMLElement | null {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setSlot(document.getElementById(id))
  }, [id])
  return slot
}

/** The pen's slot in the top bar, once it is on the page. */
export function usePenSlot(): HTMLElement | null {
  return useTopBarSlot(PEN_SLOT_ID)
}
