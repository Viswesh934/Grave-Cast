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
        <div className="w-full max-w-md">
          {is3DMode ? (
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#2b2e45] bg-[#07080f] relative shadow-2xl">
              <Canvas camera={{ position: [0.5, -0.2, 4.8], fov: 42 }}>
                <CobwebCorner3D />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-stone-400 bg-black/40 py-0.5">
                Hover over web to watch 3D arachnid descend on silk
              </div>
            </div>
          ) : (
            <div className="relative w-full h-56 rounded-2xl border border-[#2b2d3d] bg-[#101119] p-6 overflow-hidden flex items-center justify-center text-center shadow-xl">
              <CobwebCorner
                position={position}
                size={size}
                hasSpider={spider}
                interactive={true}
              />
              <div className="space-y-1">
                <span className="text-3xl">🕷️</span>
                <p className="text-xs text-stone-300 font-mono">
                  Hover over the web corner to trigger silk physics!
                </p>
              </div>

              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
                {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as CobwebPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-mono transition-all cursor-pointer ${
                      position === pos
                        ? 'bg-red-950 text-red-200 border border-red-700 font-bold'
                        : 'bg-[#151722] text-stone-400 border border-[#262838]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSpider(!spider)}
                  className="px-2.5 py-1 text-[11px] rounded-lg font-mono text-stone-300 bg-[#151722] border border-[#262838] cursor-pointer"
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
