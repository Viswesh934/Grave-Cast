import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { RunicButton, RunicButton3D, Canvas, OrbitControls, type RuneElement } from 'groove-ui';

export function RunicButtonDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [element, setElement] = useState<RuneElement>('spectral');

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
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          {is3DMode ? (
            <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-[#1b3d2b] bg-[#08120e] relative shadow-2xl">
              <Canvas camera={{ position: [0, 0, 5.2], fov: 40 }}>
                <RunicButton3D
                  element={element}
                  sigils="ᚦ ᚨ ᚱ ᚲ ᚷ"
                >
                  Summon Entity
                </RunicButton3D>
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#08120e]/80 py-1 border-t border-[#1b3d2b]">
                Hover to levitate stone · Click tablet to depress into cradle
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-2xl flex flex-col items-center">
              <RunicButton
                element={element}
                sigils="ᚦ ᚨ ᚱ ᚲ ᚷ"
                soundOnClick={true}
              >
                Summon Ancient Entity
              </RunicButton>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['spectral', 'frost', 'blood', 'fire'] as RuneElement[]).map((el) => (
              <button
                key={el}
                type="button"
                onClick={() => setElement(el)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                  element === el
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
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
