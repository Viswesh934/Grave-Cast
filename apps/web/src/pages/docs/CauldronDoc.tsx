import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { CauldronBrew, CauldronBrew3D, Canvas, OrbitControls, type BrewColor } from 'groove-ui';

export function CauldronDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [brewColor, setBrewColor] = useState<BrewColor>('emerald');
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
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {is3DMode ? (
            <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#1e293b]/70 bg-gradient-to-b from-[#080d14] via-[#05080d] to-[#020406] shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] relative">
              <Canvas camera={{ position: [0, 1.6, 4.8], fov: 42 }}>
                <CauldronBrew3D
                  brewColor={brewColor}
                  boiling={boiling}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={0.4} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#05080d]/85 backdrop-blur-xs py-1.5 border-t border-[#1e293b]/60">
                Drag to inspect cauldron rim · Watch volumetric steam clouds rise
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-2xl flex flex-col items-center">
              <CauldronBrew
                brewColor={brewColor}
                boiling={boiling}
                soundOnBubble={true}
                label="Potion of Spectral Fire"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['emerald', 'witchfire', 'blood', 'gold'] as BrewColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBrewColor(c)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                  brewColor === c
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setBoiling(!boiling)}
              className="px-3 py-1.5 text-xs rounded-xl font-mono text-emerald-300 bg-[#102219] border border-[#1b3a2a] hover:text-white cursor-pointer"
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
