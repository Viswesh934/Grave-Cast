/** Plain helpers the Access aids and the kit cards share: saying text aloud, and the big card's button style. */
import { speak, speechSupported, type SignalPlayback } from 'groove-ui/signal'

let current: SignalPlayback | null = null

/** Says text with the phone's voice, stopping anything said before. Returns false where the browser can't speak. */
export const say = (text: string, onEnd?: () => void): boolean => {
  current?.stop()
  current = speak(text, { onEnd })
  return current !== null
}

/** Stops speaking. */
export const hush = () => {
  current?.stop()
  current = null
}

export const canSpeak = (): boolean => speechSupported()

/** A button on the big card, in the card's own dark-on-light colours. */
export const bigCardButton =
  'min-h-14 min-w-40 cursor-pointer rounded-xl border-2 border-grave-dark-950 bg-grave-dark-950 px-6 text-lg font-bold text-grave-bone-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-dark-950'
