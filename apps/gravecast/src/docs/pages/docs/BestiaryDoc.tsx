import { Link } from 'react-router-dom';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  BestiaryCharacter,
  bestiary,
  creatureAccents,
  type CharacterSpec,
} from 'groove-ui';

/**
 * One creature's dedicated section: a large figure beside a plate with its
 * number, name, and tagline. Layout alternates side to side so the page reads
 * like a gallery of individual portraits.
 */
function CharacterSection({
  spec,
  index,
}: {
  spec: CharacterSpec;
  index: number;
}) {
  const accent = creatureAccents[spec.accent];
  const flip = index % 2 === 1;

  return (
    <section
      className={`group relative flex flex-col items-center gap-6 rounded-3xl border border-[#1b3d2b] bg-[#0a1510] p-6 shadow-xl transition-colors duration-300 hover:border-[#2c6145] sm:p-8 ${
        flip ? 'sm:flex-row-reverse' : 'sm:flex-row'
      }`}
    >
      {/* Figure stage. */}
      <div className="flex shrink-0 items-center justify-center">
        <BestiaryCharacter spec={spec} size="lg" />
      </div>

      {/* Info plate. */}
      <div className={`flex-1 text-center ${flip ? 'sm:text-right' : 'sm:text-left'}`}>
        <span
          className="font-mono text-xs font-bold tracking-widest"
          style={{ color: accent }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="mt-1 font-serif text-2xl font-bold tracking-wide text-white">
          {spec.name}
        </h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-stone-400">
          {spec.tagline}
        </p>
        <p className="mt-3 text-xs text-stone-500 font-mono">
          Hover to tilt it · double-click to grow
        </p>
        <div className={`mt-4 flex ${flip ? 'justify-center sm:justify-end' : 'justify-center sm:justify-start'}`}>
          <Link
            to={`/docs/components/bestiary/${spec.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#13271d] hover:bg-[#1a3829] border border-[#235038] hover:border-emerald-500 text-emerald-200 transition-all shadow-sm"
          >
            <span>Launch 3D Showcase</span>
            <span className="text-[10px] text-emerald-400">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BestiaryDoc() {
  const codeSnippet = `import { BestiaryCharacter, pumpkinSpec } from 'groove-ui';

// Hand-drawn art that tilts toward the pointer, lifts on hover, and grows on
// double-click — dimensional without any WebGL.
<BestiaryCharacter spec={pumpkinSpec} size="lg" showLabel />`;

  const buildYourOwn = `import { BestiaryCharacter, defineCharacter, creatureMaterials as m } from 'groove-ui';

// A creature is just data: stacked SVG shapes + where the eyes go.
// The renderer gives the flat art its dimensional feel automatically.
const slime = defineCharacter({
  id: 'slime',
  name: 'Gloop',
  tagline: 'Mostly harmless, entirely sticky',
  accent: 'emerald',
  hoverSound: 'cauldronBubble',
  layers: [
    { d: 'M20 84 C16 56 30 44 50 44 C70 44 84 56 80 84 Z', fill: m.flesh.goblin },
    { d: 'M30 74 Q50 86 70 74 Q50 80 30 74 Z', fill: m.flesh.goblinShade },
  ],
  eyes: [{ cx: 42, cy: 64 }, { cx: 58, cy: 64 }],
});

<BestiaryCharacter spec={slime} size="lg" showLabel />`;

  return (
    <ComponentDocPage
      title="Bestiary"
      category="The Bestiary"
      description="A cast of hand-drawn horror characters. Each one tilts toward your pointer, lifts and casts a shadow on hover, and swells when you double-click it — flat art that feels carved and dimensional. Every creature is built from one short description, so adding your own takes minutes."
      packageName="bestiary"
      gothicPhilosophy={{
        influence: 'Monster Lineups & Folk Horror Casts',
        movement: 'Flat Art, Carved Volume, Pointer Tilt',
        lore: 'One figure, many faces — layered shapes lit to feel like they lean out of the page at you.',
      }}
      preview={
        <div className="w-full max-w-4xl space-y-10">
          {/* Main "Characters" section header. */}
          <div className="text-center">
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-white">Characters</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-stone-400">
              {bestiary.length} creatures · hover to tilt · double-click to grow
            </p>
          </div>

          {/* One dedicated section per creature. */}
          {bestiary.map((spec, i) => (
            <CharacterSection key={spec.id} spec={spec} index={i} />
          ))}
        </div>
      }
      codeSnippet={codeSnippet}
      variants={[
        {
          title: 'Build your own',
          description: 'Describe a creature once — stacked SVG shapes plus where the eyes go — and the renderer handles the dimensional tilt, shading, shadow, glowing eyes, and accessibility.',
          element: (
            <pre className="w-full overflow-x-auto rounded-xl bg-[#0c1813] border border-[#183425] p-5 text-xs font-mono text-stone-300 leading-relaxed">
              {buildYourOwn}
            </pre>
          ),
        },
      ]}
      propsList={[
        { name: 'spec', type: 'CharacterSpec', description: 'The creature to show. Use a built-in (pumpkinSpec, batSpec, ...) or make one with defineCharacter.' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Figure size preset.' },
        { name: 'tilt', type: 'boolean', default: 'true', description: 'Tilt toward the pointer for a dimensional feel.' },
        { name: 'growable', type: 'boolean', default: 'true', description: 'Double-click to swell the figure.' },
        { name: 'showLabel', type: 'boolean', default: 'false', description: 'Show the name and tagline beneath the figure.' },
      ]}
      prevPage={{ title: 'CobwebCorner', path: '/docs/components/cobweb' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
