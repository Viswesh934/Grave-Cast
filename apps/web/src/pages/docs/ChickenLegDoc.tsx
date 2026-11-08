import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { WitchOnBroom3D, ChickenLegStepper, Canvas, OrbitControls } from 'groove-ui';

export function ChickenLegDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [flightSpeed, setFlightSpeed] = useState<'glide' | 'hunt' | 'warp'>('hunt');
  const [step, setStep] = useState(0);

  const steps = [
    { id: 'scan', title: 'Deep Crypt Scan' },
    { id: 'fossils', title: 'Find Dead Branches' },
    { id: 'epitaph', title: 'Carve Gothic Relief' },
    { id: 'radio', title: 'Broadcast Gravecast' },
  ];

  const codeSnippet2D = `<ChickenLegStepper
  steps={[
    { id: 'scan', title: 'Deep Crypt Scan' },
    { id: 'fossils', title: 'Find Dead Branches' },
    { id: 'epitaph', title: 'Carve Gothic Relief' },
    { id: 'radio', title: 'Broadcast Gravecast' }
  ]}
  currentStep={${step}}
  onChange={(newStep) => setStep(newStep)}
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, WitchOnBroom3D } from 'groove-ui';

const [speed, setSpeed] = useState<'glide' | 'hunt' | 'warp'>('${flightSpeed}');

<div style={{ width: '100%', height: '420px' }}>
  <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }}>
    <WitchOnBroom3D
      flightSpeed={speed}
      onCastSpell={() => console.log('Spell cast!')}
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="WitchOnBroom"
      category="The Coven"
      description="An interactive 3D flying witch on a birch broomstick soaring across the full Harvest Moon with real-time cursor banking, aerodynamic swooping, and streaming witchfire particle trails."
      packageName="witch-on-broom"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Coven Night Flight & Ancient Witch Lore',
        movement: 'Aerodynamic Cursor Banking & Streaming Witchfire Wake',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-5">
          {is3DMode ? (
            <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-[#1b3d2b] bg-[#08120e] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }}>
                <WitchOnBroom3D
                  flightSpeed={flightSpeed}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#08120e]/80 py-1 border-t border-[#1b3d2b]">
                Move mouse to bank witch flight · Click witch to cast spell shockwave
              </div>
            </div>
          ) : (
            <div className="w-full p-6 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-2xl">
              <ChickenLegStepper
                steps={steps}
                currentStep={step}
                onChange={(s: number) => setStep(s)}
              />
            </div>
          )}

          {/* Flight Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {is3DMode ? (
              <>
                {(['glide', 'hunt', 'warp'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFlightSpeed(s)}
                    className={`px-4 py-2 text-xs rounded-xl font-mono uppercase tracking-wider transition-all cursor-pointer font-bold ${
                      flightSpeed === s
                        ? 'bg-purple-950/80 text-purple-200 border border-purple-600/80 shadow-md shadow-purple-950/50'
                        : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-purple-700/60 hover:text-white'
                    }`}
                  >
                    Speed: {s}
                  </button>
                ))}
              </>
            ) : (
              steps.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStep(idx)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-mono transition-all cursor-pointer ${
                    step === idx
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                      : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
                  }`}
                >
                  {idx + 1}. {st.title}
                </button>
              ))
            )}
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'flightSpeed', type: "'glide' | 'hunt' | 'warp'", default: "'hunt'", description: 'Flight velocity & particle density' },
        { name: 'spellColor', type: 'string', default: "'#c084fc'", description: 'Emissive magic burst color' },
        { name: 'onCastSpell', type: '() => void', description: 'Callback fired on click spell burst' },
        { name: 'scale', type: 'number', default: '1.2', description: 'Scale factor' },
      ]}
      prevPage={{ title: 'LunarPhaseSelector', path: '/docs/components/lunar-phase' }}
      nextPage={{ title: 'CobwebCorner', path: '/docs/components/cobweb' }}
    />
  );
}
