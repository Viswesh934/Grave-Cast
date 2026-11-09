import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { BoneOssuaryDivider, BoneOssuaryDivider3D, Canvas, OrbitControls, type OssuaryPattern } from 'groove-ui';

export function BoneOssuaryDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [pattern, setPattern] = useState<OssuaryPattern>('crossed');
  const [showRule, setShowRule] = useState(true);

  const codeSnippet2D = `<BoneOssuaryDivider
  pattern="${pattern}"
  size="md"
  label="Catacombs Entry"
  showRule={${showRule}}
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, BoneOssuaryDivider3D } from 'groove-ui';

<div style={{ width: '100%', height: '360px' }}>
  <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }}>
    <BoneOssuaryDivider3D
      label="Catacombs Reliquary"
      pattern="${pattern}"
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="BoneOssuaryDivider"
      category="The Crypt"
      description="A decorative section divider inspired by the Paris Catacombs and Sedlec Ossuary, arranging skeletal femur bones and an anatomically sculpted skull engulfed in procedural flame ribbons and firelight."
      packageName="bone-ossuary-divider"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Catacombs Reliquaries & Sedlec Bone Architecture',
        movement: 'Living Calcium Bone Breathing & Spectral Soul Eye Flames',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-5">
          {is3DMode ? (
            <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#1e293b]/70 bg-gradient-to-b from-[#080d14] via-[#05080d] to-[#020406] shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] relative">
              <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }}>
                <BoneOssuaryDivider3D
                  label="Catacombs Reliquary"
                  pattern={pattern}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#05080d]/85 backdrop-blur-xs py-1.5 border-t border-[#1e293b]/60">
                Drag to inspect sculpted skull · Procedural flame tongues licking from cranium and sockets
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-stone-400 font-mono text-center tracking-wider uppercase">Upper Chamber (Sacrifice)</p>
              <div className="p-6 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-xl">
                <BoneOssuaryDivider
                  pattern={pattern}
                  size="md"
                  label="Catacombs Inscription"
                  showRule={showRule}
                />
              </div>
              <p className="text-xs text-stone-400 font-mono text-center tracking-wider uppercase">Lower Vault (Eternal Rest)</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['crossed', 'row', 'scattered', 'stacked'] as OssuaryPattern[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPattern(p)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                  pattern === p
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
                }`}
              >
                Pattern: {p}
              </button>
            ))}
            {!is3DMode && (
              <button
                type="button"
                onClick={() => setShowRule(!showRule)}
                className="px-3 py-1.5 text-xs rounded-xl font-mono text-emerald-300 bg-[#102219] border border-[#1b3a2a] hover:text-white cursor-pointer"
              >
                Rule: {showRule ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'pattern', type: "'crossed' | 'row' | 'scattered' | 'stacked'", default: "'crossed'", description: 'Bone arrangement geometry' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Bone size preset' },
        { name: 'label', type: 'string', description: 'Central inscription or divider title' },
        { name: 'showRule', type: 'boolean', default: 'false', description: 'Horizontal vellum line rules (2D mode)' },
      ]}
      prevPage={{ title: 'ExcavationLoader', path: '/docs/components/excavation' }}
      nextPage={{ title: 'MausoleumDrawer', path: '/docs/components/mausoleum' }}
    />
  );
}
