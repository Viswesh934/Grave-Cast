import { createPortal } from 'react-dom'
import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  BroomProgress,
  TombstoneCard,
  useAriaAnnounce,
  useHorrorFallback,
  usePageVisible,
  useRafLoop,
  useReducedMotion,
  useSpookyAudio,
  zLayers,
  type SpookySound,
  type TombstoneWeathering,
} from 'groove-ui'
import type { ScanSummary, StoryGrave } from './graves'

const StoryStone3D = lazy(() => import('./StoryStone3D'))

/** How long each grave stays before the next one rises. */
const STORY_MS = 6500
/** A press shorter than this is a tap (next or previous); longer is a hold (pause). */
const TAP_MS = 250

const RISE_SOUND: Record<TombstoneWeathering, SpookySound> = {
  crumbling: 'boneCrack',
  cracked: 'stoneGrind',
  aged: 'shovelScrape',
  pristine: 'stoneTap',
}

type Frame = { kind: 'grave'; grave: StoryGrave } | { kind: 'end' }

export interface GraveStoriesProps {
  summary: ScanSummary
  onClose: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The graveyard as stories: each grave rises in turn while the witch flies
 * along the bar, and the last story says what wasn't checked.
 */
export function GraveStories({ summary, onClose }: GraveStoriesProps) {
  const frames: Frame[] = [...summary.graves.map((grave): Frame => ({ kind: 'grave', grave })), { kind: 'end' }]
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [held, setHeld] = useState(false)
  const [paused, setPaused] = useState(false)
  const visible = usePageVisible()
  const reduced = useReducedMotion()
  const flat = useHorrorFallback()
  const { playSound } = useSpookyAudio()
  const { announce } = useAriaAnnounce()
  const dialog = useRef<HTMLDivElement>(null)
  const pressedAt = useRef(0)
  const elapsed = useRef(0)
  const frame = frames[index]
  const last = index === frames.length - 1

  const go = (next: number) => {
    const target = Math.min(Math.max(0, next), frames.length - 1)
    if (target === index) return
    elapsed.current = 0
    setIndex(target)
    setProgress(0)
  }

  useRafLoop(
    ({ delta }) => {
      elapsed.current += delta / STORY_MS
      if (elapsed.current >= 1) {
        elapsed.current = 0
        setIndex((i) => Math.min(i + 1, frames.length - 1))
      }
      setProgress(elapsed.current)
    },
    { enabled: !last && !held && !paused && visible },
  )

  useEffect(() => {
    dialog.current?.focus()
    playSound('witchCackle', 0.25)
  }, [playSound])

  useEffect(() => {
    if (frame.kind === 'grave') {
      playSound(RISE_SOUND[frame.grave.weathering], 0.45)
      announce(`${index + 1} of ${frames.length}. ${frame.grave.title}. ${frame.grave.label}.`)
    } else {
      playSound('owlHoot', 0.3)
      announce('The last story: what wasn\u2019t checked.')
    }
    // The frame changes only with the index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onClose()
    else if (event.key === 'ArrowRight') go(index + 1)
    else if (event.key === 'ArrowLeft') go(index - 1)
    else if (event.key === ' ' && event.target === event.currentTarget) {
      event.preventDefault()
      setPaused((p) => !p)
    } else return
  }

  const onPointerDown = () => {
    pressedAt.current = performance.now()
    setHeld(true)
  }
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    setHeld(false)
    if (performance.now() - pressedAt.current > TAP_MS) return
    const box = event.currentTarget.getBoundingClientRect()
    go(event.clientX - box.left < box.width / 3 ? index - 1 : index + 1)
  }

  // Rendered at the end of the page, so the site's top bar can't sit above it.
  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`The graveyard of ${summary.subject}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="grave-grove fixed inset-0 flex flex-col bg-grave-dark-950 outline-none"
      style={{ zIndex: zLayers.modal }}
    >
      <div className="px-4 pt-4 sm:px-10">
        <BroomProgress count={frames.length} index={index} progress={last ? 1 : progress} label="Graves" />
        <div className="mt-3 flex items-center gap-4 text-xs tracking-[0.3em] text-grave-mist-400 uppercase">
          <span className="min-w-0 flex-1 truncate font-mono tracking-normal normal-case">{summary.subject}</span>
          <span>
            <span className="text-grave-grove-glow">{pad(index + 1)}</span> / {pad(frames.length)}
          </span>
          {!last && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? 'Play the graves' : 'Pause the graves'}
              title={paused ? 'Play' : 'Pause'}
              className="grid size-8 cursor-pointer place-items-center rounded-full border border-grave-dark-600 bg-transparent text-grave-bone-200 hover:border-grave-mist-400 aria-pressed:border-grave-grove-glow aria-pressed:text-grave-grove-glow"
            >
              <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="currentColor">
                {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" />}
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the graveyard"
            title="Close the graveyard"
            className="grid size-8 cursor-pointer place-items-center rounded-full border border-grave-dark-600 bg-transparent text-grave-bone-200 hover:border-grave-mist-400"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3 13 13 M13 3 3 13" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="grid min-h-0 flex-1 cursor-pointer select-none md:grid-cols-[1.15fr_1fr]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setHeld(false)}
      >
        <div className="relative min-h-[38vh]" aria-hidden="true">
          {flat ? (
            frame.kind === 'grave' && (
              <div key={frame.grave.id} className="gc-story-in grid h-full place-items-center p-6">
                <div className="w-full max-w-xs">
                  <TombstoneCard title={frame.grave.title} subtitle={frame.grave.label} weathering={frame.grave.weathering} />
                </div>
              </div>
            )
          ) : (
            <Suspense fallback={null}>
              <StoryStone3D grave={frame.kind === 'grave' ? frame.grave : null} still={reduced} />
            </Suspense>
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 overflow-y-auto px-6 py-8 sm:px-12" aria-live="polite">
          {frame.kind === 'grave' ? (
            <div key={frame.grave.id} className="gc-story-in space-y-4">
              <p className="m-0 text-xs tracking-[0.3em] text-grave-grove-glow uppercase">{frame.grave.label}</p>
              <h2 className="m-0 font-serif text-4xl leading-tight text-grave-bone-100 italic">{frame.grave.title}</h2>
              <p className="m-0 max-w-lg text-lg leading-relaxed text-grave-mist-300">{frame.grave.detail}</p>
              {frame.grave.href ? (
                <a
                  href={frame.grave.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  className="inline-block font-mono text-sm break-all text-grave-bone-200 underline decoration-grave-dark-600 underline-offset-4 hover:text-grave-bone-100"
                >
                  {frame.grave.evidence}
                </a>
              ) : (
                <p className="m-0 font-mono text-sm break-all text-grave-bone-200">{frame.grave.evidence}</p>
              )}
            </div>
          ) : (
            <div key="end" className="gc-story-in space-y-5">
              <p className="m-0 text-xs tracking-[0.3em] text-grave-grove-glow uppercase">The last story</p>
              <h2 className="m-0 font-serif text-4xl leading-tight text-grave-bone-100 italic">{summary.verdict}</h2>
              <ul className="m-0 list-none space-y-1 p-0 text-grave-mist-300">
                {summary.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
              <div>
                <h3 className="m-0 text-sm font-semibold text-grave-bone-100">Not checked</h3>
                <ul className="mt-2 mb-0 list-disc space-y-1 pl-5 text-sm text-grave-mist-300">
                  {summary.notChecked.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              {summary.note && <p className="m-0 max-w-lg text-sm text-grave-mist-400">{summary.note}</p>}
            </div>
          )}
          <p className="m-0 mt-auto pt-6 text-xs text-grave-mist-400">
            Tap the right side for the next grave, the left for the one before. Hold to pause. Arrow keys work too.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
