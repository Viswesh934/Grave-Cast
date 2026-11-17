import { useCallback, useEffect, useRef, useState } from 'react'
import { playRtty, rttyDurationMs, rttySegments, speak, startRadioStatic, toBaudot, type RadioStatic, type SignalPlayback } from 'groove-ui/signal'
import type { ShownMessage } from '../chat/useChat'

/** The most characters of one message that are played. At 45.45 baud, 160 characters take about half a minute. */
export const MAX_PLAYED_CHARS = 160

/** What a message will sound like: the text that is played, how long it takes, and what is left out. */
export interface Sound {
  /** How many characters are left out because Baudot has no code for them. */
  skipped: number
  /** Whether the message is longer than {@link MAX_PLAYED_CHARS}. */
  cut: boolean
  /** How long it plays, in seconds. */
  seconds: number
  segments: ReturnType<typeof rttySegments>
}

/** How the radio gives a message: read aloud in English, or played as RTTY tones. */
export type RadioMode = 'voice' | 'tones'

/** What the voice says for a message: who it is from, then the message. */
export const spokenText = (message: ShownMessage): string => `From ${message.mine ? 'you' : message.from}. ${message.body}`

/** Works out the sound of a message without playing it. */
export const soundOf = (body: string): Sound => {
  const { codes, skipped } = toBaudot(body.slice(0, MAX_PLAYED_CHARS))
  const segments = rttySegments(codes)
  return { skipped, cut: body.length > MAX_PLAYED_CHARS, seconds: Math.round(rttyDurationMs(segments) / 1000), segments }
}

/**
 * The radio's sound, in `mode`: read aloud in English, or played as RTTY tones. While it is `on`:
 * - a quiet hiss plays, so you can hear the set is running, and fades under each message;
 * - the newest message on the tuned channel plays when the radio is turned on or tuned;
 * - after that, every new message on the channel plays by itself, one at a time,
 *   including your own once it has been sent.
 * Any message can also be replayed by hand, on or off, at `volume` (0 to 1).
 *
 * Browsers keep sound off until the user taps, so turn it on from a tap.
 * When the user turns it off, call `stop` as well, so what is playing falls silent.
 */
export function useRadioPlayer(messages: readonly ShownMessage[], on: boolean, channel: string, volume: number, mode: RadioMode) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const current = useRef<SignalPlayback | null>(null)
  const hiss = useRef<RadioStatic | null>(null)
  const queue = useRef<ShownMessage[]>([])
  // Messages already played or passed over, so each one plays once. Messages waiting to send are never added, so they play once sent.
  const heard = useRef<Set<string>>(new Set())
  // The channel the radio last tuned in to while on, or null while off.
  const tunedTo = useRef<string | null>(null)
  const loudness = useRef(volume)
  const modeNow = useRef(mode)
  const busy = useRef(false)
  // Plays the next queued message, if nothing is playing. Kept in a ref so a message that ends can call it.
  const advance = useRef<() => void>(() => {})

  useEffect(() => {
    loudness.current = volume
    hiss.current?.setVolume(volume)
  }, [volume])

  useEffect(() => {
    modeNow.current = mode
  }, [mode])

  const start = useCallback((message: ShownMessage) => {
    current.current?.stop()
    busy.current = true
    setPlayingId(message.msgid)
    hiss.current?.duck(true)
    const onEnd = () => {
      busy.current = false
      current.current = null
      setPlayingId(null)
      hiss.current?.duck(false)
      advance.current()
    }
    const playback =
      modeNow.current === 'voice'
        ? speak(spokenText(message), { volume: loudness.current, onEnd })
        : playRtty(soundOf(message.body).segments, { volume: loudness.current, onEnd })
    if (!playback) {
      busy.current = false
      setPlayingId(null)
      hiss.current?.duck(false)
      return
    }
    current.current = playback
  }, [])

  useEffect(() => {
    advance.current = () => {
      const next = queue.current.shift()
      if (next) start(next)
    }
  }, [start])

  const stop = useCallback(() => {
    queue.current = []
    current.current?.stop()
    current.current = null
    busy.current = false
    setPlayingId(null)
    hiss.current?.duck(false)
  }, [])

  /** Plays one message now, or stops it if it is the one playing. */
  const play = useCallback(
    (message: ShownMessage) => {
      if (busy.current && playingId === message.msgid) {
        stop()
        return
      }
      queue.current = []
      start(message)
    },
    [playingId, start, stop],
  )

  // The hiss runs exactly while the radio is on.
  useEffect(() => {
    if (!on) return
    hiss.current = startRadioStatic({ volume: loudness.current })
    return () => {
      hiss.current?.stop()
      hiss.current = null
    }
  }, [on])

  useEffect(() => {
    if (!on) {
      tunedTo.current = null
      queue.current = []
      return
    }
    const sent = messages.filter((m) => !m.pending)
    if (tunedTo.current !== channel) {
      // Just turned on, or just tuned: the backlog counts as heard, and the newest message plays once.
      tunedTo.current = channel
      queue.current = []
      heard.current = new Set(sent.map((m) => m.msgid))
      const newest = sent.at(-1)
      if (newest) queue.current.push(newest)
    } else {
      for (const message of sent) {
        if (heard.current.has(message.msgid)) continue
        heard.current.add(message.msgid)
        queue.current.push(message)
      }
    }
    if (!busy.current) advance.current()
  }, [on, messages, channel])

  // Leaving the page silences it.
  useEffect(
    () => () => {
      queue.current = []
      current.current?.stop()
    },
    [],
  )

  return { playingId, play, stop }
}
