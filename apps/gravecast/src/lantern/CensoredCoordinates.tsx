import type { ButtonHTMLAttributes } from 'react'
import { splitCoordinates } from './hiddenPosition'

/** One block of the censor bar. */
const BLOCK = '\u2588'

/** The bar: each digit becomes a block, so the shape stays but no number is on the page. */
const censored = (value: string) => value.replace(/[\d.-]/g, BLOCK)

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type' | 'children'>

/**
 * Coordinates, censored until tapped. Tapping shows them, and tapping again
 * censors them. The censored bar holds no digits, so they can't be read or
 * copied off the screen. Other button props pass through.
 */
export function CensoredCoordinates({
  value,
  shown,
  onToggle,
  className = '',
  ...rest
}: { value: string; shown: boolean; onToggle: () => void; className?: string } & ButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={shown}
      aria-label={shown ? `${value}. Tap to censor the coordinates` : 'Coordinates censored. Tap to show them'}
      title={shown ? 'Tap to censor' : 'Tap to show the coordinates'}
      onClick={onToggle}
      className={`inline cursor-pointer rounded-sm border-0 bg-transparent p-0 font-mono focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100 ${
        shown ? 'text-inherit underline decoration-dotted underline-offset-4' : 'tracking-tight text-grave-mist-400'
      } ${className}`}
      {...rest}
    >
      {shown ? value : censored(value)}
    </button>
  )
}

/** A text with any coordinate pairs in it censored, each one tappable to show. */
export function CensoredText({ text, shown, onToggle }: { text: string; shown: boolean; onToggle: () => void }) {
  return (
    <>
      {splitCoordinates(text).map((piece, i) =>
        piece.kind === 'coordinates' ? <CensoredCoordinates key={i} value={piece.text} shown={shown} onToggle={onToggle} /> : <span key={i}>{piece.text}</span>,
      )}
    </>
  )
}
