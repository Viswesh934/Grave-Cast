import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { BoneOssuaryDivider, type OssuaryPattern } from 'groove-ui';

export function BoneOssuaryDoc() {
  const [pattern, setPattern] = useState<OssuaryPattern>('crossed');
  const [showRule, setShowRule] = useState(true);

  const codeSnippet = `<BoneOssuaryDivider
  pattern="${pattern}"
  size="md"
  label="Catacombs Entry"
  showRule={${showRule}}
/>`;

  return (
    <ComponentDocPage
      title="BoneOssuaryDivider"
      category="The Crypt"
      description="A decorative section divider inspired by the Paris Catacombs and Sedlec Ossuary, arranging skeletal femur bones in crossed, stacked, or scattered patterns."
      packageName="bone-ossuary-divider"
      preview={
        <div className="w-full max-w-lg space-y-6">
          <p className="text-xs text-stone-400 font-mono text-center">Upper Chamber (Life)</p>
          <BoneOssuaryDivider
            pattern={pattern}
            size="md"
            label="Catacombs Entry"
            showRule={showRule}
          />
          <p className="text-xs text-stone-400 font-mono text-center">Lower Vault (Rest)</p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {(['crossed', 'row', 'scattered', 'stacked'] as OssuaryPattern[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPattern(p)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  pattern === p
                    ? 'bg-red-950 text-red-200 border border-red-800 font-bold'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                Pattern: {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowRule(!showRule)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono text-stone-400 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
            >
              Rule: {showRule ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'pattern', type: "'crossed' | 'row' | 'scattered' | 'stacked'", default: "'crossed'", description: 'Bone arrangement geometry' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Bone size preset' },
        { name: 'label', type: 'string', description: 'Central inscription or divider title' },
        { name: 'showRule', type: 'boolean', default: 'false', description: 'Horizontal vellum line rules' },
      ]}
      prevPage={{ title: 'ExcavationLoader', path: '/docs/components/excavation' }}
      nextPage={{ title: 'MausoleumDrawer', path: '/docs/components/mausoleum' }}
    />
  );
}

