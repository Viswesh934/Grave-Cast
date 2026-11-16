import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { openTorch, runLightPattern, SOS_SEGMENTS, useWakeLock, type Torch } from 'groove-ui/signal'
import { ui } from '../ui'

type Mode = 'idle' | 'warning' | 'screen' | 'opening' | 'torch'

/**
 * SOS by light. The torch where the browser allows it; otherwise the whole
 * screen, after a warning, at no more than 2 flashes a second.
 */
export function SosLightTool() {
  const [mode, setMode] = useState<Mode>('idle')
  const [lit, setLit] = useState(false)
  const [torch, setTorch] = useState<Torch | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const stopButton = useRef<HTMLButtonElement>(null)
  useWakeLock(mode === 'screen' || mode === 'torch')

  // The screen light: flashes until stopped, and Escape stops it too.
  useEffect(() => {
    if (mode !== 'screen') return
    const run = runLightPattern(SOS_SEGMENTS, setLit)
    stopButton.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMode('idle')
    window.addEventListener('keydown', onKey)
    return () => {
      run.stop()
      window.removeEventListener('keydown', onKey)
    }
  }, [mode])

  // The torch: flashes until stopped, then lets go of the camera.
  useEffect(() => {
    if (mode !== 'torch' || !torch) return
    const run = runLightPattern(SOS_SEGMENTS, (on) => void torch.set(on).catch(() => undefined))
    return () => {
      run.stop()
      torch.close()
    }
  }, [mode, torch])

  const startTorch = async () => {
    setNote(null)
    setMode('opening')
    const opened = await openTorch()
    if (!opened) {
      setMode('idle')
      setNote('This phone\u2019s browser can\u2019t use the torch. Use the screen light instead.')
      return
    }
    setTorch(opened)
    setMode('torch')
  }
  const stop = () => {
    setMode('idle')
    setTorch(null)
  }

  return (
    <>
      <p role="status" className="m-0 text-lg font-semibold text-grave-bone-100">
        {mode === 'torch' ? 'Flashing SOS with the torch.' : mode === 'opening' ? 'Opening the torch\u2026' : 'Off.'}
      </p>
      {note && <p className={`${ui.muted} mt-2 mb-0`}>{note}</p>}

      {mode === 'torch' ? (
        <button type="button" onClick={stop} className={`${ui.bigStop} mt-6`}>
          Stop
        </button>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => void startTorch()} disabled={mode === 'opening'} className={ui.big}>
            Torch
          </button>
          <button type="button" onClick={() => setMode('warning')} disabled={mode === 'opening'} className={ui.bigAlt}>
            Screen light
          </button>
        </div>
      )}

      {mode === 'warning' && (
        <div role="alertdialog" aria-labelledby="flash-warning" className={`${ui.card} mt-6`}>
          <p id="flash-warning" className="m-0 text-lg font-semibold text-grave-bone-100">
            The whole screen will flash white, about 2 times a second.
          </p>
          <p className={`${ui.muted} mt-1 mb-0`}>If flashing light affects you, use the torch or ask someone else. Turn the screen brightness all the way up.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => setMode('screen')} className={ui.primary}>
              Start flashing
            </button>
            <button type="button" onClick={() => setMode('idle')} className={ui.secondary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className={`${ui.muted} mt-6 mb-0`}>
        SOS in Morse code is three short, three long, three short: {'\u2022\u2022\u2022 \u2014\u2014\u2014 \u2022\u2022\u2022'}. The torch works only in some browsers, such as Chrome on Android.
      </p>

      {mode === 'screen' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="SOS screen light"
            className={`fixed inset-0 flex items-end justify-center p-6 ${lit ? 'bg-grave-bone-100' : 'bg-grave-dark-950'}`}
          >
            <button ref={stopButton} type="button" onClick={stop} className={`${ui.bigStop} max-w-md`}>
              Stop
            </button>
          </div>,
          document.body,
        )}
    </>
  )
}
