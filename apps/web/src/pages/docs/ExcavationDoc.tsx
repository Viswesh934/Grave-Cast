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
      description="An animated loading component evoking archaeological excavations and graveyard digging with a rotating bone shovel tool and parabolic flying dirt particles."
      packageName="excavation-loader"
      preview={
        <div className="flex flex-col items-center gap-6">
          <ExcavationLoader
            size={size}
            speed={speed}
            message="Excavating dead repository branches..."
            showMessage={showMessage}
          />

          {/* Interactive controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['sm', 'md', 'lg'] as ExcavationSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono uppercase transition-all cursor-pointer ${
                  size === s
                    ? 'bg-red-950 text-red-200 border border-red-800 font-bold'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
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
                className={`px-2.5 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  speed === sp
                    ? 'bg-red-950 text-red-200 border border-red-800 font-bold'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                Speed: {sp}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowMessage(!showMessage)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono text-stone-400 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
            >
              Text: {showMessage ? 'Visible' : 'Hidden'}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Dimension of the excavator bone tool' },
        { name: 'speed', type: "'slow' | 'normal' | 'fast'", default: "'normal'", description: 'Digging stroke animation frequency' },
        { name: 'message', type: 'string', default: "'Loading...'", description: 'Accessible screen reader and caption text' },
        { name: 'showMessage', type: 'boolean', default: 'false', description: 'Whether to show the flickering caption below' },
      ]}
      prevPage={{ title: 'TombstoneCard', path: '/docs/components/tombstone' }}
      nextPage={{ title: 'BoneOssuaryDivider', path: '/docs/components/ossuary' }}
    />
  );
}

