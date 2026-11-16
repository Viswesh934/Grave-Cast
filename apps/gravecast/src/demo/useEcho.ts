import { useEffect, useRef, useState } from 'react'
import { fetchEcho, type ChannelMessage } from '../shared/channel'

export type EchoState = 'loading' | 'live' | 'trouble'

/** How many messages the screen keeps. */
const KEEP = 50

const merge = (known: readonly ChannelMessage[], fresh: readonly ChannelMessage[]): ChannelMessage[] => {
  const byId = new Map(known.map((m) => [m.msgid, m]))
  for (const message of fresh) byId.set(message.msgid, message)
  return [...byId.values()].sort((a, b) => b.seq - a.seq).slice(0, KEEP)
}

/** Watches one echo: the newest messages first, checked every few seconds while the page is showing. */
export function useEcho(area: string, intervalMs = 3000) {
  const [messages, setMessages] = useState<ChannelMessage[]>([])
  const [state, setState] = useState<EchoState>('loading')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const cursor = useRef(0)
  const busy = useRef(false)

  useEffect(() => {
    let live = true
    const controller = new AbortController()
    const check = async () => {
      if (busy.current || document.visibilityState !== 'visible') return
      busy.current = true
      const result = await fetchEcho(area, cursor.current, controller.signal)
      busy.current = false
      if (!live) return
      if (!result.ok) {
        setState('trouble')
        return
      }
      cursor.current = result.value.cursor
      if (result.value.messages.length > 0) setMessages((known) => merge(known, result.value.messages))
      setUpdatedAt(result.value.serverTime)
      setState('live')
    }
    void check()
    const timer = window.setInterval(() => void check(), intervalMs)
    document.addEventListener('visibilitychange', check)
    return () => {
      live = false
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', check)
    }
  }, [area, intervalMs])

  return { messages, state, updatedAt }
}