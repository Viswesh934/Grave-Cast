import { forwardRef } from 'react'
import type { ScanSummary } from './graves'

const RING_RADIUS = 30
const RING_SEGMENTS_MAX = 40

/** The ring: one arc per grave. */
function StoryRing({ count }: { count: number }) {
  const circumference = 2 * Math.PI * RING_RADIUS
  const segments = Math.min(count, RING_SEGMENTS_MAX)
  const gap = segments > 1 ? Math.min(4, circumference / segments / 3) : 0
  const dash = circumference / segments - gap
  return (
    <svg viewBox="0 0 72 72" className="size-20 shrink-0 -rotate-90" aria-hidden="true">
      <circle
        cx="36"
        cy="36"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="2.5"
        className="stroke-grave-grove-glow"
        strokeDasharray={count > RING_SEGMENTS_MAX ? undefined : `${dash} ${gap}`}
      />
    </svg>
  )
}

export interface GravePreviewProps {
  summary: ScanSummary
  onOpen: () => void
}

/** A small preview of the graveyard. Opening it plays the graves one after another. */
export const GravePreview = forwardRef<HTMLButtonElement, GravePreviewProps>(({ summary, onOpen }, ref) => {
  const stones = Math.max(1, summary.graves.length)
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className="group flex w-full cursor-pointer items-center gap-5 rounded-2xl border border-grave-dark-700 bg-grave-dark-900/70 p-5 text-left backdrop-blur-md transition-colors hover:border-grave-mist-500"
    >
      <span className="relative grid place-items-center">
        <StoryRing count={stones} />
        <span className="absolute font-serif text-2xl text-grave-bone-100">{summary.graves.length}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-sm break-all text-grave-mist-300">{summary.subject}</span>
        <span className="mt-1 block font-serif text-2xl text-grave-bone-100">{summary.verdict}</span>
        <span className="mt-2 block text-sm tracking-[0.2em] text-grave-grove-glow uppercase transition-colors group-hover:text-grave-bone-100">
          {summary.graves.length > 0 ? 'Walk the graveyard' : 'See what wasn\u2019t checked'} {'\u2192'}
        </span>
      </span>
    </button>
  )
})
GravePreview.displayName = 'GravePreview'