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
        <div className="w-full max-w-3xl space-y-5">
          {is3DMode ? (
            <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#1e293b]/70 bg-gradient-to-b from-[#080d14] via-[#05080d] to-[#020406] shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] relative">
              <Canvas camera={{ position: [0, 0, 5.8], fov: 42 }}>
                <LunarPhaseSelector3D
                  value={phase}
                  onChange={(p) => setPhase(p)}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.3} minPolarAngle={Math.PI / 2 - 0.3} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#05080d]/85 backdrop-blur-xs py-1.5 border-t border-[#1e293b]/60">
                Click moon to advance cycle · Drag to inspect shadow terminator
              </div>
            </div>
          ) : (
            <div className="w-full p-6 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-2xl">
              <LunarPhaseSelector
                value={phase}
                onChange={(p: MoonPhase) => setPhase(p)}
              />
            </div>
          )}

          {/* Quick Phase Selection Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['new', 'first-quarter', 'full', 'blood-moon', 'third-quarter'] as MoonPhase[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPhase(p)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                  phase === p
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
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
