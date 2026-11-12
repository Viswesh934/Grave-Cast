import type { BrowserSupport, RiteSupport } from 'groove-ui';

const ENGINES = [
  { key: 'chromium', label: 'Chrome & Edge' },
  { key: 'firefox', label: 'Firefox' },
  { key: 'safari', label: 'Safari' },
] as const;

const LEVEL: Record<BrowserSupport, { mark: string; words: string; className: string }> = {
  full: { mark: '✓', words: 'works', className: 'border-emerald-700/60 text-emerald-300' },
  partial: { mark: '~', words: 'works in part', className: 'border-amber-600/60 text-amber-300' },
  none: { mark: '✕', words: 'not supported', className: 'border-rose-700/60 text-rose-300' },
};

/** Which browsers a rite works in, readable without relying on color. */
export function SupportChips({ support }: { support: RiteSupport }) {
  return (
    <div className="space-y-1">
      <ul aria-label="Browser support" className="flex flex-wrap gap-1.5">
        {ENGINES.map(({ key, label }) => {
          const level = LEVEL[support[key]];
          return (
            <li key={key} className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${level.className}`}>
              <span aria-hidden="true">{level.mark} </span>
              {label}
              <span className="sr-only">: {level.words}</span>
            </li>
          );
        })}
      </ul>
      {support.note && <p className="m-0 text-xs text-stone-400">{support.note}</p>}
    </div>
  );
}
