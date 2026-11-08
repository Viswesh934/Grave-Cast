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
  header={<h3 className="font-bold">Crypt Chamber</h3>}
  footer={<Button size="sm">Explore</Button>}
>
  <p className="text-sm text-stone-300">
    Carved into granite slabs with subtle stone bevel borders and occult shadows.
  </p>
</Card>`;

  return (
    <ComponentDocPage
      title="Card"
      category="Primitives"
      description="The base container component with chiseled stone borders, dark granite backgrounds, subtle atmospheric blur, and lift-on-hover physics."
      packageName="card"
      preview={
        <div className="w-full max-w-sm space-y-4">
          <Card
            variant={variant}
            padding={padding}
            interactive={interactive}
            header={<h3 className="font-serif font-bold text-base text-white">Crypt Chamber</h3>}
            footer={<Button size="sm" variant="ghost">Explore Chamber →</Button>}
          >
            <p className="text-xs text-stone-300 leading-relaxed">
              Carved from ancient slate with subtle stone bevel borders and deep occult drop shadows.
            </p>
          </Card>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['default', 'elevated', 'outlined', 'flat'] as CardVariant[]).map((v) => (
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

