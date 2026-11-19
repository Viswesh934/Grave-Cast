import { useEffect, useState } from 'react'

/** The id of the slot at the right end of the top bar where the home page's Scribble pen lives. */
export const PEN_SLOT_ID = 'gc-pen-slot'

/** The pen's slot in the top bar, once it is on the page. */
export function usePenSlot(): HTMLElement | null {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setSlot(document.getElementById(PEN_SLOT_ID))
  }, [])
  return slot
}
