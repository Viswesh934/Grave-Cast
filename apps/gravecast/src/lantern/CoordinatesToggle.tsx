import type { ButtonHTMLAttributes } from 'react'
import { ui } from './ui'

/** The button that shows or hides coordinates on a screen (see `hiddenPosition`). Other button props pass through. */
export function CoordinatesToggle({
  shown,
  onToggle,
  className = ui.quiet,
  ...rest
}: { shown: boolean; onToggle: () => void } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'>) {
  return (
    <button type="button" aria-pressed={shown} onClick={onToggle} className={className} {...rest}>
      {shown ? 'Hide coordinates' : 'Show coordinates'}
    </button>
  )
}