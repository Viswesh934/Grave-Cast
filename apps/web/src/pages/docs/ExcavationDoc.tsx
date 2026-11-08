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
      description="An animated loading component evoking archaeological excavations and graveyard digging with a rotating bone shovel tool, parabolic flying dirt particles, and emerging skeletal fingers."
      packageName="excavation-loader"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Catacomb Excavations & Cursed Ground Churn',
        movement: 'Rhythmic Shovel Stroke Physics & Parabolic Dirt Ejection',
      }}
      preview={
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          {is3DMode ? (
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#2b2e45] bg-[#07080f] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0.4, 5.0], fov: 42 }}>
                <ExcavationLoader3D
                  speed={speed}
                  message={showMessage ? "Excavating cursed ground..." : undefined}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={0.3} />
              </Canvas>
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-stone-400 bg-black/40 py-0.5">
                Watch 3D bone shovel stroke & parabolic flying dirt voxels
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0a0b12] border border-[#222436] shadow-inner flex flex-col items-center">
              <ExcavationLoader
                size={size}
                speed={speed}
                message="Excavating dead repository branches..."
                showMessage={showMessage}
              />
            </div>
          )}

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {!is3DMode && (['sm', 'md', 'lg'] as ExcavationSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-3 py-1 text-xs rounded-lg font-mono uppercase transition-all cursor-pointer ${
                  size === s
                    ? 'bg-red-950 text-red-200 border border-red-700 font-bold shadow-sm'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
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
                className={`px-3 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  speed === sp
                    ? 'bg-amber-950 text-amber-200 border border-amber-700 font-bold shadow-sm'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                Speed: {sp}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowMessage(!showMessage)}
              className="px-3 py-1 text-xs rounded-lg font-mono text-stone-300 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
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
