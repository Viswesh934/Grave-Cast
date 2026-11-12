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
 * A small, ordinary website for rites to work on: a header, a heading, a
 * button, a list, a form, an image block, one gentle animation, and one
 * deliberately faint caption. Nothing in it goes anywhere.
 */
export function HauntedStage({ stageRef, awake = false, label = 'Maple Street Café, a sample page' }: HauntedStageProps) {
  const stay = (event: MouseEvent) => event.preventDefault();
  const keep = (event: FormEvent) => event.preventDefault();

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={label}
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white text-left text-slate-900 shadow-sm ${awake ? 'cursor-crosshair' : ''}`}
    >
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
        <span className="text-base font-semibold">Maple Street Café</span>
        <nav aria-label="Café" className="flex gap-4 text-sm">
          <a href="#menu" onClick={stay} className="text-slate-600 hover:text-slate-900">Menu</a>
          <a href="#hours" onClick={stay} className="text-slate-600 hover:text-slate-900">Hours</a>
          <a href="#contact" onClick={stay} className="text-slate-600 hover:text-slate-900">Contact</a>
        </nav>
      </header>

      <section className="space-y-3 px-5 py-5">
        <h3 className="title text-2xl font-bold">Fresh coffee, every morning</h3>
        <p className="max-w-md text-sm leading-relaxed text-slate-600">
          A small neighborhood café with house-roasted beans, fresh pastries, and plenty of seats by the window.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Order ahead
          </button>
          <span className="status inline-flex items-center gap-2 text-xs text-slate-600">
            <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Open now
          </span>
        </div>
      </section>

      <section className="grid items-start gap-4 border-t border-slate-200 px-5 py-5 sm:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <ul className="menu space-y-1 text-sm text-slate-700">
            <li>Espresso, 3.00</li>
            <li>Oat milk latte, 4.50</li>
            <li>Blueberry muffin, 3.25</li>
          </ul>
          <form onSubmit={keep} className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1 text-xs text-slate-600">
              Email for our newsletter
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400"
              />
            </label>
            <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-800 hover:bg-slate-50">
              Sign up
            </button>
          </form>
        </div>
        <div
          role="img"
          aria-label="A cup of coffee on a wooden table"
          className="photo h-24 w-28 rounded-lg bg-gradient-to-br from-amber-200 to-amber-700"
        />
      </section>

      {/* Deliberately faint, so rites have something to warn about. */}
      <p className="caption px-5 pb-4 text-xs text-slate-300">Prices include tax. Closed on public holidays.</p>
    </div>
  );
}
