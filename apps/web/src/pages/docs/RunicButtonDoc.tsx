import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { RunicButton, type RuneElement } from 'groove-ui';

export function RunicButtonDoc() {
  const [element, setElement] = useState<RuneElement>('spectral');

  const codeSnippet = `<RunicButton
  element="${element}"
  sigils="ᚦ ᚨ ᚱ ᚲ ᚷ"
  soundOnClick={true}
>
  Summon Entity
</RunicButton>`;

  return (
    <ComponentDocPage
      title="RunicButton"
      category="The Coven"
      description="An obsidian tablet button inscribed with Elder Futhark runes and sigils that ignite with eldritch flame when hovered and clicked."
      packageName="runic-button"
      preview={
        <div className="flex flex-col items-center gap-6">
          <RunicButton
            element={element}
            sigils="ᚦ ᚨ ᚱ ᚲ ᚷ"
            soundOnClick={true}
          >
            Summon Ancient Entity
          </RunicButton>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['spectral', 'fire', 'blood', 'frost'] as RuneElement[]).map((el) => (
              <button
                key={el}
                type="button"
                onClick={() => setElement(el)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  element === el
                    ? 'bg-purple-950 text-purple-200 border border-purple-500 font-bold'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'element', type: "'spectral' | 'fire' | 'blood' | 'frost'", default: "'spectral'", description: 'Magical flame aura element' },
        { name: 'sigils', type: 'string', default: "'ᚦ ᚨ ᚱ ᚲ ᚷ'", description: 'Elder Futhark rune characters shown on flanking edges' },
        { name: 'soundOnClick', type: 'boolean', default: 'true', description: 'Procedural bone-click synthesized audio trigger' },
      ]}
      prevPage={{ title: 'CauldronBrew', path: '/docs/components/cauldron' }}
      nextPage={{ title: 'BloodVialProgress', path: '/docs/components/blood-vial' }}
    />
  );
}

