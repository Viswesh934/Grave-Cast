import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Badge, type BadgeVariant, type BadgeSize } from 'groove-ui';

export function BadgeDoc() {
  const [variant, setVariant] = useState<BadgeVariant>('danger');
  const [size, setSize] = useState<BadgeSize>('md');
  const [dot, setDot] = useState(true);

  const codeSnippet = `<Badge
  variant="${variant}"
  size="${size}"
  dot={${dot}}
>
  Cursed Entity
</Badge>`;

  return (
    <ComponentDocPage
      title="Badge"
      category="Primitives"
      description="Status indicator badges and metadata pills styled with monospace typography, glowing dot indicators, and folklore warning colors."
      packageName="badge"
      gothicPhilosophy={{
        influence: 'Occult Crypt Seals & Inscription Badges',
        movement: 'Glowing Status Embers & Monospace Crypt Typographics',
      }}
      preview={
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <div className="w-full p-8 rounded-2xl bg-[#0c1813] border border-[#183425] shadow-xl flex flex-col items-center">
            <Badge
              variant={variant}
              size={size}
              dot={dot}
            >
              Cursed Entity
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['wax-seal', 'talisman', 'danger', 'success', 'warning', 'info', 'default'] as BadgeVariant[]).map((v) => (
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
            <button
              type="button"
              onClick={() => setDot(!dot)}
              className="px-3 py-1.5 text-xs rounded-xl font-mono text-emerald-300 bg-[#102219] border border-[#1b3a2a] hover:text-white cursor-pointer"
            >
              Dot: {dot ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Color treatment' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Badge size scale' },
        { name: 'dot', type: 'boolean', default: 'false', description: 'Show glowing status indicator dot' },
      ]}
      prevPage={{ title: 'Card', path: '/docs/components/card' }}
      nextPage={{ title: 'TombstoneCard', path: '/docs/components/tombstone' }}
    />
  );
}
