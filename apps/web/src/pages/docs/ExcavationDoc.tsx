import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { ExcavationLoader, type ExcavationSize, type ExcavationSpeed } from 'groove-ui';

export function ExcavationDoc() {
  const [size, setSize] = useState<ExcavationSize>('md');
  const [speed, setSpeed] = useState<ExcavationSpeed>('normal');
  const [showMessage, setShowMessage] = useState(true);

  const codeSnippet = `<ExcavationLoader
  size="${size}"
  speed="${speed}"
  message="Excavating dead repository branches..."
  showMessage={${showMessage}}
/>`;

  return (
    <ComponentDocPage
      title="ExcavationLoader"
      category="The Crypt"
      description="A grave-digging loader: a spade churns the earth and flings dirt clods while something loads."
      packageName="excavation-loader"
      gothicPhilosophy={{
        influence: 'Catacomb Excavations & Cursed Ground Churn',
        movement: 'Rhythmic Shovel Stroke Physics & Parabolic Dirt Ejection',
      }}
      preview={
        <div className="w-full max-w-2xl flex flex-col items-center gap-5">
          <div className="p-8 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-inner flex flex-col items-center">
            <ExcavationLoader
              size={size}
              speed={speed}
              message="Excavating dead repository branches..."
              showMessage={showMessage}
            />
          </div>

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['sm', 'md', 'lg'] as ExcavationSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono uppercase transition-all cursor-pointer ${
                  size === s
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
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
                aria-pressed={speed === sp}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                  speed === sp
                    ? 'bg-teal-950/80 text-teal-200 border border-teal-600/80 font-bold shadow-md shadow-teal-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-teal-700/60 hover:text-white'
                }`}
              >
                Speed: {sp}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowMessage(!showMessage)}
              aria-pressed={showMessage}
              className="px-3 py-1.5 text-xs rounded-xl font-mono text-emerald-300 bg-[#102219] border border-[#1b3a2a] hover:text-white cursor-pointer"
            >
              Label: {showMessage ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'speed', type: "'slow' | 'normal' | 'fast'", default: "'normal'", description: 'Digging stroke animation frequency' },
        { name: 'message', type: 'string', default: "'Loading...'", description: 'Screen reader and caption text' },
        { name: 'showMessage', type: 'boolean', default: 'false', description: 'Whether to show the flickering caption below' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Dimension scale' },
      ]}
      prevPage={{ title: 'TombstoneCard', path: '/docs/components/tombstone' }}
      nextPage={{ title: 'BoneOssuaryDivider', path: '/docs/components/ossuary' }}
    />
  );
}
