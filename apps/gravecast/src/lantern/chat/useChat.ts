import { useCallback, useEffect, useRef, useState } from 'react'
import { deviceOf, newMsgid, randomHex, type ChannelMessage, type OutboxMessage } from '../../shared/channel'
import { MAX_BODY_CHARS, NICK_PATTERN, SYNC_TAG } from '../../shared/channelContract'
import { getAll, getMeta, readOutbox, setMeta, putOne, type RefusedMessage } from './db'
import { mailRun } from './mailRun'

/** How often Chat checks for new messages while it is open and there is a connection. */
const POLL_MS = 5000

export interface ShownMessage extends OutboxMessage {
  seq: number | null
  receivedAt: string | null
  /** Written here but not yet sent. */
  pending: boolean
  /** Written on this phone. */
  mine: boolean
}

export type RunState = 'idle' | 'running' | 'offline' | 'failed'

/** Messages waiting to send have no place in the server's order yet, so they count as the newest. */
const order = (m: ShownMessage) => m.seq ?? Number.MAX_SAFE_INTEGER
const byNewest = (a: ShownMessage, b: ShownMessage) => order(b) - order(a) || (a.sentAt < b.sentAt ? 1 : -1)

/** Asks the browser to send the outbox when the connection returns, even if the app is closed. */
async function askForBackgroundSend(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker?.getRegistration('/lantern/')
    await (registration as (ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }) | undefined)?.sync?.register(SYNC_TAG)
  } catch {
    // Not supported here: the outbox is sent the next time Chat opens or the connection returns.
  }
}

/** Chat's state: who you are, what has been said, what is waiting, and the mail runs that move it. */
export function useChat(area: string) {
  const [loaded, setLoaded] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [nick, setNickState] = useState<string | null>(null)
  const [stored, setStored] = useState<ChannelMessage[]>([])
  const [outbox, setOutbox] = useState<OutboxMessage[]>([])
  const [refused, setRefused] = useState<RefusedMessage[]>([])
  const [lastRunAt, setLastRunAt] = useState<string | null>(null)
  const [state, setState] = useState<RunState>('idle')
  const [problem, setProblem] = useState<string | null>(null)
  const running = useRef(false)

  const refresh = useCallback(async () => {
    const [messages, waiting, refusedNow, last] = await Promise.all([
      getAll<ChannelMessage>('messages'),
      readOutbox(),
      getMeta<RefusedMessage[]>('refused'),
      getMeta<string>('lastRunAt'),
    ])
    setStored(messages)
    setOutbox(waiting)
    setRefused(refusedNow ?? [])
    setLastRunAt(last ?? null)
  }, [])

  const run = useCallback(async () => {
    if (running.current) return
    if (!navigator.onLine) {
      setState('offline')
      return
    }
    running.current = true
    setState('running')
    try {
      const outcome = await mailRun()
      if (outcome.ok) {
        setState('idle')
        setProblem(null)
      } else {
        // The phone says it is online but the server can't be reached: treat it as offline and try again later.
        setState(outcome.code === 'UNREACHABLE' || outcome.code === 'TIMEOUT' ? 'offline' : 'failed')
        setProblem(outcome.reason)
      }
    } catch {
      setState('failed')
      setProblem('Something went wrong while sending. It will try again.')
    } finally {
      running.current = false
      await refresh()
    }
  }, [refresh])

  // Start: read what is saved on this phone, make a device id the first time, then make a mail run.
  useEffect(() => {
    let live = true
    void (async () => {
      let device = await getMeta<string>('deviceId')
      if (!device) {
        device = randomHex(8)
        await setMeta('deviceId', device)
      }
      const savedNick = await getMeta<string>('nick')
      await refresh()
      if (!live) return
      setDeviceId(device)
      setNickState(savedNick ?? null)
      setLoaded(true)
      void run()
    })()
    return () => {
      live = false
    }
  }, [refresh, run])

  // While Chat is open and visible, check for new messages every few seconds; also when the connection returns.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void run()
    }
    const timer = window.setInterval(tick, POLL_MS)
    const onOnline = () => void run()
    const onOffline = () => setState('offline')
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [run])

  const setNick = useCallback(async (value: string): Promise<string | null> => {
    const clean = value.trim()
    if (!NICK_PATTERN.test(clean)) return 'Use letters and digits, and also spaces, dots, dashes or underscores. Up to 24 characters.'
    await setMeta('nick', clean)
    setNickState(clean)
    return null
  }, [])

  const send = useCallback(
    async (text: string): Promise<string | null> => {
      const body = text.trim()
      if (!nick) return 'Pick a nickname first.'
      if (body === '') return 'Write a message first.'
      if (body.length > MAX_BODY_CHARS) return `Keep it to ${MAX_BODY_CHARS} characters.`
      const message: OutboxMessage = { msgid: newMsgid(deviceId), area, from: nick, body, sentAt: new Date().toISOString() }
      // Into the outbox first. It is safe there even if there is no signal, or the app closes.
      await putOne('outbox', message)
      await refresh()
      void askForBackgroundSend()
      void run()
      return null
    },
    [area, deviceId, nick, refresh, run],
  )

  const dismissRefused = useCallback(async () => {
    await setMeta('refused', [])
    setRefused([])
  }, [])

  const shown: ShownMessage[] = [
    ...stored
      .filter((m) => m.area === area)
      .map((m): ShownMessage => ({ ...m, pending: false, mine: deviceOf(m.msgid) === deviceId })),
    ...outbox.filter((m) => m.area === area).map((m): ShownMessage => ({ ...m, seq: null, receivedAt: null, pending: true, mine: true })),
  ].sort(byNewest)

  return { loaded, nick, setNick, deviceId, messages: shown, waiting: outbox.length, refused, dismissRefused, lastRunAt, state, problem, send, retry: run }
}