import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  HorrorCursor,
  RitualCandleGlyph,
  BloodyDaggerGlyph,
  SpectralWispGlyph,
  SkeletalHandGlyph,
  type HorrorCursorVariant,
} from 'groove-ui';

const VARIANTS: { id: HorrorCursorVariant; label: string; blurb: string }[] = [
  { id: 'ritual-candle', label: 'Ritual Candle', blurb: 'Warm flame with a gold halo' },
  { id: 'bloody-dagger', label: 'Bloody Dagger', blurb: 'Snappy blade, dripping tip' },
  { id: 'spectral-wisp', label: 'Spectral Wisp', blurb: 'Floaty orb with ecto-trail' },
  { id: 'skeletal-hand', label: 'Skeletal Hand', blurb: 'Grasps when you click' },
];

const GLYPHS: Record<HorrorCursorVariant, (c: string) => React.ReactNode> = {
  'ritual-candle': (c) => <RitualCandleGlyph size={34} color={c} accent="#d4af37" />,
  'bloody-dagger': (c) => <BloodyDaggerGlyph size={34} color={c} accent="#bd081c" />,
  'spectral-wisp': (c) => <SpectralWispGlyph size={34} color={c} accent="#10b981" />,
  'skeletal-hand': (c) => <SkeletalHandGlyph size={34} color={c} accent="#b8a99a" />,
};

export function HorrorCursorDoc() {
  const [variant, setVariant] = useState<HorrorCursorVariant>('spectral-wisp');
  const [active, setActive] = useState(false);

  const codeSnippet = `import { HorrorCursor } from 'groove-ui';

// Replace the OS cursor anywhere near your app root.
// Automatically disables on touch devices and honors
// prefers-reduced-motion.
<HorrorCursor variant="${variant}" clickSound="boneClick" />`;

  return (
    <ComponentDocPage
      title="HorrorCursor"
      category="The Arachnid"
      description="A smooth, physics-eased custom cursor that replaces the OS pointer with horror-themed artwork. Four built-in variants, a render-prop escape hatch for custom glyphs, optional click sounds, and automatic fallbacks for touch and reduced-motion users."
      packageName="horror-cursor"
      gothicPhilosophy={{
        influence: 'Ritual Tools & Restless Spirits',
        movement: 'Damped Pointer Easing & Trailing Ectoplasm',
      }}
      preview={
        <div className="w-full max-w-2xl">
          <div
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            className="relative w-full h-72 rounded-2xl border border-[#183425] bg-[#0c1813] overflow-hidden flex flex-col items-center justify-center gap-3 text-center shadow-xl"
          >
            {/* The cursor is scoped to this preview region via `enabled` */}
            <HorrorCursor variant={variant} enabled={active} clickSound="boneClick" />

            <div className="text-emerald-300/90">{GLYPHS[variant]('#e8e0d5')}</div>
            <p className="text-sm text-stone-300 font-mono px-6">
              {active
                ? 'Move around — click to see the press reaction'
                : 'Hover this panel to summon the cursor'}
            </p>

            <div className="absolute bottom-3 inset-x-0 flex flex-wrap items-center justify-center gap-2 px-3">
              {VARIANTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariant(v.id)}
                  title={v.blurb}
                  className={`px-3 py-1.5 text-xs rounded-xl font-mono transition-all cursor-pointer ${
                    variant === v.id
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                      : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'variant', type: "'ritual-candle' | 'bloody-dagger' | 'spectral-wisp' | 'skeletal-hand'", default: "'ritual-candle'", description: 'Which cursor glyph to render' },
        { name: 'enabled', type: 'boolean', default: 'true', description: 'Toggle the cursor on/off; restores the native cursor when false' },
        { name: 'hideNativeCursor', type: 'boolean', default: 'true', description: 'Hide the OS cursor while active' },
        { name: 'clickSound', type: 'SpookySound', default: '—', description: 'Procedural sound played on click (needs AudioProvider enabled)' },
        { name: 'children', type: '(state: { isPressed: boolean }) => ReactNode', default: '—', description: 'Render-prop escape hatch for a fully custom glyph' },
        { name: 'className', type: 'string', default: "''", description: 'Extra class applied to the cursor layer' },
      ]}
      prevPage={{ title: 'CobwebCorner', path: '/docs/components/cobweb' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
