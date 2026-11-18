import { createPortal } from 'react-dom'
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  useAriaAnnounce,
  useHorrorFallback,
  useReducedMotion,
  useSpookyAudio,
  zLayers,
  type GraveyardWalk3DGrave,
  type SpookySound,
  type TombstoneWeathering,
} from 'groove-ui'
import { fileName } from '../repograve/markerWords'
import { GraveRow } from './GraveRow'
import type { ScanSummary, StoryGrave } from './graves'

const GraveyardWalkScene = lazy(() => import('./GraveyardWalkScene'))

const ARRIVE_SOUND: Record<TombstoneWeathering, SpookySound> = {
  crumbling: 'boneCrack',
  cracked: 'stoneGrind',
  aged: 'shovelScrape',
  pristine: 'stoneTap',
}

/** What is carved under a stone's title: the file for a repo, the kind of finding for a link. */
const engraving = (summary: ScanSummary, grave: StoryGrave): string => (summary.mode === 'dev' ? fileName(grave.evidence) : grave.label)

/** What the person reads above a grave once the witch is beside it: which file, and what is wrong there. */
function GraveCard({ summary, grave, index, count }: { summary: ScanSummary; grave: StoryGrave; index: number; count: number }) {
  return (
    <div className="mb-3 w-[min(22rem,80vw)] rounded-xl border border-grave-grove-glow/50 bg-grave-dark-950/90 p-4 text-left shadow-lg shadow-black/60 backdrop-blur-sm">
      <p className="m-0 text-[0.65rem] tracking-[0.25em] text-grave-grove-glow uppercase">
        Grave {index + 1} of {count} {'\u00b7'} {grave.label}
      </p>
      <p className="mt-1 mb-0 font-serif text-2xl leading-tight text-grave-bone-100 italic">{grave.title}</p>
      <p className="mt-3 mb-0 text-[0.65rem] tracking-[0.25em] text-grave-mist-400 uppercase">{summary.mode === 'dev' ? 'File' : 'Found in'}</p>
      {grave.href ? (
        <a
          href={grave.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm break-all text-grave-bone-200 underline decoration-grave-dark-600 underline-offset-4 hover:text-grave-bone-100"
        >
          {grave.evidence}
        </a>
      ) : (
        <p className="m-0 font-mono text-sm break-all text-grave-bone-200">{grave.evidence}</p>
      )}
      <p className="mt-3 mb-0 text-[0.65rem] tracking-[0.25em] text-grave-mist-400 uppercase">The problem</p>
      <p className="m-0 text-base leading-relaxed text-grave-mist-200">{grave.detail}</p>
    </div>
  )
}

export interface GraveyardWalkViewProps {
  summary: ScanSummary
  onClose: () => void
}

/**
 * The graveyard as a walk. One grave stands in the yard for each finding. The
 * visitor is the witch, seen from behind as in a third-person game: hold the
 * left mouse button and drag to look around, click a grave to fly to it, and
 * read what is wrong there once she is beside it. The list of graves does the
 * same from the keyboard.
 */
export function GraveyardWalkView({ summary, onClose }: GraveyardWalkViewProps) {
  const [target, setTarget] = useState<number | null>(null)
  const [arrived, setArrived] = useState<number | null>(null)
  const [listOpen, setListOpen] = useState(false)
  const flat = useHorrorFallback()
  const reduced = useReducedMotion()
  const { playSound } = useSpookyAudio()
  const { announce } = useAriaAnnounce()
  const dialog = useRef<HTMLDivElement>(null)
  const count = summary.graves.length

  const stones = useMemo<GraveyardWalk3DGrave[]>(
    () => summary.graves.map((grave) => ({ id: grave.id, title: grave.title, subtitle: engraving(summary, grave), weathering: grave.weathering })),
    [summary],
  )

  useEffect(() => {
    dialog.current?.focus()
    playSound('witchCackle', 0.25)
  }, [playSound])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') onClose()
  }

  const goTo = (index: number) => {
    setArrived(null)
    setTarget(index)
    setListOpen(false)
    const grave = summary.graves[index]
    announce(`Flying to grave ${index + 1} of ${count}: ${grave.title}.`)
  }

  const onArrive = (index: number) => {
    const grave = summary.graves[index]
    setArrived(index)
    playSound(ARRIVE_SOUND[grave.weathering], 0.45)
    announce(`Grave ${index + 1} of ${count}. ${grave.title}. ${grave.evidence}. ${grave.detail}`)
  }

  const going = target !== null && arrived === null ? summary.graves[target] : null

  // Rendered at the end of the page, so the site's top bar can't sit above it.
  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`The graveyard of ${summary.subject}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="grave-grove fixed inset-0 bg-grave-dark-950 outline-none"
      style={{ zIndex: zLayers.modal }}
    >
      {count > 0 && !flat && (
        <div className="absolute inset-0" aria-hidden="true">
          <Suspense fallback={<p className="m-0 grid h-full place-items-center font-serif text-xl text-grave-mist-300 italic">Opening the gate{'\u2026'}</p>}>
            <GraveyardWalkScene
              graves={stones}
              target={target}
              onPick={goTo}
              onArrive={onArrive}
              renderArrived={(index) => <GraveCard summary={summary} grave={summary.graves[index]} index={index} count={count} />}
              still={reduced}
            />
          </Suspense>
        </div>
      )}

      {/* The top bar, over the yard. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-4 bg-gradient-to-b from-grave-dark-950/90 to-transparent px-4 pt-4 pb-10 text-xs tracking-[0.3em] text-grave-mist-300 uppercase sm:px-10">
        <span className="min-w-0 flex-1 truncate font-mono tracking-normal normal-case">{summary.subject}</span>
        <span>
          <span className="text-grave-grove-glow">{count}</span> {count === 1 ? 'grave' : 'graves'}
        </span>
        {count > 0 && !flat && (
          <button
            type="button"
            onClick={() => setListOpen((open) => !open)}
            aria-expanded={listOpen}
            aria-controls="walk-list"
            className="pointer-events-auto min-h-8 cursor-pointer rounded-full border border-grave-dark-600 bg-grave-dark-950/70 px-3 text-xs tracking-[0.2em] text-grave-bone-200 uppercase hover:border-grave-mist-400"
          >
            List
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the graveyard"
          title="Close the graveyard"
          className="pointer-events-auto grid size-8 cursor-pointer place-items-center rounded-full border border-grave-dark-600 bg-grave-dark-950/70 text-grave-bone-200 hover:border-grave-mist-400"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3 13 13 M13 3 3 13" />
          </svg>
        </button>
      </div>

      {/* Before the first grave: what was found, and how to move. */}
      {arrived === null && target === null && (
        <div className="pointer-events-none absolute bottom-6 left-4 max-w-xl space-y-3 rounded-2xl border border-grave-dark-700 bg-grave-dark-950/80 p-5 backdrop-blur-sm sm:left-10">
          <h2 className="m-0 font-serif text-3xl leading-tight text-grave-bone-100 italic">{summary.verdict}</h2>
          {count > 0 && !flat ? (
            <p className="m-0 text-base leading-relaxed text-grave-mist-200">
              You stand at the gate. Each grave is one problem. Hold the left mouse button and drag to look around, then click a grave to fly to it.
            </p>
          ) : (
            count === 0 && <p className="m-0 text-base leading-relaxed text-grave-mist-200">There are no graves to visit.</p>
          )}
        </div>
      )}
      {going && (
        <p role="status" className="pointer-events-none absolute bottom-6 left-4 m-0 rounded-full border border-grave-dark-700 bg-grave-dark-950/80 px-4 py-2 font-serif text-lg text-grave-mist-200 italic sm:left-10">
          Flying to {going.title}{'\u2026'}
        </p>
      )}
      {count > 0 && !flat && (
        <p className="pointer-events-none absolute right-4 bottom-6 m-0 hidden text-xs text-grave-mist-400 sm:right-10 md:block">
          Drag to look {'\u00b7'} Click a grave to go {'\u00b7'} Arrow keys turn {'\u00b7'} Esc closes
        </p>
      )}

      {/* Every grave as a plain list: the keyboard way through the yard, and the whole graveyard without 3D. */}
      {(listOpen || flat) && (
        <section
          id="walk-list"
          aria-label="Every grave"
          className={`absolute overflow-y-auto border-grave-dark-700 bg-grave-dark-950/95 p-5 backdrop-blur-sm ${
            flat ? 'inset-x-0 top-16 bottom-0 sm:px-10' : 'top-16 right-4 bottom-4 w-[min(26rem,calc(100vw-2rem))] rounded-2xl border sm:right-10'
          }`}
        >
          {flat ? (
            <>
              <h2 className="m-0 font-serif text-3xl text-grave-bone-100 italic">{summary.verdict}</h2>
              <ol className="mt-4 mb-0 list-none space-y-3 p-0">
                {summary.graves.map((grave, i) => (
                  <GraveRow key={grave.id} grave={grave} index={i} />
                ))}
              </ol>
            </>
          ) : (
            <ol className="m-0 list-none space-y-2 p-0">
              {summary.graves.map((grave, i) => (
                <li key={grave.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={arrived === i ? 'true' : undefined}
                    className="w-full cursor-pointer rounded-xl border border-grave-dark-700 bg-grave-dark-900/80 px-3 py-2 text-left hover:border-grave-mist-500 aria-[current=true]:border-grave-grove-glow"
                  >
                    <span className="block text-xs tracking-[0.2em] text-grave-mist-400 uppercase">
                      {String(i + 1).padStart(2, '0')} {'\u00b7'} {grave.label}
                    </span>
                    <span className="block font-serif text-lg text-grave-bone-100">{grave.title}</span>
                    <span className="block truncate font-mono text-xs text-grave-mist-300">{grave.evidence}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
          <ul className="mt-5 mb-0 list-none space-y-1 p-0 text-sm text-grave-mist-300">
            {summary.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
          <details className="mt-3 text-sm text-grave-mist-300">
            <summary className="cursor-pointer text-grave-bone-100">Not checked</summary>
            <ul className="mt-2 mb-0 list-disc space-y-1 pl-5">
              {summary.notChecked.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {summary.note && <p className="mt-3 mb-0 text-grave-mist-400">{summary.note}</p>}
          </details>
        </section>
      )}
    </div>,
    document.body,
  )
}
