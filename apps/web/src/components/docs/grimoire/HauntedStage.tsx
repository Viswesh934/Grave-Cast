import type { FormEvent, MouseEvent } from 'react';

export interface HauntedStageProps {
  /** Receives the stage element, so a rite can be pointed at it. */
  stageRef?: (element: HTMLDivElement | null) => void;
  /** Shows a crosshair while a rite is looking at the page. */
  awake?: boolean;
  /** Name of the region for screen readers. */
  label?: string;
}

/**
 * A small, believable website for rites to work on: headings, links, a
 * button, cards, a form, a list, an image-like block, things that move, and
 * one deliberately faint caption. Nothing in it goes anywhere.
 */
export function HauntedStage({ stageRef, awake = false, label = 'The Hollow Inn, a sample page' }: HauntedStageProps) {
  const stay = (event: MouseEvent) => event.preventDefault();
  const keep = (event: FormEvent) => event.preventDefault();

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={label}
      className={`overflow-hidden rounded-2xl border border-[#2a2433] bg-[#16141c] text-left shadow-2xl ${awake ? 'cursor-crosshair' : ''}`}
    >
      <header className="flex items-center justify-between gap-4 border-b border-[#2a2433] bg-[#1d1a25] px-5 py-3">
        <span className="font-serif text-lg font-bold text-[#efe6d2]">The Hollow Inn</span>
        <nav aria-label="Inn" className="flex gap-4 text-sm">
          <a href="#rooms" onClick={stay} className="text-[#c9bfa8] hover:text-white">Rooms</a>
          <a href="#dining" onClick={stay} className="text-[#c9bfa8] hover:text-white">Dining</a>
          <a href="#crypt" onClick={stay} className="text-[#c9bfa8] hover:text-white">The crypt</a>
        </nav>
      </header>

      <section className="relative space-y-3 px-5 py-6">
        {/* A small ghost that drifts, for rites that watch motion. */}
        <span
          aria-hidden="true"
          className="ghost absolute right-6 top-6 h-10 w-8 animate-bounce rounded-t-full bg-[#efe6d2]/80 shadow-[0_0_18px_rgba(239,230,210,0.35)]"
        />
        <span className="inline-block rounded-full bg-[#2c1d24] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#ff8f9a]">
          Vacancy
        </span>
        <h3 className="title font-serif text-2xl font-bold text-[#f5efe2]">Rooms for the restless</h3>
        <p className="max-w-md text-sm leading-relaxed text-[#b9b0a0]">
          Thirteen candlelit rooms above an old family crypt. Breakfast is served at midnight, and the stairs only
          creak when someone is on them.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7c4fe6]">
            Book a night
          </button>
          <span className="candle inline-flex items-center gap-2 text-xs text-[#c9bfa8]">
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#f5b942] shadow-[0_0_10px_#f5b942]" />
            Candles lit in every room
          </span>
        </div>
      </section>

      <section className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
        <article className="rounded-xl border border-[#2a2433] bg-[#1f1b28] p-4">
          <h4 className="font-semibold text-[#efe6d2]">The Widow’s Suite</h4>
          <p className="mt-1 text-sm text-[#b9b0a0]">A four-poster bed and a mirror that looks back.</p>
        </article>
        <article className="rounded-xl border border-[#2a2433] bg-[#1f1b28] p-4">
          <h4 className="font-semibold text-[#efe6d2]">The Bell Tower</h4>
          <p className="mt-1 text-sm text-[#b9b0a0]">Quiet, except at three in the morning.</p>
        </article>
      </section>

      <section className="grid items-end gap-4 border-t border-[#2a2433] px-5 py-5 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <ul className="tonight space-y-1 text-sm text-[#b9b0a0]">
            <li>Séance in the parlour, eleven at night</li>
            <li>Bell tower tour, three in the morning</li>
          </ul>
          <form onSubmit={keep} className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs text-[#c9bfa8]">
              Your name
              <input
                name="guest"
                placeholder="Unnamed guest"
                className="rounded-md border border-[#3a3047] bg-[#0f0d14] px-2 py-1 text-sm text-[#efe6d2] placeholder:text-[#8f8799]"
              />
            </label>
            <button type="submit" className="rounded-md border border-[#3a3047] px-3 py-1 text-sm text-[#efe6d2] hover:bg-[#241f2e]">
              Sign the ledger
            </button>
          </form>
        </div>
        <div
          role="img"
          aria-label="A portrait whose eyes follow you"
          className="portrait h-24 w-20 rounded-lg border border-[#3a3047] bg-[radial-gradient(circle_at_50%_35%,#3b3046_0%,#1a1520_60%,#0c0a10_100%)]"
        />
      </section>

      {/* Deliberately faint, so rites have something to warn about. */}
      <p className="caption px-5 pb-5 text-xs text-[#4a4550]">Checkout at dawn. No refunds for the possessed.</p>
    </div>
  );
}
