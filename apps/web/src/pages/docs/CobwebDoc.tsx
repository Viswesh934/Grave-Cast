import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { CobwebCorner, type CobwebPosition, type CobwebSize } from 'groove-ui';

export function CobwebDoc() {
  const [position, setPosition] = useState<CobwebPosition>('top-right');
  const [size, setSize] = useState<CobwebSize>('md');
  const [spider, setSpider] = useState(true);

  const codeSnippet = `<div className="relative w-80 h-48 border border-stone-800 rounded-xl overflow-hidden p-6 bg-stone-900">
  <CobwebCorner
    position="${position}"
    size="${size}"
    hasSpider={${spider}}
    interactive={true}
  />
  <p className="text-sm text-stone-300">Hover near the corner to see the spider descend on silk...</p>
</div>`;

  return (
    <ComponentDocPage
      title="CobwebCorner"
      category="The Arachnid"
      description="An intricate, procedural SVG spiderweb that spans across any card or screen corner with delicate concentric spiral silk geometry and an interactive dangling spider."
      packageName="cobweb-corner"
      preview={
        <div className="relative w-full max-w-md h-56 rounded-2xl border border-[#2b2d3d] bg-[#101119] p-6 overflow-hidden flex items-center justify-center text-center shadow-xl">
          <CobwebCorner
            position={position}
            size={size}
            hasSpider={spider}
            interactive={true}
          />
          <div className="space-y-1">
            <span className="text-2xl">🕷️</span>
            <p className="text-xs text-stone-400 font-mono">
              Hover over the spiderweb to watch the arachnid drop!
            </p>
          </div>

          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as CobwebPosition[]).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosition(pos)}
                className={`px-2 py-0.5 text-[10px] rounded font-mono transition-all cursor-pointer ${
                  position === pos
                    ? 'bg-red-950 text-red-200 border border-red-800'
                    : 'bg-[#151722] text-stone-400 border border-[#262838]'
                }`}
              >
                {pos}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSpider(!spider)}
              className="px-2 py-0.5 text-[10px] rounded font-mono text-stone-400 bg-[#151722] border border-[#262838] cursor-pointer"
            >
              Spider: {spider ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'position', type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'", default: "'top-right'", description: 'Anchor corner placement' },
        { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Radial web spread dimension' },
        { name: 'hasSpider', type: 'boolean', default: 'true', description: 'Whether to spawn a dangling spider' },
        { name: 'interactive', type: 'boolean', default: 'true', description: 'Enable elastic silk drop animation on hover' },
      ]}
      variants={[
        {
          title: 'All Four Corners Covered',
          element: (
            <div className="relative w-full max-w-sm h-40 rounded-xl border border-[#232536] bg-[#0c0d14] p-4 flex items-center justify-center text-center overflow-hidden">
              <CobwebCorner position="top-left" size="sm" hasSpider={false} />
              <CobwebCorner position="top-right" size="sm" hasSpider={true} />
              <CobwebCorner position="bottom-left" size="sm" hasSpider={false} />
              <CobwebCorner position="bottom-right" size="sm" hasSpider={false} />
              <span className="text-xs font-mono text-stone-400">Infested Tomb Chamber</span>
            </div>
          ),
        },
      ]}
      prevPage={{ title: 'ChickenLegStepper', path: '/docs/components/chicken-legs' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
