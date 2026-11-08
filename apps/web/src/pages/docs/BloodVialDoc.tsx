import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { BloodVialProgress } from 'groove-ui';

export function BloodVialDoc() {
  const [val, setVal] = useState(68);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  const codeSnippet = `<BloodVialProgress
  value={${val}}
  max={100}
  label="Vampiric Vitality"
  orientation="${orientation}"
  showPercentage={true}
/>`;

  return (
    <ComponentDocPage
      title="BloodVialProgress"
      category="The Sanguine"
      description="An apothecary glass test tube progress bar filled with viscous coagulated blood, floating internal micro-bubbles, and glass specular reflection highlights."
      packageName="blood-vial-progress"
      preview={
        <div className="w-full max-w-sm flex flex-col items-center gap-6">
          <BloodVialProgress
            value={val}
            max={100}
            label="Vampiric Vitality"
            orientation={orientation}
            showPercentage={true}
          />

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={val}
              onChange={(e) => setVal(Number(e.target.value))}
              className="accent-red-600 cursor-pointer w-40"
            />
            <button
              type="button"
              onClick={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
              className="px-2.5 py-1 text-xs rounded-lg font-mono text-stone-400 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
            >
              Mode: {orientation}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'value', type: 'number', description: 'Current fill volume percentage (0 - max)' },
        { name: 'max', type: 'number', default: '100', description: 'Maximum vial capacity' },
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Glass tube orientation' },
        { name: 'label', type: 'string', description: 'Header text' },
        { name: 'showPercentage', type: 'boolean', default: 'true', description: 'Display percentage indicator' },
      ]}
      prevPage={{ title: 'RunicButton', path: '/docs/components/runic-button' }}
      nextPage={{ title: 'LunarPhaseSelector', path: '/docs/components/lunar-phase' }}
    />
  );
}

