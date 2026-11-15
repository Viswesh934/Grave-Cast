import { useRef, useState } from 'react'
import { useLatest } from 'groove-ui'

/**
 * The diary keeps the visitor busy while a scan runs. It closes once the scan
 * is done and the diary has had its say (or when the visitor closes it), and
 * the result is revealed only after the book has vanished.
 */
export function useDiaryRitual<T>(onReveal: (result: T) => void) {
  const [open, setOpen] = useState(false)
  const result = useRef<{ value: T } | null>(null)
  const settled = useRef(false)
  const vanished = useRef(false)
  const reveal = useLatest(onReveal)

  const start = () => {
    result.current = null
    settled.current = false
    vanished.current = false
    setOpen(true)
  }

  const finish = (value: T) => {
    result.current = { value }
    if (vanished.current) reveal.current(value)
    else if (settled.current) setOpen(false)
  }

  const diaryProps = {
    open,
    onSettled: () => {
      settled.current = true
      if (result.current) setOpen(false)
    },
    onRequestClose: () => setOpen(false),
    onVanished: () => {
      vanished.current = true
      if (result.current) reveal.current(result.current.value)
    },
  }

  return { open, start, finish, diaryProps }
}