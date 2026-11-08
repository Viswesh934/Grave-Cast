import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { CauldronBrew, CauldronBrew3D, Canvas, OrbitControls, type BrewColor } from 'groove-ui';

export function CauldronDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [brewColor, setBrewColor] = useState<BrewColor>('witchfire');
  const [boiling, setBoiling] = useState(true);

  const codeSnippet2D = `<CauldronBrew
  brewColor="${brewColor}"
  boiling={${boiling}}
  soundOnBubble={true}
  label="Potion of Spectral Fire"
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, CauldronBrew3D } from 'groove-ui';

<div style={{ width: '100%', height: '380px' }}>
  <Canvas camera={{ position: [0, 1.8, 4.8], fov: 42 }}>
    <CauldronBrew3D
      brewColor="${brewColor}"
      boiling={${boiling}}
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="CauldronBrew"
      category="The Coven"
      description="A cast-iron witch's cauldron with swirling bubbling potion, rising volumetric vapor puffs, and procedural audio bubbling feedback."
      packageName="cauldron-brew"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Occult Covens & Ancient Alchemical Crucibles',
        movement: 'Swirling Viscous Vortex & Rising Volumetric Vapor',
      }}
      preview={
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          {is3DMode ? (
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#2b2e45] bg-[#07080f] relative shadow-2xl">
              <Canvas camera={{ position: [0, 1.6, 4.8], fov: 42 }}>
                <CauldronBrew3D
                  brewColor={brewColor}
                  boiling={boiling}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={0.4} />
              </Canvas>
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-stone-400 bg-black/40 py-0.5">
                Drag to inspect cauldron rim · Watch volumetric steam clouds rise
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#090a12] border border-[#24263a] shadow-2xl flex flex-col items-center">
              <CauldronBrew
                brewColor={brewColor}
                boiling={boiling}
                soundOnBubble={true}
                label="Potion of Spectral Fire"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['witchfire', 'emerald', 'blood', 'gold'] as BrewColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBrewColor(c)}
                className={`px-3 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  brewColor === c
                    ? 'bg-purple-950 text-purple-200 border border-purple-600 font-bold shadow-sm'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setBoiling(!boiling)}
              className="px-3 py-1 text-xs rounded-lg font-mono text-stone-300 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
            >
              Steam: {boiling ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'brewColor', type: "'emerald' | 'witchfire' | 'blood' | 'gold'", default: "'emerald'", description: 'Liquid surface and ambient glow color' },
        { name: 'boiling', type: 'boolean', default: 'true', description: 'Enable rising vapor mist and surface bubbles' },
        { name: 'soundOnBubble', type: 'boolean', default: 'true', description: 'Synthesize audio bubble sound on click' },
        { name: 'scale', type: 'number', default: '1.6', description: 'Dimension scale of the 3D model' },
      ]}
      prevPage={{ title: 'CoffinAccordion', path: '/docs/components/coffin-accordion' }}
      nextPage={{ title: 'RunicButton', path: '/docs/components/runic-button' }}
    />
  );
}
