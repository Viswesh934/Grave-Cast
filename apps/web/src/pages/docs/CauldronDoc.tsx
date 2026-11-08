import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { CauldronBrew, type BrewColor } from 'groove-ui';

export function CauldronDoc() {
  const [brewColor, setBrewColor] = useState<BrewColor>('witchfire');
  const [boiling, setBoiling] = useState(true);

  const codeSnippet = `<CauldronBrew
  brewColor="${brewColor}"
  boiling={${boiling}}
  soundOnBubble={true}
  label="Potion of Spectral Fire"
/>`;

  return (
    <ComponentDocPage
      title="CauldronBrew"
      category="The Coven"
      description="A bubbling cast-iron witch's cauldron with animated potion steam vapor, pulsating boiling liquid, and procedural Web Audio bubble sounds upon stirring."
      packageName="cauldron-brew"
      preview={
        <div className="flex flex-col items-center gap-6">
          <CauldronBrew
            brewColor={brewColor}
            boiling={boiling}
            soundOnBubble={true}
            label="Potion of Spectral Fire"
          />

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['emerald', 'witchfire', 'blood', 'gold'] as BrewColor[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBrewColor(c)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  brewColor === c
                    ? 'bg-purple-950 text-purple-200 border border-purple-500 font-bold'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                Color: {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setBoiling(!boiling)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono text-stone-400 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
            >
              Steam: {boiling ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'brewColor', type: "'emerald' | 'witchfire' | 'blood' | 'gold'", default: "'emerald'", description: 'Liquid surface and ambient glow color' },
        { name: 'boiling', type: 'boolean', default: 'true', description: 'Enable rising vapor mist and surface bubbles' },
        { name: 'soundOnBubble', type: 'boolean', default: 'true', description: 'Synthesize audio bubble sound on click' },
        { name: 'label', type: 'string', description: 'Occult potion description label' },
      ]}
      prevPage={{ title: 'CoffinAccordion', path: '/docs/components/coffin-accordion' }}
      nextPage={{ title: 'RunicButton', path: '/docs/components/runic-button' }}
    />
  );
}

