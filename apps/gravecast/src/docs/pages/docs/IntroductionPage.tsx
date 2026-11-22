import { Link } from 'react-router-dom';
import { CobwebCorner, Badge } from 'groove-ui';

export function IntroductionPage() {
  return (
    <div className="relative w-full px-2 lg:px-4 py-10 space-y-12">
      <CobwebCorner position="top-right" size="md" hasSpider={true} />

      {/* Header Banner */}
      <div className="space-y-5 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300">
            Grave Design System
          </span>
          <span className="px-3 py-1 rounded-full bg-[#0c1813] border border-[#183425] text-xs font-mono uppercase tracking-wider text-stone-300">
            WebGL 3D + 2D Primitives
          </span>
          <span className="px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/60 text-xs font-mono uppercase tracking-wider text-teal-300">
            Procedural Audio
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-serif tracking-tight text-white leading-tight">
          Grave UI
        </h1>

        <p className="text-base sm:text-lg text-stone-300 leading-relaxed">
          A mechanics-driven horror and gothic design system for React. Built on deep cognitive unease,
          procedural Three.js WebGL monoliths, smooth organic surfaces, and zero-asset synthesized audio.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            to="/docs/components/tombstone"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 text-white font-medium text-sm border border-emerald-500/60 shadow-lg shadow-emerald-950/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
          >
            <span>Explore 3D Components</span>
            <span>→</span>
          </Link>
          <Link
            to="/docs/installation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0c1813] hover:bg-[#12241c] text-stone-300 hover:text-white border border-[#183425] hover:border-emerald-700/60 font-medium text-sm transition-all cursor-pointer"
          >
            Quickstart Guide
          </Link>
        </div>
      </div>

      {/* Quick CLI Install (v.001 text removed) */}
      <div className="p-5 rounded-2xl bg-[#0c1813] border border-[#183425] flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3 font-mono text-xs sm:text-sm text-stone-300">
          <span className="text-emerald-400 font-bold">$</span>
          <span>npm install groove-ui three @react-three/fiber</span>
        </div>
        <span className="text-xs font-mono text-emerald-400/80 uppercase tracking-widest hidden sm:inline">
          Ready to install
        </span>
      </div>

      {/* Visual Archetypes & Color Theory */}
      <section className="space-y-5">
        <div className="border-b border-[#183425] pb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-serif text-white">
            Visual Archetypes
          </h2>
          <span className="text-xs font-mono text-emerald-400/80">
            Atmospheric Color Framework
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Archetype 1 */}
          <div className="p-6 rounded-2xl border border-[#1b3d2b] bg-[#0c1813] space-y-4 shadow-xl hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#4af2a1]">
                Haunted Terminal
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#12271c] text-[#4af2a1] border border-[#1e4832]">
                Phosphor Green
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Evokes corrupted retro monitors, eerie luminescence, and ancient digital anomalies.
            </p>
            <div className="space-y-2 pt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-stone-400">
                <span>Base: <code className="text-white">#08120E</code></span>
                <span className="w-5 h-5 rounded-md border border-stone-700 bg-[#08120E]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>UI: <code className="text-[#4af2a1]">#4AF2A1</code></span>
                <span className="w-5 h-5 rounded-md border border-emerald-800 bg-[#4AF2A1]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Accent: <code className="text-[#34d399]">#34D399</code></span>
                <span className="w-5 h-5 rounded-md border border-emerald-700 bg-[#34D399]" />
              </div>
            </div>
          </div>

          {/* Archetype 2 */}
          <div className="p-6 rounded-2xl border border-[#183425] bg-[#0c1813] space-y-4 shadow-xl hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#98a6b5]">
                Clinical Isolation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#152329] text-[#98a6b5] border border-[#233c46]">
                Slate Liminal
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Sterile liminal facility lighting devoid of human warmth; cold institutional detachment.
            </p>
            <div className="space-y-2 pt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-stone-400">
                <span>Base: <code className="text-white">#0f1715</code></span>
                <span className="w-5 h-5 rounded-md border border-stone-700 bg-[#0f1715]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>UI: <code className="text-[#98a6b5]">#98A6B5</code></span>
                <span className="w-5 h-5 rounded-md border border-stone-700 bg-[#98A6B5]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Accent: <code className="text-white">#FFFFFF</code></span>
                <span className="w-5 h-5 rounded-md border border-stone-700 bg-[#FFFFFF]" />
              </div>
            </div>
          </div>

          {/* Archetype 3 */}
          <div className="p-6 rounded-2xl border border-[#183425] bg-[#0c1813] space-y-4 shadow-xl hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2dd4bf]">
                Spectral Witchfire
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#122a27] text-[#2dd4bf] border border-[#1b4a45]">
                Occult Mist
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Signals ancient alchemical crucibles, ethereal spirits, and glowing marsh lights.
            </p>
            <div className="space-y-2 pt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-stone-400">
                <span>Base: <code className="text-white">#091814</code></span>
                <span className="w-5 h-5 rounded-md border border-stone-700 bg-[#091814]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>UI: <code className="text-[#2dd4bf]">#2DD4BF</code></span>
                <span className="w-5 h-5 rounded-md border border-teal-800 bg-[#2DD4BF]" />
              </div>
              <div className="flex items-center justify-between text-stone-400">
                <span>Accent: <code className="text-[#5eead4]">#5EEAD4</code></span>
                <span className="w-5 h-5 rounded-md border border-teal-700 bg-[#5EEAD4]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanics-Driven State Feedback */}
      <section className="space-y-5">
        <div className="border-b border-[#183425] pb-3">
          <h2 className="text-2xl font-bold font-serif text-white">
            Mechanics-Driven States
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#0c1813] border border-[#183425] space-y-2 shadow-xl">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-400">
              1. Baseline Safe
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Deep muted darks (<code className="text-stone-300">#08120E</code>) with body text luminosity calibrated at 60–70% (<code className="text-stone-300">#94A3B8</code>) to maintain readable atmosphere without washing out shadows.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c1813] border border-[#183425] space-y-2 shadow-xl">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-teal-400">
              2. Reaction Feedback
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              When an interactive event or state change occurs, glowing spectral phosphor (<code className="text-teal-400">#34D399</code>) pulses smoothly to signal user input.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c1813] border border-[#183425] space-y-2 shadow-xl">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-stone-300">
              3. Chamber Isolation
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Color temperature partitions zones: toxic moss green for supernatural crypts versus cold slate blue for sterile logic rooms.
            </p>
          </div>
        </div>
      </section>

      {/* Zero Asset Audio Engine */}
      <div className="p-8 rounded-2xl bg-[#0c1813] border border-[#183425] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="font-serif font-bold text-lg text-white">
              Procedural Web Audio Engine
            </h3>
            <Badge variant="success">Zero MP3s</Badge>
          </div>
          <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
            All stone grinding, bone clicks, iron locks, CPU clock cycles, floppy seeks, and cauldron bubbles are synthesized in real-time via Web Audio API oscillators and biquad filters.
          </p>
        </div>
        <Link
          to="/docs/components/sound-library"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-[#12251c] hover:bg-[#183425] border border-[#1d422f] hover:border-emerald-600/60 text-xs font-mono text-emerald-300 transition-all cursor-pointer"
        >
          Sound Library & Synth →
        </Link>
      </div>

      {/* Component Catalog & Interactive Demos Directory */}
      <section className="space-y-6 pt-4">
        <div className="border-b border-[#183425] pb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-bold font-serif text-white">
            Component Catalog & Demos
          </h2>
          <span className="text-xs font-mono text-emerald-400/80">
            30+ Components Across 6 Folklore Domains
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card: Effects & Interactive Tools */}
          <div className="p-6 rounded-2xl border border-[#1b3d2b] bg-[#0c1813] space-y-4 shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Effects & Occult FX
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  14 Components
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Atmospheric overlays, full-screen horror backgrounds, interactive games, custom cursed cursors, and tactile audio components.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Link to="/docs/components/ghost-run" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-emerald-300 border border-[#1a4430] hover:border-emerald-500">GhostRun (Arcade)</Link>
                <Link to="/docs/components/diary" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-emerald-300 border border-[#1a4430] hover:border-emerald-500">HauntedDiary</Link>
                <Link to="/docs/components/biting-frame" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-emerald-300 border border-[#1a4430] hover:border-emerald-500">BitingFrame</Link>
                <Link to="/docs/components/broom-progress" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-emerald-300 border border-[#1a4430] hover:border-emerald-500">BroomProgress</Link>
                <Link to="/docs/components/haunted-scrollbar" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-emerald-300 border border-[#1a4430] hover:border-emerald-500">HauntedScrollbar (Blob)</Link>
                <Link to="/docs/components/haunted-keyboard" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">HauntedKeyboard</Link>
                <Link to="/docs/components/horror-background" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">HorrorBackground</Link>
                <Link to="/docs/components/horror-cursor" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">HorrorCursor</Link>
                <Link to="/docs/components/sound-library" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">SoundLibrary</Link>
                <Link to="/docs/components/ascii" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">ASCII Camera</Link>
                <Link to="/docs/components/surveillance-cam" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">SurveillanceCam</Link>
                <Link to="/docs/components/voice" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">VoiceStudio</Link>
              </div>
            </div>
            <Link to="/docs/components/horror-background" className="pt-3 text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <span>Explore FX Demos</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card: The Crypt & 3D Primitives */}
          <div className="p-6 rounded-2xl border border-[#183425] bg-[#0c1813] space-y-4 shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
                  The Crypt & Folktale
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  11 Components
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Relief carvings, 3D WebGL monoliths, stone accordions, bone dividers, and alchemical liquid meters.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Link to="/docs/components/tombstone" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">TombstoneCard (3D)</Link>
                <Link to="/docs/components/coffin-accordion" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">CoffinAccordion</Link>
                <Link to="/docs/components/mausoleum" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">MausoleumDrawer</Link>
                <Link to="/docs/components/cauldron" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">CauldronBrew (3D)</Link>
                <Link to="/docs/components/runic-button" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">RunicButton (3D)</Link>
                <Link to="/docs/components/blood-vial" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">BloodVialProgress</Link>
                <Link to="/docs/components/lunar-phase" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">LunarPhaseSelector</Link>
                <Link to="/docs/components/cobweb" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">CobwebCorner</Link>
              </div>
            </div>
            <Link to="/docs/components/tombstone" className="pt-3 text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1">
              <span>View Crypt Demos</span>
              <span>→</span>
            </Link>
          </div>

          {/* Card: The Grimoire & Bestiary */}
          <div className="p-6 rounded-2xl border border-[#183425] bg-[#0c1813] space-y-4 shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Grimoire & Bestiary
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
                  16 Characters & Rites
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Browser capability rites (geolocation, battery, Bluetooth, camera) disguised as ancient rituals, plus 10 real-time 3D character casts.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Link to="/docs/components/grimoire" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">Grimoire Overview</Link>
                <Link to="/docs/components/bestiary" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">Bestiary 3D Gallery</Link>
                <Link to="/docs/components/bestiary/ghost" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">Wisp (Ghost)</Link>
                <Link to="/docs/components/bestiary/pumpkin" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">Jack (Pumpkin)</Link>
                <Link to="/docs/components/bestiary/vampire" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">Lord Alucard</Link>
                <Link to="/docs/components/bestiary/yeti" className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10241b] text-stone-300 border border-[#1a4430] hover:text-white">Himal (Yeti)</Link>
              </div>
            </div>
            <Link to="/docs/components/grimoire" className="pt-3 text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1">
              <span>Enter The Grimoire</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
