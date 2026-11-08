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
      description="A decorative section divider inspired by the Paris Catacombs and Sedlec Ossuary, arranging skeletal femur bones and weathered skulls with glowing spectral eye sockets."
      packageName="bone-ossuary-divider"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Catacombs Reliquaries & Sedlec Bone Architecture',
        movement: 'Living Calcium Bone Breathing & Spectral Soul Eye Flames',
      }}
      preview={
        <div className="w-full max-w-xl space-y-4">
          {is3DMode ? (
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#2b2e45] bg-[#07080f] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }}>
                <BoneOssuaryDivider3D
                  label="Catacombs Reliquary"
                  pattern={pattern}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-stone-400 bg-black/40 py-0.5">
                Drag to inspect sculpted skulls · Watch flickering soul flames in eye sockets
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-stone-400 font-mono text-center tracking-wider uppercase">Upper Chamber (Sacrifice)</p>
              <div className="p-6 rounded-2xl bg-[#090a10] border border-[#232536] shadow-xl">
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

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['crossed', 'row', 'scattered', 'stacked'] as OssuaryPattern[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPattern(p)}
                className={`px-3 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  pattern === p
                    ? 'bg-red-950 text-red-200 border border-red-700 font-bold shadow-sm'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                Pattern: {p}
              </button>
            ))}
            {!is3DMode && (
              <button
                type="button"
                onClick={() => setShowRule(!showRule)}
                className="px-3 py-1 text-xs rounded-lg font-mono text-stone-300 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
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
