/** Class for a pill toggle button. */
export const chip = (active: boolean) =>
  `px-3 py-1.5 text-xs rounded-xl font-mono transition-all cursor-pointer border ${
    active
      ? 'bg-emerald-950/80 text-emerald-200 border-emerald-600/80 font-bold'
      : 'bg-[#102219] text-stone-300 border-[#1b3a2a] hover:text-white'
  }`;

/** Class for a select box. */
export const selectClass =
  'w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-[#102219] text-stone-200 border border-[#1b3a2a] focus:outline-none focus:border-emerald-600/80 cursor-pointer';

/** Class for a text input. */
export const inputClass =
  'w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-[#102219] text-stone-200 border border-[#1b3a2a] focus:outline-none focus:border-emerald-600/80';
