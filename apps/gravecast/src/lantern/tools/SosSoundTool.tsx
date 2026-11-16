import { useEffect, useRef, useState } from 'react'
import { playAlarmTone, playMorse, SOS_SEGMENTS, useWakeLock, type SignalPlayback } from 'groove-ui/signal'
import { ui } from '../ui'

type Sound = 'whistle' | 'sos'

const LABEL: Record<Sound, string> = {
  whistle: 'Playing a steady whistle.',
  sos: 'Playing SOS in beeps.',
}

/** A loud steady whistle, or SOS in Morse, until stopped. */
export function SosSoundTool() {
  const [playing, setPlaying] = useState<Sound | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const playback = useRef<SignalPlayback | null>(null)
  useWakeLock(playing !== null)

  const stop = () => {
    playback.current?.stop()
    playback.current = null
    setPlaying(null)
  }
  // Sound starts inside the tap itself, because browsers only allow sound after one.
  const start = (sound: Sound) => {
    stop()
    const next = sound === 'whistle' ? playAlarmTone() : playMorse(SOS_SEGMENTS)
    if (!next) {
      setNote('This browser can\u2019t play sound.')
      return
    }
    setNote(null)
    playback.current = next
    setPlaying(sound)
  }
  useEffect(() => () => playback.current?.stop(), [])

  return (
    <>
      <p role="status" className="m-0 text-lg font-semibold text-grave-bone-100">
        {playing ? LABEL[playing] : 'Off.'}
      </p>
      {note && <p className={`${ui.muted} mt-2 mb-0`}>{note}</p>}
      {playing ? (
        <button type="button" onClick={stop} className={`${ui.bigStop} mt-6`}>
          Stop
        </button>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => start('whistle')} className={ui.big}>
            Whistle
          </button>
          <button type="button" onClick={() => start('sos')} className={ui.bigAlt}>
            SOS beeps
          </button>
        </div>
      )}
      <p className={`${ui.muted} mt-6 mb-0`}>Turn the volume all the way up. How loud it is depends on the phone{'\u2019'}s speaker.</p>
    </>
  )
}
