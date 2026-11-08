import { Link } from 'react-router-dom';
import { PumpkinIcon, SparklesIcon } from '../../components/docs/DocsIcons';
import { Button, Card, Badge, CobwebCorner } from 'groove-ui';

export function IntroductionPage() {
  return (
    <div className="relative max-w-4xl mx-auto px-6 py-10 space-y-12">
      <CobwebCorner position="top-right" size="md" hasSpider={true} />

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-xs font-mono text-amber-300">
          <PumpkinIcon size={14} />
          <span>Kiroween 2026 Special Edition</span>
        </div>

        <h1 className="text-5xl font-extrabold font-serif tracking-tight text-white">
          Grave UI
        </h1>

        <p className="text-lg text-stone-300 max-w-2xl leading-relaxed">
          A terrifying, production-grade React component library inspired by dark folklore, ancient covens, crypts, werewolves, vampires, and Baba Yaga. Built for radical reusability.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <Link to="/docs/components/tombstone">
            <Button variant="primary" size="md">
              Explore Crypt Components →
            </Button>
          </Link>
          <Link to="/docs/installation">
            <Button variant="secondary" size="md">
              Installation Guide
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <Card variant="elevated" className="p-6 space-y-3">
          <div className="text-3xl">🪦</div>
          <h3 className="font-bold text-base text-white">The Crypt & Graves</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Chiseled basalt tombstones, digging loaders, ossuary bone dividers, and creaking velvet caskets.
          </p>
        </Card>

        <Card variant="elevated" className="p-6 space-y-3">
          <div className="text-3xl">🧪</div>
          <h3 className="font-bold text-white text-base">Covens & Alchemy</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Boiling cauldrons with animated vapor steam, glowing elder futhark runic tablets, and ritual timers.
          </p>
        </Card>

        <Card variant="elevated" className="p-6 space-y-3">
          <div className="text-3xl">🐺</div>
          <h3 className="font-bold text-white text-base">Lycan & Vampires</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Interactive lunar cycle dials, frenzied beast modes, and apothecary glass blood vials.
          </p>
        </Card>
      </section>

      {/* Zero Asset Audio Engine Feature */}
      <Card variant="outlined" className="p-8 space-y-4 border-purple-900/40 bg-[#10111a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔊</span>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Procedural Web Audio Engine</h3>
              <p className="text-xs text-stone-400">Zero external sound files or bulky MP3 downloads.</p>
            </div>
          </div>
          <Badge variant="info">Zero Dependencies</Badge>
        </div>
        <p className="text-sm text-stone-300 leading-relaxed">
          Every sound effect in Grave UI—from stone grinding to coffin lid squeals and potion bubbles—is synthesized on the fly using real-time browser oscillators and bandpass noise filters.
        </p>
        <div className="pt-2">
          <Link to="/docs/audio">
            <Button variant="ghost" size="sm">
              <SparklesIcon size={14} />
              <span>Test Audio Synth Live</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
