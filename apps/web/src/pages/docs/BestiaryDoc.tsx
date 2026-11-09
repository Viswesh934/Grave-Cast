import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { BestiaryCharacter, bestiary, type CharacterSize } from 'groove-ui';

export function BestiaryDoc() {
  const [size, setSize] = useState<CharacterSize>('lg');
  const [is3DMode, setIs3DMode] = useState(true);

  const codeSnippet = `import { BestiaryCharacter, pumpkinSpec } from 'groove-ui';

// 3D by default, with an automatic 2D fallback when WebGL is unavailable
<BestiaryCharacter spec={pumpkinSpec} size="lg" showLabel />`;

  const buildYourOwn = `import { BestiaryCharacter, defineCharacter, creatureMaterials as m } from 'groove-ui';

// A creature is just data: a flat 2D drawing plus a 3D parts list.
// One renderer builds both. No new component, no new animation.
const slime = defineCharacter({
  id: 'slime',
  name: 'Gloop',
  tagline: 'Mostly harmless, entirely sticky',
  accent: 'emerald',
  hoverSound: 'cauldronBubble',
  layers: [
    { d: 'M20 84 C16 56 30 44 50 44 C70 44 84 56 80 84 Z', fill: m.flesh.goblin },
  ],
  eyes: [{ cx: 42, cy: 64 }, { cx: 58, cy: 64 }],
  build3d: {
    idle: 'bob',
    parts: [
      { shape: 'sphere', size: [1, 0.8, 1], color: m.flesh.goblin },
      { shape: 'sphere', position: [0, -0.4, 0], size: 0.7, color: m.flesh.goblinShade },
    ],
    eyes: [[-0.2, 0.1, 0.45], [0.2, 0.1, 0.45]],
  },
});

<BestiaryCharacter spec={slime} size="lg" showLabel />`;

  return (
    <ComponentDocPage
      title="Bestiary"
      category="The Bestiary"
      description="A cast of horror characters that come alive in 3D — spin them, watch them bob and sway, catch the glow in their eyes. Where 3D isn't available, each one quietly falls back to a flat drawing. Every creature is built from one short description, so adding your own takes minutes."
      packageName="bestiary"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Monster Lineups & Folk Horror Casts',
        movement: 'Stacked Shapes, Glowing Eyes, Idle Drift',
        lore: 'One figure, many faces — a shelf of parts assembled into 3D, with a flat drawing waiting in the wings.',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-5">
          <div className="rounded-2xl border border-[#183425] bg-[#08120e] p-8 shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 place-items-center">
              {bestiary.map((spec) => (
                <BestiaryCharacter
                  key={spec.id}
                  spec={spec}
                  size={size}
                  force2D={!is3DMode}
                  orbit={false}
                  showLabel
                />
              ))}
            </div>
          </div>

          {/* Size control */}
          <div className="flex items-center justify-center gap-2">
            {(['sm', 'md', 'lg'] as CharacterSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-4 py-1.5 text-xs rounded-xl font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  size === s
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-stone-400 font-mono">
            {is3DMode
              ? `Living in 3D · drag a single creature to orbit it · ${bestiary.length} characters`
              : `2D fallback · hover a creature to wake it up · ${bestiary.length} characters`}
          </p>
        </div>
      }
      codeSnippet={codeSnippet}
      variants={[
        {
          title: 'Build your own',
          description: 'Describe a creature once — a flat silhouette plus a short list of 3D parts — and the shared renderer handles 3D, the 2D fallback, idle motion, glowing eyes, and accessibility.',
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
        { name: 'force2D', type: 'boolean', default: 'false', description: 'Always use the flat 2D fallback, even when 3D is available.' },
        { name: 'orbit', type: 'boolean', default: 'true', description: 'Let viewers drag to orbit the 3D creature.' },
        { name: 'showLabel', type: 'boolean', default: 'false', description: 'Show the name and tagline beneath the figure.' },
      ]}
      prevPage={{ title: 'CobwebCorner', path: '/docs/components/cobweb' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
