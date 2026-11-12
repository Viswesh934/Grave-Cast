import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { WitchOnBroom, ChickenLegStepper, type WitchFlightSpeed } from 'groove-ui';

const STEPS = [
  { id: 'scan', title: 'Deep Crypt Scan' },
  { id: 'fossils', title: 'Find Dead Branches' },
  { id: 'epitaph', title: 'Carve Gothic Relief' },
  { id: 'radio', title: 'Broadcast Gravecast' },
];

function StepperDemo() {
  const [step, setStep] = useState(0);
  return (
    <div className="w-full space-y-3">
      <ChickenLegStepper steps={STEPS} currentStep={step} onChange={(s: number) => setStep(s)} />
      <div className="flex flex-wrap justify-center gap-2">
        {STEPS.map((st, idx) => (
          <button
            key={st.id}
            type="button"
            onClick={() => setStep(idx)}
            aria-pressed={step === idx}
            className={`px-3 py-1.5 text-xs rounded-xl font-mono transition-all cursor-pointer ${
              step === idx
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold'
                : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
            }`}
          >
            {idx + 1}. {st.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChickenLegDoc() {
  const [flightSpeed, setFlightSpeed] = useState<WitchFlightSpeed>('hunt');
  const [spells, setSpells] = useState(0);

  const codeSnippet = `import { WitchOnBroom } from 'groove-ui';

<WitchOnBroom
  flightSpeed="${flightSpeed}"
  size="lg"
  onCastSpell={() => console.log('Hexed!')}
/>`;

  return (
    <ComponentDocPage
      title="WitchOnBroom"
      category="The Coven"
      description="A line-art witch on her broomstick, flying across the moon. Her cloak and hair snap in the wind, sparks trail behind the broom, and she leans toward your pointer. Click her, or focus her and press Enter, to cast a spell."
      packageName="witch-on-broom"
      gothicPhilosophy={{
        influence: 'Coven Night Flight & Woodcut Witch Lore',
        movement: 'Bobbing Flight, Wind-Snapped Cloak & Spark Wake',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-5">
          <div className="w-full flex flex-col items-center gap-3 rounded-2xl border border-[#1e293b]/70 bg-[radial-gradient(ellipse_at_70%_25%,#1b1830_0%,#0b0a14_55%,#05050a_100%)] px-6 py-10">
            <WitchOnBroom flightSpeed={flightSpeed} size="lg" onCastSpell={() => setSpells((n) => n + 1)} />
            <p className="m-0 text-[11px] font-mono text-stone-400" aria-live="polite">
              {spells === 0 ? 'Move over her to steer · Click to cast a spell' : `Spells cast: ${spells}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['glide', 'hunt', 'warp'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFlightSpeed(s)}
                aria-pressed={flightSpeed === s}
                className={`px-4 py-2 text-xs rounded-xl font-mono uppercase tracking-wider transition-all cursor-pointer font-bold ${
                  flightSpeed === s
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-600/80 shadow-md shadow-purple-950/50'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-purple-700/60 hover:text-white'
                }`}
              >
                Speed: {s}
              </button>
            ))}
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'flightSpeed', type: "'glide' | 'hunt' | 'warp'", default: "'hunt'", description: 'How fast she bobs, flutters, and trails sparks' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | number", default: "'md'", description: 'Width preset, or a width in px' },
        { name: 'spellColor', type: 'string', default: 'witchfire violet', description: 'Color of the sparks and the spell ring' },
        { name: 'onCastSpell', type: '() => void', description: 'Called on click, Enter, or Space' },
        { name: 'followPointer', type: 'boolean', default: 'true', description: 'Lean toward the pointer while it moves over her' },
        { name: 'soundOnCast', type: 'boolean', default: 'true', description: 'Play a sound when she casts a spell' },
        { name: 'label', type: 'string', description: 'What screen readers hear' },
      ]}
      variants={[
        {
          title: 'ChickenLegStepper',
          description: "A step-by-step progress trail on Baba Yaga's chicken legs",
          element: <StepperDemo />,
        },
      ]}
      prevPage={{ title: 'LunarPhaseSelector', path: '/docs/components/lunar-phase' }}
      nextPage={{ title: 'CobwebCorner', path: '/docs/components/cobweb' }}
    />
  );
}
