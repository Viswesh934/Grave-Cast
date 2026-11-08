import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Button, type ButtonVariant, type ButtonSize } from 'groove-ui';

export function ButtonDoc() {
  const [variant, setVariant] = useState<ButtonVariant>('primary');
  const [size, setSize] = useState<ButtonSize>('md');
  const [loading, setLoading] = useState(false);

  const codeSnippet = `<Button
  variant="${variant}"
  size="${size}"
  loading={${loading}}
  onClick={() => console.log('Gothic Action!')}
>
  Summon Ancient Spirit
</Button>`;

  return (
    <ComponentDocPage
      title="Button"
      category="Primitives"
      description="The fundamental interactive element styled with dark gothic gradients, deep crimson hover pulses, stone crypt slate borders, and built-in procedural audio clicks."
      packageName="button"
      gothicPhilosophy={{
        influence: 'Gothic Brutalism & Ancient Stone Relics',
        movement: 'Vein Pulse Glow & High-Frequency Awakening Tremble',
      }}
      preview={
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <div className="w-full p-8 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-xl flex flex-col items-center">
            <Button
              variant={variant}
              size={size}
              loading={loading}
            >
              Summon Ancient Spirit
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['primary', 'secondary', 'ghost', 'danger'] as ButtonVariant[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                  variant === v
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-emerald-700/60 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
            {(['sm', 'md', 'lg'] as ButtonSize[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`px-3 py-1.5 text-xs rounded-xl font-mono uppercase transition-all cursor-pointer ${
                  size === s
                    ? 'bg-teal-950/80 text-teal-200 border border-teal-600/80 font-bold shadow-md shadow-teal-950/40'
                    : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-teal-700/60 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLoading(!loading)}
              className="px-3 py-1.5 text-xs rounded-xl font-mono text-emerald-300 bg-[#102219] border border-[#1b3a2a] hover:text-white cursor-pointer"
            >
              Loading: {loading ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: "'primary'", description: 'Visual appearance variant' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Button size preset' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Show animated rotating spinner' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled state' },
        { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Expand to 100% container width' },
      ]}
      prevPage={{ title: 'CobwebCorner', path: '/docs/components/cobweb' }}
      nextPage={{ title: 'Card', path: '/docs/components/card' }}
    />
  );
}
