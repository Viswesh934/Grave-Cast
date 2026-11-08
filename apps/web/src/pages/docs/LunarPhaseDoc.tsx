import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { LunarPhaseSelector, LunarPhaseSelector3D, Canvas, OrbitControls, type MoonPhase } from 'groove-ui';

export function LunarPhaseDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [phase, setPhase] = useState<MoonPhase>('blood-moon');

  const codeSnippet2D = `<LunarPhaseSelector
  value="${phase}"
  onChange={(newPhase) => console.log('Phase changed to:', newPhase)}
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, LunarPhaseSelector3D } from 'groove-ui';

<div style={{ width: '100%', height: '380px' }}>
  <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
    <LunarPhaseSelector3D
      value="${phase}"
      onChange={(p) => setPhase(p)}
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="LunarPhaseSelector"
      category="The Lycan"
      description="A werewolf celestial cycle dial mapping all 8 phases of the lunar cycle up to the Blood Moon, casting physical spherical shadow terminator lines in 3D WebGL."
      packageName="lunar-phase-selector"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Crimson Eclipse & Lycanthropic Celestial Alignment',
        movement: 'Dynamic Spherical Shadow Terminator & Celestial Corona Flare',
      }}
      preview={
        <div className="w-full max-w-xl space-y-4">
          {is3DMode ? (
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#2b2e45] bg-[#07080f] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
                <LunarPhaseSelector3D
                  value={phase}
                  onChange={(p) => setPhase(p)}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.3} minPolarAngle={Math.PI / 2 - 0.3} />
              </Canvas>
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-stone-400 bg-black/40 py-0.5">
                Click moon to advance cycle · Drag to inspect shadow terminator
              </div>
            </div>
          ) : (
            <div className="w-full p-6 rounded-2xl bg-[#0a0a12] border border-[#23253b] shadow-2xl">
              <LunarPhaseSelector
                value={phase}
                onChange={(p: MoonPhase) => setPhase(p)}
              />
            </div>
          )}

          {/* Quick Phase Selection Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
            {(['new', 'first-quarter', 'full', 'blood-moon', 'third-quarter'] as MoonPhase[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPhase(p)}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  phase === p
                    ? 'bg-red-950 text-red-200 border border-red-700 font-bold shadow-sm'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                {p.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'value', type: 'MoonPhase', default: "'blood-moon'", description: 'Active selected moon phase identifier' },
        { name: 'onChange', type: '(phase: MoonPhase) => void', description: 'Callback fired when a moon phase is clicked' },
        { name: 'radius', type: 'number', default: '1.6', description: 'Sphere radius in 3D WebGL space' },
      ]}
      prevPage={{ title: 'BloodVialProgress', path: '/docs/components/blood-vial' }}
      nextPage={{ title: 'ChickenLegStepper', path: '/docs/components/chicken-legs' }}
    />
  );
}
