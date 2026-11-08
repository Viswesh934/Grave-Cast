import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { BloodVialProgress, BloodVialProgress3D, Canvas, OrbitControls } from 'groove-ui';

export function BloodVialDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [val, setVal] = useState(72);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  const codeSnippet2D = `<BloodVialProgress
  value={${val}}
  max={100}
  label="Vampiric Vitality"
  orientation="${orientation}"
  showPercentage={true}
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, BloodVialProgress3D } from 'groove-ui';

<div style={{ width: '100%', height: '380px' }}>
  <Canvas camera={{ position: [0, 0, 6.5], fov: 42 }}>
    <BloodVialProgress3D
      value={${val}}
      max={100}
      label="Vampiric Vitality"
      liquidColor="#e11d48"
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="BloodVialProgress"
      category="The Sanguine"
      description="An apothecary glass phial progress meter filled with viscous coagulated blood, floating micro-bubbles, meniscus surface physics, and brass filigree detailing."
      packageName="blood-vial-progress"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Alchemical Phials & Sanguine Vitality Gauges',
        movement: 'Viscous Meniscus Wave & Rising Micro-Bubbles',
      }}
      preview={
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {is3DMode ? (
            <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#1b3d2b] bg-[#08120e] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0, 6.5], fov: 42 }}>
                <BloodVialProgress3D
                  value={val}
                  max={100}
                  label="Vampiric Vitality"
                  liquidColor="#ff1744"
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#08120e]/80 py-1 border-t border-[#1b3d2b]">
                Move mouse to tilt phial · Drag to inspect glass refraction
              </div>
            </div>
          ) : (
            <div className="w-full p-6 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-xl">
              <BloodVialProgress
                value={val}
                max={100}
                label="Vampiric Vitality"
                orientation={orientation}
                showPercentage={true}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-3 bg-[#0c1813] px-4 py-2 rounded-xl border border-[#183425] shadow-md">
              <span className="text-xs font-mono text-emerald-300 font-semibold">Volume: {val}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={val}
                onChange={(e) => setVal(Number(e.target.value))}
                className="accent-emerald-500 cursor-pointer w-32"
              />
            </div>
            {!is3DMode && (
              <button
                type="button"
                onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
                className="px-3.5 py-2 text-xs rounded-xl font-mono text-stone-300 bg-[#0c1813] border border-[#183425] hover:text-white cursor-pointer"
              >
                Mode: {orientation}
              </button>
            )}
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'value', type: 'number', description: 'Current fill volume percentage (0 - max)' },
        { name: 'max', type: 'number', default: '100', description: 'Maximum vial capacity' },
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Glass tube orientation (2D mode)' },
        { name: 'label', type: 'string', description: 'Header inscription text' },
        { name: 'liquidColor', type: 'string', default: "'#e11d48'", description: 'Color hex of the viscous liquid (3D mode)' },
      ]}
      prevPage={{ title: 'RunicButton', path: '/docs/components/runic-button' }}
      nextPage={{ title: 'LunarPhaseSelector', path: '/docs/components/lunar-phase' }}
    />
  );
}
