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
      preview={
        <div className="flex flex-col items-center gap-6">
          <Badge
            variant={variant}
            size={size}
            dot={dot}
          >
            Cursed Entity
          </Badge>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['default', 'success', 'warning', 'danger', 'info'] as BadgeVariant[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  variant === v
                    ? 'bg-red-950 text-red-200 border border-red-800 font-bold'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDot(!dot)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono text-stone-400 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
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

