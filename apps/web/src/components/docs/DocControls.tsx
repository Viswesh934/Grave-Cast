import type { ReactNode } from 'react';

/** A small labelled control wrapper. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">{label}</span>
      {children}
    </label>
  );
}

/** A titled block inside a showcase preview. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="border-b border-[#183425] pb-1 font-mono text-[11px] uppercase tracking-wider text-emerald-400/80">
        {title}
      </h3>
      {children}
    </section>
  );
}
