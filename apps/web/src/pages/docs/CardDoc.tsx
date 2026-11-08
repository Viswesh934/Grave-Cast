import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Card, type CardVariant, type CardPadding, Button } from 'groove-ui';

export function CardDoc() {
  const [variant, setVariant] = useState<CardVariant>('elevated');
  const [padding, setPadding] = useState<CardPadding>('md');
  const [interactive, setInteractive] = useState(true);

  const codeSnippet = `<Card
  variant="${variant}"
  padding="${padding}"
  interactive={${interactive}}
  header={<h3 className="font-bold">Ancient Catacombs Crypt</h3>}
  footer={<Button size="sm">Inspect Remains</Button>}
>
  <p className="text-sm text-stone-300">
    Carved from ancient slate with subtle stone bevel borders and deep occult shadows.
  </p>
</Card>`;

  return (
    <ComponentDocPage
      title="Card"
      category="Primitives"
      description="The base container component with chiseled stone borders, dark granite backgrounds, subtle atmospheric blur, and lift-on-hover physics."
      packageName="card"
      gothicPhilosophy={{
        influence: 'Gothic Basalt Monuments & Crypt Vaults',
        movement: 'Hover Lift Physics & Deep Ambient Occlusion Shadows',
      }}
      preview={
        <div className="w-full max-w-2xl space-y-5">
          <Card
            variant={variant}
            padding={padding}
            interactive={interactive}
            header={<h3 className="font-serif font-bold text-base text-white">Ancient Catacombs Crypt</h3>}
            footer={<Button size="sm" variant="ghost">Inspect Remains →</Button>}
          >
            <p className="text-xs text-stone-300 leading-relaxed">
              Carved from ancient basalt with subtle stone bevel borders and deep sacrificial occult drop shadows.
            </p>
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3 shadow-xl">
            {(['default', 'elevated', 'outlined', 'flat'] as CardVariant[]).map((v) => (
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
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'variant', type: "'default' | 'elevated' | 'outlined' | 'flat'", default: "'default'", description: 'Container aesthetic styling' },
        { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Internal padding scale' },
        { name: 'interactive', type: 'boolean', default: 'false', description: 'Enable hover lift and purple aura shadow' },
      ]}
      prevPage={{ title: 'Button', path: '/docs/components/button' }}
      nextPage={{ title: 'Badge', path: '/docs/components/badge' }}
    />
  );
}
