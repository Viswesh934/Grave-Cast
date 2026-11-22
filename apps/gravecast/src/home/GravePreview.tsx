import { forwardRef } from 'react'
import type { TombstoneWeathering } from 'groove-ui'
import type { ScanSummary } from './graves'

const RING_RADIUS = 30
const RING_SEGMENTS_MAX = 40

/** Each arc takes its grave's haunt colour, as in the 3D yard. The count and the list say the same in words. */
const ARC: Record<TombstoneWeathering, string> = {
  crumbling: 'stroke-grave-haunt-serious',
  cracked: 'stroke-grave-haunt-risky',
  aged: 'stroke-grave-haunt-unusual',
  pristine: 'stroke-grave-haunt-note',
}

/** The ring: one arc per grave, in its colour. With no graves, or too many to split, it is one plain ring. */
function StoryRing({ weathering }: { weathering: readonly TombstoneWeathering[] }) {
  const circumference = 2 * Math.PI * RING_RADIUS
  const split = weathering.length > 0 && weathering.length <= RING_SEGMENTS_MAX
  const segments = split ? weathering.length : 1
  const gap = segments > 1 ? Math.min(4, circumference / segments / 3) : 0
  const dash = circumference / segments - gap
  return (
    <svg viewBox="0 0 72 72" className="size-20 shrink-0 -rotate-90" aria-hidden="true">
      {split ? (
        weathering.map((worn, i) => (
          <circle
            key={i}
            cx="36"
            cy="36"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="2.5"
            className={ARC[worn]}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-i * (dash + gap)}
          />
        ))
      ) : (
        <circle cx="36" cy="36" r={RING_RADIUS} fill="none" strokeWidth="2.5" className="stroke-grave-grove-glow" />
      )}
    </svg>
  )
}

const SEVERITY_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  critical: { label: 'critical', badgeClass: 'border-red-500/50 bg-red-950/70 text-red-300' },
  high: { label: 'high', badgeClass: 'border-amber-500/50 bg-amber-950/70 text-amber-300' },
  medium: { label: 'medium', badgeClass: 'border-yellow-500/50 bg-yellow-950/70 text-yellow-300' },
  low: { label: 'low', badgeClass: 'border-cyan-500/50 bg-cyan-950/70 text-cyan-300' },
  info: { label: 'notes', badgeClass: 'border-stone-600/50 bg-stone-900/70 text-stone-300' },
  danger: { label: 'danger', badgeClass: 'border-red-500/50 bg-red-950/70 text-red-300' },
  warning: { label: 'warning', badgeClass: 'border-amber-500/50 bg-amber-950/70 text-amber-300' },
  caution: { label: 'caution', badgeClass: 'border-yellow-500/50 bg-yellow-950/70 text-yellow-300' },
  note: { label: 'note', badgeClass: 'border-stone-600/50 bg-stone-900/70 text-stone-300' },
}

export interface GravePreviewProps {
  summary: ScanSummary
  onOpen: () => void
}

/** A small preview of the graveyard. Opening it plays the graves one after another. */
export const GravePreview = forwardRef<HTMLButtonElement, GravePreviewProps>(({ summary, onOpen }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className="group flex w-full cursor-pointer items-center gap-5 rounded-2xl border border-grave-dark-700 bg-grave-dark-900/70 p-5 text-left backdrop-blur-md transition-colors hover:border-grave-mist-500"
    >
      <span className="relative grid place-items-center">
        <StoryRing weathering={summary.graves.map((grave) => grave.weathering)} />
        <span className="absolute font-serif text-2xl text-grave-bone-100">{summary.graves.length}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-xs break-all text-grave-mist-400 uppercase tracking-wider">{summary.subject}</span>
        <span className="mt-0.5 block font-serif text-2xl text-grave-bone-100 leading-snug">{summary.verdict}</span>
        {summary.severityCounts && Object.keys(summary.severityCounts).length > 0 && (
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            {Object.entries(summary.severityCounts).map(([sev, count]) => {
              const cfg = SEVERITY_CONFIG[sev] ?? { label: sev, badgeClass: 'border-grave-dark-600 bg-grave-dark-900 text-grave-mist-300' }
              return (
                <span
                  key={sev}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] leading-tight ${cfg.badgeClass}`}
                >
                  <span className="font-semibold">{count}</span>
                  <span>{count === 1 && cfg.label.endsWith('s') ? cfg.label.slice(0, -1) : cfg.label}</span>
                </span>
              )
            })}
          </span>
        )}
        <span className="mt-2.5 block text-xs tracking-[0.2em] text-grave-grove-glow uppercase transition-colors group-hover:text-grave-bone-100">
          {summary.graves.length > 0 ? 'Walk the graveyard' : 'See what wasn\u2019t checked'} {'\u2192'}
        </span>
      </span>
    </button>
  )
})
GravePreview.displayName = 'GravePreview'