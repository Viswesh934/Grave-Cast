import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { ExcavationLoader, ExcavationLoader3D, Canvas, OrbitControls, type ExcavationSize, type ExcavationSpeed } from 'groove-ui';

export function ExcavationDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [size, setSize] = useState<ExcavationSize>('md');
  const [speed, setSpeed] = useState<ExcavationSpeed>('normal');
  const [showMessage, setShowMessage] = useState(true);

  const codeSnippet2D = `<ExcavationLoader
  size="${size}"
  speed="${speed}"
  message="Excavating dead repository branches..."
  showMessage={${showMessage}}
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, ExcavationLoader3D } from 'groove-ui';

<div style={{ width: '100%', height: '360px' }}>
  <Canvas camera={{ position: [0, 0.5, 5.0], fov: 42 }}>
    <ExcavationLoader3D
      speed="${speed}"
      message="Excavating cursed ground..."
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="ExcavationLoader"
      category="The Crypt"
      description="An authentic excavation scene featuring an excavated subterranean grave trench, an iron graveyard spade clutched by a skeletal gravedigger, and parabolic flying dirt clods."
      packageName="excavation-loader"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Catacomb Excavations & Cursed Ground Churn',
        movement: 'Rhythmic Shovel Stroke Physics & Parabolic Dirt Ejection',
      }}
      preview={
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {is3DMode ? (
            <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#1b3d2b] bg-[#08120e] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0.4, 5.0], fov: 42 }}>
                <ExcavationLoader3D
                  speed={speed}
                  message={showMessage ? "Excavating cursed ground..." : undefined}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={0.3} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#08120e]/80 py-1 border-t border-[#1b3d2b]">
                Real excavation trench · Iron spade digging cycle · Parabolic dirt physics
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-inner flex flex-col items-center">
              <ExcavationLoader
                size={size}
                speed={speed}
                message="Excavating dead repository branches..."
                showMessage={showMessage}
              />
            </div>
          )}

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {!is3DMode && (['sm', 'md', 'lg'] as ExcavationSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono uppercase transition-all cursor-pointer ${
                  size === s
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
                }`}
              >
                Size: {s}
              </button>
            ))}
            {(['slow', 'normal', 'fast'] as ExcavationSpeed[]).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSpeed(sp)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                  speed === sp
                    ? 'bg-teal-950/80 text-teal-200 border border-teal-600/80 font-bold shadow-md shadow-teal-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-teal-700/60 hover:text-white'
                }`}
              >
                Speed: {sp}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowMessage(!showMessage)}
              className="px-3 py-1.5 text-xs rounded-xl font-mono text-emerald-300 bg-[#102219] border border-[#1b3a2a] hover:text-white cursor-pointer"
            >
              Label: {showMessage ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'speed', type: "'slow' | 'normal' | 'fast'", default: "'normal'", description: 'Digging stroke animation frequency' },
        { name: 'message', type: 'string', default: "'Loading...'", description: 'Screen reader and caption text' },
        { name: 'showMessage', type: 'boolean', default: 'false', description: 'Whether to show the flickering caption below' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Dimension scale (2D mode)' },
      ]}
      prevPage={{ title: 'TombstoneCard', path: '/docs/components/tombstone' }}
      nextPage={{ title: 'BoneOssuaryDivider', path: '/docs/components/ossuary' }}
    />
  );
}
