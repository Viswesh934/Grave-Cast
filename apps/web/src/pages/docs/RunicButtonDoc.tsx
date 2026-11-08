import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { RunicButton, RunicButton3D, Canvas, OrbitControls, type RuneElement } from 'groove-ui';

export function RunicButtonDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [element, setElement] = useState<RuneElement>('blood');

  const codeSnippet2D = `<RunicButton
  element="${element}"
  sigils="ᚦ ᚨ ᚱ ᚲ ᚷ"
  soundOnClick={true}
>
  Summon Entity
</RunicButton>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, RunicButton3D } from 'groove-ui';

<div style={{ width: '100%', height: '360px' }}>
  <Canvas camera={{ position: [0, 0, 5.2], fov: 40 }}>
    <RunicButton3D
      element="${element}"
      sigils="ᚦ ᚨ ᚱ ᚲ ᚷ"
    >
      Summon Entity
    </RunicButton3D>
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="RunicButton"
      category="The Coven"
      description="An obsidian tablet button inscribed with Elder Futhark runes and sigils that ignite with eldritch flame, levitating upward with trembling magnetic physics on pointer hover."
      packageName="runic-button"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Monolithic Obsidian Tablets & Eldritch Runestones',
        movement: 'Magnetic Levitation, Stone Tremble & Physical Click Depression',
      }}
      preview={
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          {is3DMode ? (
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#2b2e45] bg-[#07080f] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0, 5.2], fov: 40 }}>
                <RunicButton3D
                  element={element}
                  sigils="ᚦ ᚨ ᚱ ᚲ ᚷ"
                >
                  Summon Entity
                </RunicButton3D>
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-stone-400 bg-black/40 py-0.5">
                Hover to levitate stone · Click tablet to depress into cradle
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#090a12] border border-[#24263a] shadow-2xl flex flex-col items-center">
              <RunicButton
                element={element}
                sigils="ᚦ ᚨ ᚱ ᚲ ᚷ"
                soundOnClick={true}
              >
                Summon Ancient Entity
              </RunicButton>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['blood', 'spectral', 'fire', 'frost'] as RuneElement[]).map((el) => (
              <button
                key={el}
                type="button"
                onClick={() => setElement(el)}
                className={`px-3 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  element === el
                    ? 'bg-red-950 text-red-200 border border-red-600 font-bold shadow-md shadow-red-950/50'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'element', type: "'spectral' | 'fire' | 'blood' | 'frost'", default: "'spectral'", description: 'Magical flame aura element' },
        { name: 'sigils', type: 'string', default: "'ᚦ ᚨ ᚱ ᚲ ᚷ'", description: 'Elder Futhark rune characters shown on flanking edges' },
        { name: 'children', type: 'ReactNode', description: 'Button engraved label' },
        { name: 'onClick', type: '() => void', description: 'Click action callback' },
      ]}
      prevPage={{ title: 'CauldronBrew', path: '/docs/components/cauldron' }}
      nextPage={{ title: 'BloodVialProgress', path: '/docs/components/blood-vial' }}
    />
  );
}
