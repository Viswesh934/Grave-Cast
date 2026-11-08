import { Link } from 'react-router-dom';
import { PumpkinIcon } from '../../components/docs/DocsIcons';
import { Button, Card, Badge, CobwebCorner } from 'groove-ui';

export function IntroductionPage() {
  return (
    <div className="relative max-w-4xl mx-auto px-6 py-10 space-y-12">
      <CobwebCorner position="top-right" size="md" hasSpider={true} />

      {/* Header Banner */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-800/80 text-xs font-mono text-red-300 shadow-sm">
            <span className="text-red-400 font-bold">🏛️ Gothic Horror</span>
            <span>Design System</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-xs font-mono text-amber-300">
            <PumpkinIcon size={14} />
            <span>WebGL 3D + 2D Primitives</span>
          </div>
        </div>

        <h1 className="text-5xl font-extrabold font-serif tracking-tight text-white leading-tight">
          Grave UI
          <span className="block text-2xl font-mono text-red-400 font-normal mt-1">
            "Beauty in the Grotesque"
          </span>
        </h1>

        <p className="text-lg text-stone-300 max-w-3xl leading-relaxed">
          A sculptural, production-grade React & WebGL component library inspired by dark medieval gothic architecture and supernatural folklore. 
          Featuring living basalt monoliths, hand-carved stone reliefs, breathing organic geometry, and procedural zero-asset horror soundscapes.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <Link to="/docs/components/tombstone">
            <Button variant="primary" size="md">
              Explore 3D Crypt Monoliths →
            </Button>
          </Link>
          <Link to="/docs/installation">
            <Button variant="secondary" size="md">
              Installation & CLI Guide
            </Button>
          </Link>
        </div>
      </div>

      {/* Core Gothic Architectural Pillars */}
      <Card variant="outlined" className="p-8 space-y-6 border-red-900/60 bg-gradient-to-br from-[#161019] via-[#0d0c14] to-[#0a0a0f] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-red-950 pb-4">
          <div>
            <h2 className="text-xl font-serif font-extrabold text-white flex items-center gap-2">
              <span>🗿</span> Architectural Standard: Sculptural Maximalism
            </h2>
            <p className="text-xs font-mono text-stone-400 mt-0.5">
              Intricate carved reliefs, tangible medieval weight, and visceral depth.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950 text-red-300 border border-red-800">
            Design Philosophy
          </span>
        </div>

        {/* 4 Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#14121e]/80 border border-[#2b253b] space-y-2">
            <h3 className="font-serif font-bold text-sm text-red-200 flex items-center gap-2">
              <span className="text-red-400">1.</span> Catacomb Monumentality
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Intricate stone reliefs, hand-carved skulls and gargoyles, chiseled epitaphs, and heavy medieval basalt structures. Applied to <strong>TombstoneCard</strong>, modal heads, and ossuary dividers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#14121e]/80 border border-[#2b253b] space-y-2">
            <h3 className="font-serif font-bold text-sm text-red-200 flex items-center gap-2">
              <span className="text-red-400">2.</span> Living Architecture
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Surfaces that breathe subtly, pulsing sacrificial veins beneath ancient stone, and organic architecture that feels alive. Applied to <strong>ExcavationLoader</strong>, progress meters, and shaders.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#14121e]/80 border border-[#2b253b] space-y-2">
            <h3 className="font-serif font-bold text-sm text-red-200 flex items-center gap-2">
              <span className="text-red-400">3.</span> Gothic Brutalism & Relics
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Heavy obsidian tablets, ornate cast iron cauldrons, weathered pine caskets, and dark alchemical phials. Applied to <strong>RunicButton</strong>, interactive controls, and containers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#14121e]/80 border border-[#2b253b] space-y-2">
            <h3 className="font-serif font-bold text-sm text-red-200 flex items-center gap-2">
              <span className="text-red-400">4.</span> Chiaroscuro Illumination
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Dynamic torchlight cursor shadows, glowing embers in deep fissures, atmospheric mists, and rich visible contrast. Applied to <strong>3D Canvases</strong>, cards, and layouts.
            </p>
          </div>
        </div>
      </Card>

      {/* Movement Vocabulary & Physics */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-white border-b border-[#222434] pb-3">
          Movement Vocabulary
        </h2>
        <p className="text-sm text-stone-300">
          Nothing is truly inert in Grave UI—surfaces breathe, shadows shift, and pointer hover awakens dormant entities.
        </p>

        <div className="border border-[#222434] rounded-xl overflow-hidden bg-[#0d0e14]">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-[#12131c] text-stone-400 text-xs uppercase tracking-wider border-b border-[#222434]">
              <tr>
                <th className="px-4 py-3">Movement</th>
                <th className="px-4 py-3">Gothic Origin</th>
                <th className="px-4 py-3">Duration & Curve</th>
                <th className="px-4 py-3">Trigger State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e202e] text-xs">
              <tr className="hover:bg-[#141520]/50">
                <td className="px-4 py-3 font-semibold text-red-300">Breathing</td>
                <td className="px-4 py-3 text-stone-300">Ancient Crypt Monoliths</td>
                <td className="px-4 py-3 text-amber-300">4-6s sine-in-out (±1.8%)</td>
                <td className="px-4 py-3 text-stone-400 font-sans">Idle state</td>
              </tr>
              <tr className="hover:bg-[#141520]/50">
                <td className="px-4 py-3 font-semibold text-purple-300">Writhing</td>
                <td className="px-4 py-3 text-stone-300">Ambient Mist & Shadow Tendrils</td>
                <td className="px-4 py-3 text-amber-300">3-5s perlin continuous</td>
                <td className="px-4 py-3 text-stone-400 font-sans">Constant ambient</td>
              </tr>
              <tr className="hover:bg-[#141520]/50">
                <td className="px-4 py-3 font-semibold text-rose-300">Vein Pulsing</td>
                <td className="px-4 py-3 text-stone-300">Living Flesh-Stone Veins</td>
                <td className="px-4 py-3 text-amber-300">1-2s systolic pulse</td>
                <td className="px-4 py-3 text-stone-400 font-sans">Interactive / Active</td>
              </tr>
              <tr className="hover:bg-[#141520]/50">
                <td className="px-4 py-3 font-semibold text-emerald-300">Trembling</td>
                <td className="px-4 py-3 text-stone-300">Awakening Presence in Stone</td>
                <td className="px-4 py-3 text-amber-300">0.1s high-frequency shake</td>
                <td className="px-4 py-3 text-stone-400 font-sans">On pointer hover</td>
              </tr>
              <tr className="hover:bg-[#141520]/50">
                <td className="px-4 py-3 font-semibold text-amber-300">Weathering</td>
                <td className="px-4 py-3 text-stone-300">Centuries of Stone Erosion & Lichen</td>
                <td className="px-4 py-3 text-amber-300">Procedural shader mask</td>
                <td className="px-4 py-3 text-stone-400 font-sans">Weathering level &gt; 0.3</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Horror Intensity Mapping */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-white border-b border-[#222434] pb-3">
          Horror Intensity Spectrum
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="p-6 space-y-3 border-emerald-950 bg-[#0e1215]">
            <Badge variant="success">Ghastly</Badge>
            <h3 className="font-serif font-bold text-base text-stone-200">Gothic Classical</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Clean carved stone, subtle shadows, minimal organic elements, and steady torchlight. Corporate safe.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-3 border-amber-950 bg-[#161218]">
            <Badge variant="warning">Cursed (Default)</Badge>
            <h3 className="font-serif font-bold text-base text-stone-200">Ancient Catacombs</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Authentic gothic horror. Weathered basalt with sculpted reliefs, creeping shadows, breathing movement, and ember glow.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-3 border-red-950 bg-[#1a0f14]">
            <Badge variant="danger">Abyssal</Badge>
            <h3 className="font-serif font-bold text-base text-stone-200">Occult Void</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Deep dimensional dread. Heavy flesh-stone fusion, aggressive writhing, pulsing sacrificial embers, and oppressive atmosphere.
            </p>
          </Card>
        </div>
      </section>

      {/* Zero Asset Audio Engine Feature */}
      <Card variant="outlined" className="p-8 space-y-4 border-purple-900/50 bg-[#11111d] shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔊</span>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Procedural Web Audio Engine</h3>
              <p className="text-xs text-stone-400">Zero external sound files, 100% synthesized in the browser.</p>
            </div>
          </div>
          <Badge variant="info">Zero Dependencies</Badge>
        </div>
        <p className="text-sm text-stone-300 leading-relaxed">
          Every sound effect in Grave UI—from heavy stone grinding to iron chains, bone clicks, and cauldron bubbles—is synthesized mathematically using real-time Web Audio API oscillators and biquad filters.
        </p>
      </Card>
    </div>
  );
}
