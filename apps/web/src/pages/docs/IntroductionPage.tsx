import { Link } from 'react-router-dom';
import { Button, Card, Badge, CobwebCorner } from 'groove-ui';

export function IntroductionPage() {
  return (
    <div className="relative max-w-4xl mx-auto px-6 py-10 space-y-10">
      <CobwebCorner position="top-right" size="md" hasSpider={true} />

      {/* Header Banner */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-red-950/70 border border-red-800/80 text-[11px] font-mono font-semibold uppercase tracking-wider text-red-300">
            Horror Design System
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-stone-900 border border-stone-700 text-[11px] font-mono uppercase tracking-wider text-stone-300">
            WebGL 3D + 2D Primitives
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-[11px] font-mono uppercase tracking-wider text-purple-300">
            Procedural Web Audio
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-white leading-tight">
          Grave UI
        </h1>

        <p className="text-base sm:text-lg text-stone-300 max-w-2xl leading-relaxed">
          A mechanics-driven horror and gothic design system for React. Built on deep cognitive unease,
          reaction shock states, procedural Three.js WebGL monoliths, and zero-asset synthesized audio.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Link to="/docs/components/tombstone">
            <Button variant="primary" size="md">
              Explore 3D Components →
            </Button>
          </Link>
          <Link to="/docs/installation">
            <Button variant="secondary" size="md">
              Quickstart Guide
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick CLI Install */}
      <div className="p-4 rounded-xl bg-[#0e0f17] border border-[#232536] flex items-center justify-between">
        <div className="flex items-center gap-3 font-mono text-xs sm:text-sm text-stone-300">
          <span className="text-red-400 font-bold">$</span>
          <span>npm install grave-ui three @react-three/fiber</span>
        </div>
        <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
          v0.1.0
        </span>
      </div>

      {/* Visual Archetypes & Color Theory */}
      <section className="space-y-4">
        <div className="border-b border-[#222434] pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-white">
            Visual Archetypes
          </h2>
          <span className="text-xs font-mono text-stone-400">
            Color Theory Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Archetype 1 */}
          <div className="p-5 rounded-xl border border-[#1d261e] bg-[#0b0e08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4af2a1]">
                Haunted Terminal
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#152316] text-[#4af2a1] border border-[#234226]">
                Retro / Dead Tech
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Evokes corrupted terminals and uncontainable anomalies.
            </p>
            <div className="space-y-1.5 pt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-stone-400">
                <span>Base: <code className="text-white">#0B0E08</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#0B0E08]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>UI: <code className="text-[#4af2a1]">#4AF2A1</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#4AF2A1]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Shock: <code className="text-[#ff3333]">#FF3333</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#FF3333]" />
              </div>
            </div>
          </div>

          {/* Archetype 2 */}
          <div className="p-5 rounded-xl border border-[#1b222a] bg-[#12161a] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#98a6b5]">
                Clinical Isolation
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#19222b] text-[#98a6b5] border border-[#2b3948]">
                Liminal / Corp
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Devoid of human warmth; corporate sterile isolation.
            </p>
            <div className="space-y-1.5 pt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-stone-400">
                <span>Base: <code className="text-white">#12161A</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#12161A]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>UI: <code className="text-[#98a6b5]">#98A6B5</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#98A6B5]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Shock: <code className="text-white">#FFFFFF</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#FFFFFF]" />
              </div>
            </div>
          </div>

          {/* Archetype 3 */}
          <div className="p-5 rounded-xl border border-[#261730] bg-[#0f0a14] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#d4af37]">
                Occult / Ritual
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#20102b] text-[#d4af37] border border-[#3e1f54]">
                Cosmic Dread
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Signals forbidden knowledge and supernatural tension.
            </p>
            <div className="space-y-1.5 pt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-stone-400">
                <span>Base: <code className="text-white">#0F0A14</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#0F0A14]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>UI: <code className="text-[#d4af37]">#D4AF37</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#D4AF37]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Shock: <code className="text-[#7b1fa2]">#7B1FA2</code></span>
                <span className="w-4 h-4 rounded border border-stone-700 bg-[#7B1FA2]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanics-Driven State Feedback */}
      <section className="space-y-4">
        <div className="border-b border-[#222434] pb-2">
          <h2 className="text-xl font-bold font-serif text-white">
            Mechanics-Driven States
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0f111a] border border-[#222538] space-y-2">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-stone-300">
              1. Baseline Safe
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Deep muted darks (<code className="text-stone-300">#0B0E08</code>) with body text luminosity calibrated at 60–70% (<code className="text-stone-300">#94A3B8</code>) to maintain readable atmosphere without washing out shadows.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f111a] border border-[#222538] space-y-2">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-red-400">
              2. Reaction Shock
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              When an error, trap, or bad mechanic triggers, saturated neon crimson (<code className="text-red-400">#FF3333</code>) or sterile white flash breaks layout harmony to mimic nervous shock.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f111a] border border-[#222538] space-y-2">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-purple-400">
              3. Chamber Isolation
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Color temperature partitions zones: toxic green for madness chambers vs cold slate blue for sterile logic rooms.
            </p>
          </div>
        </div>
      </section>

      {/* Zero Asset Audio Engine */}
      <div className="p-6 rounded-xl bg-[#11121d] border border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base text-white">
              Procedural Web Audio Engine
            </h3>
            <Badge variant="info">Zero MP3s</Badge>
          </div>
          <p className="text-xs text-stone-400 max-w-xl">
            All stone grinding, bone clicks, iron locks, and cauldron bubbles are synthesized in real-time via Web Audio API oscillators and biquad filters.
          </p>
        </div>
        <Link to="/docs/audio" className="shrink-0">
          <Button variant="secondary" size="sm">
            Audio Playground →
          </Button>
        </Link>
      </div>
    </div>
  );
}
