import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { CobwebCorner, CobwebCorner3D, Canvas, OrbitControls, type CobwebPosition, type CobwebSize } from 'groove-ui';

export function CobwebDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [position, setPosition] = useState<CobwebPosition>('top-right');
  const [size, setSize] = useState<CobwebSize>('md');
  const [spider, setSpider] = useState(true);

  const codeSnippet2D = `<div className="relative w-80 h-48 border border-stone-800 rounded-xl overflow-hidden p-6 bg-stone-900">
  <CobwebCorner
    position="${position}"
    size="${size}"
    hasSpider={${spider}}
    interactive={true}
  />
  <p className="text-sm text-stone-300">Hover near corner to trigger spider drop...</p>
</div>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, CobwebCorner3D } from 'groove-ui';

<div style={{ width: '100%', height: '360px' }}>
  <Canvas camera={{ position: [0, 0, 5.0], fov: 42 }}>
    <CobwebCorner3D />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="CobwebCorner"
      category="The Arachnid"
      description="An intricate, procedural spiderweb that spans across corners with concentric spiral silk geometry and an articulated 3D arachnid that descends on silk upon pointer hover."
      packageName="cobweb-corner"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Arachnid Lairs & Concentric Web Filaments',
        movement: 'Dangling Silk Physics & Springy Arachnid Descent',
      }}
      preview={
        <div className="w-full max-w-2xl">
          {is3DMode ? (
            <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#1b3d2b] bg-[#08120e] relative shadow-2xl">
              <Canvas camera={{ position: [0.5, -0.2, 4.8], fov: 42 }}>
                <CobwebCorner3D />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#08120e]/80 py-1 border-t border-[#1b3d2b]">
                Hover over web to watch 3D arachnid descend on silk
              </div>
            </div>
          ) : (
            <div className="relative w-full h-64 rounded-2xl border border-[#183425] bg-[#0c1813] p-6 overflow-hidden flex items-center justify-center text-center shadow-xl">
              <CobwebCorner
                position={position}
                size={size}
                hasSpider={spider}
                interactive={true}
              />
              <div className="space-y-2">
                <div className="w-9 h-9 mx-auto rounded-xl bg-[#102219] border border-[#1b3a2a] flex items-center justify-center text-emerald-400 shadow-inner">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3v18M3 12h18M6 6l12 12M6 18L18 6" />
                  </svg>
                </div>
                <p className="text-xs text-stone-300 font-mono">
                  Hover corner to test filament spring physics
                </p>
              </div>

              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
                {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as CobwebPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-mono transition-all cursor-pointer ${
                      position === pos
                        ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                        : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSpider(!spider)}
                  className="px-3 py-1.5 text-xs rounded-xl font-mono text-emerald-300 bg-[#102219] border border-[#1b3a2a] hover:text-white cursor-pointer"
                >
                  Spider: {spider ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'scale', type: 'number', default: '1.6', description: 'Web dimension scale in 3D WebGL space' },
        { name: 'position', type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'", default: "'top-right'", description: 'Anchor corner placement (2D mode)' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Radial web spread dimension (2D mode)' },
        { name: 'hasSpider', type: 'boolean', default: 'true', description: 'Whether to spawn a dangling spider' },
      ]}
      prevPage={{ title: 'ChickenLegStepper', path: '/docs/components/chicken-legs' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
