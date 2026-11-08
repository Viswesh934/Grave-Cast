import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { TombstoneCard, type TombstoneWeathering } from 'groove-ui';

export function TombstoneDoc() {
  const [weathering, setWeathering] = useState<TombstoneWeathering>('aged');
  const [showIcon, setShowIcon] = useState(true);

  const codeSnippet = `<TombstoneCard
  title="Jonathan Harker"
  subtitle="1854 - 1925"
  epitaph="Forever in the shadows of the Carpathians"
  weathering="${weathering}"
  showIcon={${showIcon}}
  status="Buried"
  statusVariant="danger"
/>`;

  return (
    <ComponentDocPage
      title="TombstoneCard"
      category="The Crypt"
      description="A weathered granite or basalt grave marker card featuring chiseled epitaph typography, customizable weathering states, and cemetery mist hover physics."
      packageName="tombstone-card"
      preview={
        <div className="w-full max-w-sm space-y-4">
          <TombstoneCard
            title="Jonathan Harker"
            subtitle="1854 - 1925"
            epitaph="Forever in the shadows of the Carpathians"
            weathering={weathering}
            showIcon={showIcon}
            status="Buried"
            statusVariant="danger"
          />

          {/* Interactive Props Control Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {(['pristine', 'aged', 'cracked', 'crumbling'] as TombstoneWeathering[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeathering(w)}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono capitalize transition-all cursor-pointer ${
                  weathering === w
                    ? 'bg-red-950 text-red-200 border border-red-800 font-bold'
                    : 'bg-[#151722] text-stone-400 border border-[#262838] hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowIcon(!showIcon)}
              className="px-2.5 py-1 text-xs rounded-lg font-mono text-stone-400 bg-[#151722] border border-[#262838] hover:text-white cursor-pointer"
            >
              Toggle Icon: {showIcon ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'title', type: 'string', description: 'Main engraved name or repository entity title' },
        { name: 'subtitle', type: 'string', description: 'Date range, commit hash, or secondary subtitle' },
        { name: 'epitaph', type: 'string', description: 'Carved italic inscription text' },
        { name: 'weathering', type: "'pristine' | 'aged' | 'cracked' | 'crumbling'", default: "'aged'", description: 'Stone decay level' },
        { name: 'showIcon', type: 'boolean', default: 'false', description: 'Display headstone SVG emblem' },
        { name: 'status', type: 'string', description: 'Status badge label' },
        { name: 'statusVariant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Badge visual variant' },
      ]}
      variants={[
        {
          title: 'Cracked Slab with Warning Badge',
          element: (
            <div className="w-full max-w-xs">
              <TombstoneCard
                title="Deprecated API"
                subtitle="v1.4.0 · Killed in 2023"
                epitaph="Replaced by GraphQL gateway"
                weathering="cracked"
                status="Deprecated"
                statusVariant="warning"
              />
            </div>
          ),
        },
        {
          title: 'Crumbling Mausoleum Grave',
          element: (
            <div className="w-full max-w-xs">
              <TombstoneCard
                title="Legacy Auth Service"
                subtitle="2016 - 2026"
                epitaph="May its memory haunt us no more"
                weathering="crumbling"
                status="Purged"
                statusVariant="danger"
              />
            </div>
          ),
        },
      ]}
      prevPage={{ title: 'Badge', path: '/docs/components/badge' }}
      nextPage={{ title: 'ExcavationLoader', path: '/docs/components/excavation' }}
    />
  );
}

