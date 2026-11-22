import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { BitingFrame, Button } from 'groove-ui';

const codeSnippet = `import { useState } from 'react';
import { BitingFrame } from 'groove-ui';

export function MimicChest() {
  const [bitten, setBitten] = useState(false);

  return (
    <BitingFrame biting={bitten} color="#e5e5e5">
      <div style={{ padding: '24px', background: '#0e1713' }}>
        <h3>Grave Relic Vault</h3>
        <button onClick={() => setBitten(!bitten)}>
          {bitten ? 'Release Jaws' : 'Snap Jaws'}
        </button>
      </div>
    </BitingFrame>
  );
}`;

export function BitingFrameDoc() {
  const [biting, setBiting] = useState(true);
  const [color, setColor] = useState('#e6e1d6');

  return (
    <ComponentDocPage
      title="BitingFrame"
      category="The Effects"
      description="An organic containment boundary lined with sharp, staggered rows of skeletal teeth. When snapped shut, the jaws clamp down over the inner content with bone-crunching ease."
      packageName="biting-frame"
      preview={
        <div className="w-full max-w-lg flex flex-col items-center gap-6 p-6">
          <BitingFrame biting={biting} color={color} className="w-full">
            <div className="p-8 rounded-2xl bg-[#0c1912] border border-[#1b3d2b] text-center space-y-4">
              <span className="text-3xl">🦴</span>
              <h3 className="font-serif text-xl font-bold text-white">
                Cursed Ossuary Vault
              </h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                Notice the interlocking canine fangs extending from top and bottom margins when the jaws are triggered.
              </p>
              <Button
                variant={biting ? 'danger' : 'gothic'}
                onClick={() => setBiting(!biting)}
                className="text-xs font-mono"
              >
                {biting ? 'Release Trap (Open)' : 'Snap Trap (Bite)'}
              </Button>
            </div>
          </BitingFrame>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-stone-400">Fang Color:</span>
            {[
              { label: 'Bone', val: '#e6e1d6' },
              { label: 'Eldritch', val: '#34d399' },
              { label: 'Bloodied', val: '#f87171' },
              { label: 'Gold', val: '#fbbf24' },
            ].map((c) => (
              <button
                key={c.val}
                type="button"
                onClick={() => setColor(c.val)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono border transition-all ${
                  color === c.val
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200'
                    : 'border-[#1b3a2a] bg-[#0c1813] text-stone-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'biting', type: 'boolean', description: 'When true, teeth rows snap inwards to bite the content' },
        { name: 'color', type: 'string', default: 'palette.bone[200]', description: 'Fill colour of the carved tooth paths' },
        { name: 'radius', type: 'string', default: "'1rem'", description: 'Corner radius matching the enclosed element' },
        { name: 'children', type: 'ReactNode', description: 'The inner component or panel framed by the jaws' },
        { name: 'className', type: 'string', default: "''", description: 'Additional classes applied to the outer wrapper' },
      ]}
      prevPage={{ title: 'HauntedDiary', path: '/docs/components/diary' }}
      nextPage={{ title: 'BroomProgress', path: '/docs/components/broom-progress' }}
    />
  );
}

