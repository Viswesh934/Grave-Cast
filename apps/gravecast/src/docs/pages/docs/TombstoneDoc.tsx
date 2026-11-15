import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  TombstoneCard,
  TombstoneCard3D,
  TorchlightCursor,
  Canvas,
  OrbitControls,
  type TombstoneWeathering,
  type HorrorIntensity,
  type GothicRelief,
} from 'groove-ui';

export function TombstoneDoc() {
  const [is3DMode, setIs3DMode] = useState(true);
  const [weathering, setWeathering] = useState<TombstoneWeathering>('aged');
  const [intensity, setIntensity] = useState<HorrorIntensity>('cursed');
  const [relief, setRelief] = useState<GothicRelief>('sigil');
  const [showIcon, setShowIcon] = useState(true);

  const codeSnippet2D = `<TombstoneCard
  title="Jonathan Harker"
  subtitle="1854 - 1925 · Transylvania"
  epitaph="Forever in the shadows of the Carpathians."
  weathering="${weathering}"
  showIcon={${showIcon}}
  status="Buried"
  statusVariant="danger"
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, TombstoneCard3D, TorchlightCursor } from 'groove-ui';

<div style={{ width: '100%', height: '400px' }}>
  <Canvas camera={{ position: [0, 0, 7.2], fov: 42 }}>
    <TorchlightCursor intensity="${intensity}" />
    <TombstoneCard3D
      title="Jonathan Harker"
      subtitle="1854 - 1925"
      epitaph="In Shadows"
      weathering="${weathering}"
      intensity="${intensity}"
      relief="${relief}"
    />
    <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.15} minPolarAngle={Math.PI / 2 - 0.25} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title="TombstoneCard"
      category="The Crypt"
      description={
        is3DMode
          ? "A monolithic 3D gothic basalt headstone featuring hand-sculpted reliefs (sigil, reaper, skull, gargoyle, talisman), living breathing stone physics, and dynamic torchlight cursor shadows."
          : "A carved granite headstone on its base: letters cut into the stone and an incised border. Weathering ages it the way real stones age, with rain streaks, lichen, soil at the foot, cracks, and moss."
      }
      packageName="tombstone-card"
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: 'Catacombs Architecture & Ancient Crypt Monoliths',
        movement: 'Living Basalt Breathing (±1.8%) & Sacrificial Embers',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-5">
          {is3DMode ? (
            <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-[#1e293b]/70 bg-gradient-to-b from-[#080d14] via-[#05080d] to-[#020406] shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] relative">
              <Canvas camera={{ position: [0, 0, 7.2], fov: 42 }}>
                <TorchlightCursor intensity={intensity} />
                <TombstoneCard3D
                  title="J. HARKER"
                  subtitle="1854 - 1925"
                  epitaph="In Shadows"
                  weathering={weathering}
                  intensity={intensity}
                  relief={relief}
                />
                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.18} minPolarAngle={Math.PI / 2 - 0.28} />
              </Canvas>
              <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none text-[11px] font-mono text-emerald-300/80 bg-[#05080d]/85 backdrop-blur-xs py-1.5 border-t border-[#1e293b]/60">
                Move cursor to direct flickering torchlight · Drag to inspect sculpted relief
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-6">
              <TombstoneCard
                title="Jonathan Harker"
                subtitle="1854 - 1925"
                epitaph="Forever in the shadows of the Carpathians."
                weathering={weathering}
                showIcon={showIcon}
                status="Buried"
                statusVariant="danger"
              />
            </div>
          )}

          {/* Interactive Controls Bar */}
          <div className="space-y-3 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-4 shadow-xl">
            {/* Gothic Relief Selector (3D Mode) */}
            {is3DMode && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <span className="text-stone-300 font-semibold text-[11px] uppercase tracking-wider">Gothic Relief:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['sigil', 'reaper', 'skull', 'gargoyle', 'talisman'] as GothicRelief[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRelief(r)}
                      className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                        relief === r
                          ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                          : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:text-white hover:border-emerald-700/60'
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weathering Decay Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <span className="text-stone-300 font-semibold text-[11px] uppercase tracking-wider">Weathering:</span>
              <div className="flex flex-wrap gap-1.5">
                {(['pristine', 'aged', 'cracked', 'crumbling'] as TombstoneWeathering[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeathering(w)}
                    className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                      weathering === w
                        ? 'bg-teal-950/80 text-teal-200 border border-teal-600/80 font-bold shadow-md shadow-teal-950/40'
                        : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:text-white hover:border-teal-700/60'
                      }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity / Torchlight Selector */}
            {is3DMode ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <span className="text-stone-300 font-semibold text-[11px] uppercase tracking-wider">Torchlight:</span>
                <div className="flex gap-1.5">
                  {(['ghastly', 'cursed', 'abyssal'] as HorrorIntensity[]).map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIntensity(i)}
                      className={`px-3 py-1.5 text-xs rounded-xl font-mono capitalize transition-all cursor-pointer ${
                        intensity === i
                          ? 'bg-emerald-900/70 text-emerald-200 border border-emerald-600/80 font-bold shadow-md shadow-emerald-950/40'
                          : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:text-white hover:border-emerald-700/60'
                        }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-300 font-semibold text-[11px] uppercase tracking-wider">Icon Badge:</span>
                <button
                  type="button"
                  onClick={() => setShowIcon(!showIcon)}
                  className="px-3 py-1.5 text-xs rounded-xl font-mono text-emerald-300 bg-[#102219] border border-[#1b3a2a] hover:text-white cursor-pointer"
                >
                  {showIcon ? 'Shown' : 'Hidden'}
                </button>
              </div>
            )}
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        { name: 'title', type: 'string', description: 'Main engraved name or repository entity title' },
        { name: 'subtitle', type: 'string', description: 'Date range, commit hash, or secondary subtitle' },
        { name: 'epitaph', type: 'string', description: 'Carved italic inscription text' },
        { name: 'relief', type: "'sigil' | 'reaper' | 'skull' | 'gargoyle' | 'talisman'", default: "'sigil'", description: 'Hand-sculpted relief carved on headstone crown' },
        { name: 'weathering', type: "'pristine' | 'aged' | 'cracked' | 'crumbling'", default: "'aged'", description: 'Procedural stone erosion, moss, and fissure depth' },
        { name: 'intensity', type: "'ghastly' | 'cursed' | 'abyssal'", default: "'cursed'", description: 'Torchlight flicker rate, color temperature, and shadow intensity' },
        { name: 'showIcon', type: 'boolean', default: 'true', description: 'Display headstone SVG emblem (2D card mode)' },
        { name: 'status', type: 'string', description: 'Status badge label' },
        { name: 'statusVariant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Badge visual variant' },
      ]}
      variants={[
        {
          title: 'Carved Skull Catacomb Slab',
          description: 'Aged basalt featuring a hollow skull relief with weathered warning badge',
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
          title: 'Crumbling Mausoleum Monolith',
          description: 'Heavily weathered grave slab draped in moss and ancient fissures',
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
