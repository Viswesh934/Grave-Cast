import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  BestiaryCharacter,
  BestiaryCharacter3D,
  bestiary,
  Canvas,
  OrbitControls,
  type HauntMode,
  type CharacterSpec,
} from 'groove-ui';

interface LoreEnvironment {
  containerStyle: string;
  statusStyle: string;
  statusText: string;
}

const LORE_ENVIRONMENTS: Record<string, LoreEnvironment> = {
  snowman: {
    // Lore: Ancient Arctic Mountain Pass / Snowy Blizzard
    containerStyle:
      'border border-slate-300/70 bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] shadow-[inset_0_0_90px_rgba(255,255,255,0.7)]',
    statusStyle: 'bg-white/85 text-slate-800 border-t border-slate-300/80 backdrop-blur-xs',
    statusText: 'Blizzard Gale Active · Click Frost Wight to cast ice curse',
  },
  yeti: {
    // Lore: High Himalayan Glacial Blizzard
    containerStyle:
      'border border-cyan-200/60 bg-gradient-to-b from-[#e0f2fe] via-[#cbd5e1] to-[#94a3b8] shadow-[inset_0_0_90px_rgba(255,255,255,0.6)]',
    statusStyle: 'bg-white/85 text-slate-800 border-t border-cyan-300/80 backdrop-blur-xs',
    statusText: 'Arctic Wind Raging · Click Yeti to unleash mountain roar',
  },
  ghost: {
    // Lore: Midnight Foggy Cemetery
    containerStyle:
      'border border-[#16303f] bg-gradient-to-b from-[#041018] via-[#030a10] to-[#020508] shadow-[inset_0_0_80px_rgba(0,240,255,0.06)]',
    statusStyle: 'bg-[#030a10]/85 text-cyan-300/80 border-t border-[#16303f] backdrop-blur-xs',
    statusText: 'Cemetery Fog Rolling · Click Wisp to unleash spectral wail',
  },
  pumpkin: {
    // Lore: Autumn Pumpkin Patch / Burnt Harvest Hearth
    containerStyle:
      'border border-[#381a0b] bg-gradient-to-b from-[#180a04] via-[#0e0502] to-[#050201] shadow-[inset_0_0_80px_rgba(249,115,22,0.06)]',
    statusStyle: 'bg-[#0e0502]/85 text-orange-300/80 border-t border-[#381a0b] backdrop-blur-xs',
    statusText: 'Harvest Embers Burning · Click Jack to flare cursed flames',
  },
  vampire: {
    // Lore: Transylvanian Sanguine Crypt
    containerStyle:
      'border border-[#3d0813] bg-gradient-to-b from-[#18040a] via-[#0d0205] to-[#040102] shadow-[inset_0_0_80px_rgba(255,0,51,0.06)]',
    statusStyle: 'bg-[#0d0205]/85 text-rose-300/80 border-t border-[#3d0813] backdrop-blur-xs',
    statusText: 'Blood-Mist Gathering · Click Alucard to summon bat swarm',
  },
  bat: {
    // Lore: Belfry Cavern / Witching Hour Violet
    containerStyle:
      'border border-[#2d123d] bg-gradient-to-b from-[#13071d] via-[#0b0310] to-[#040106] shadow-[inset_0_0_80px_rgba(168,85,247,0.06)]',
    statusStyle: 'bg-[#0b0310]/85 text-purple-300/80 border-t border-[#2d123d] backdrop-blur-xs',
    statusText: 'Belfry Shadows Fluttering · Click Vesper to pulse echolocation',
  },
  frankenstein: {
    // Lore: Stormy Tower Laboratory
    containerStyle:
      'border border-[#143221] bg-gradient-to-b from-[#08170f] via-[#040d08] to-[#010503] shadow-[inset_0_0_80px_rgba(16,185,129,0.06)]',
    statusStyle: 'bg-[#040d08]/85 text-emerald-300/80 border-t border-[#143221] backdrop-blur-xs',
    statusText: 'Galvanic Voltage Pulsing · Click Patchwork Man to surge electrodes',
  },
  goblin: {
    // Lore: Damp Catacombs Treasure Cavern
    containerStyle:
      'border border-[#333010] bg-gradient-to-b from-[#161506] via-[#0c0c03] to-[#040401] shadow-[inset_0_0_80px_rgba(234,179,8,0.06)]',
    statusStyle: 'bg-[#0c0c03]/85 text-amber-300/80 border-t border-[#333010] backdrop-blur-xs',
    statusText: 'Damp Cave Echoes · Click Snagtooth to snatch cursed relics',
  },
  mummy: {
    // Lore: Pharaoh\'s Desert Tomb Sands
    containerStyle:
      'border border-[#38270b] bg-gradient-to-b from-[#181104] via-[#0e0902] to-[#040301] shadow-[inset_0_0_80px_rgba(217,119,6,0.06)]',
    statusStyle: 'bg-[#0e0902]/85 text-yellow-300/80 border-t border-[#38270b] backdrop-blur-xs',
    statusText: 'Ancient Tomb Sands Drifting · Click Ankhef to awaken pharaoh curse',
  },
  candyman: {
    // Lore: Urban Tenement / Rust & Honey
    containerStyle:
      'border border-[#301c10] bg-gradient-to-b from-[#160c07] via-[#0d0704] to-[#040201] shadow-[inset_0_0_80px_rgba(220,38,38,0.06)]',
    statusStyle: 'bg-[#0d0704]/85 text-orange-300/80 border-t border-[#301c10] backdrop-blur-xs',
    statusText: 'Tenement Decay Whispering · Click Candyman to raise iron hook',
  },
};

export function BestiaryCharacterDoc() {
  const { characterId = 'wisp' } = useParams<{ characterId?: string }>();
  const [is3DMode, setIs3DMode] = useState(true);
  const [hauntMode, setHauntMode] = useState<HauntMode>('manifest');

  // Match the creature from the bestiary cast
  const normalizedId = characterId.toLowerCase();
  const currentSpec: CharacterSpec =
    bestiary.find((c) => c.id === normalizedId || (normalizedId === 'wisp' && c.id === 'ghost')) ||
    bestiary[0];

  const env = LORE_ENVIRONMENTS[currentSpec.id] || LORE_ENVIRONMENTS.ghost;

  const currentIndex = bestiary.findIndex((c) => c.id === currentSpec.id);
  const prevSpec = bestiary[(currentIndex - 1 + bestiary.length) % bestiary.length];
  const nextSpec = bestiary[(currentIndex + 1) % bestiary.length];

  const codeSnippet2D = `import { BestiaryCharacter, ${currentSpec.id}Spec } from 'groove-ui';

// 2D surface character with pointer tilt, contact shadow, and hover sound
<BestiaryCharacter
  spec={${currentSpec.id}Spec}
  size="lg"
  tilt={true}
  growable={true}
  showLabel={true}
/>`;

  const codeSnippet3D = `import { Canvas, OrbitControls, BestiaryCharacter3D } from 'groove-ui';

<div style={{ width: '100%', height: '460px' }}>
  <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }}>
    <BestiaryCharacter3D
      characterId="${currentSpec.id}"
      hauntMode="${hauntMode}"
    />
    <OrbitControls enableZoom={false} enablePan={false} />
  </Canvas>
</div>`;

  return (
    <ComponentDocPage
      title={currentSpec.name}
      category="The Bestiary"
      description={`${currentSpec.tagline}. An authentic interactive folklore horror entity featuring real-time 3D manifestation, chiaroscuro rim lighting, unearthly soul eyes, and cursor-driven perspective volume.`}
      packageName={`bestiary-${currentSpec.id}`}
      has3DMode={true}
      is3DMode={is3DMode}
      onToggle3D={setIs3DMode}
      gothicPhilosophy={{
        influence: `${currentSpec.name} Folklore & Gothic Bestiary Cast`,
        movement: 'Ethereal Soul Sparks, Chiaroscuro Rim Backlighting & Cursor Banking',
      }}
      preview={
        <div className="w-full max-w-3xl space-y-5">
          {is3DMode ? (
            /* Lore-Accurate Atmospheric Stage (Completely unobstructed viewport) */
            <div className={`w-full h-[460px] rounded-2xl overflow-hidden relative shadow-2xl ${env.containerStyle}`}>
              <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }}>
                <BestiaryCharacter3D
                  characterId={currentSpec.id}
                  hauntMode={hauntMode}
                />
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  maxPolarAngle={Math.PI / 2 + 0.15}
                  minPolarAngle={Math.PI / 2 - 0.25}
                />
              </Canvas>
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center p-10 rounded-2xl shadow-2xl ${
              currentSpec.id === 'snowman' || currentSpec.id === 'yeti'
                ? 'bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] border border-slate-300/80 text-slate-900 shadow-[inset_0_0_60px_rgba(255,255,255,0.8)]'
                : 'bg-[#0a1510] border border-[#1b3d2b]'
            }`}>
              <BestiaryCharacter
                spec={currentSpec}
                size="lg"
                tilt={true}
                growable={true}
                showLabel={true}
              />
              <p className={`mt-4 text-xs font-mono ${
                currentSpec.id === 'snowman' || currentSpec.id === 'yeti' ? 'text-slate-600' : 'text-stone-500'
              }`}>
                Hover to tilt · double-click figure to swell
              </p>
            </div>
          )}

          {/* Haunt Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-[#0c1813] border border-[#183425] rounded-2xl p-3.5 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
                Manifestation State:
              </span>
              {(['whisper', 'manifest', 'poltergeist'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setHauntMode(mode)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-mono uppercase tracking-wider transition-all cursor-pointer font-bold ${
                    hauntMode === mode
                      ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-600/80 shadow-md shadow-cyan-950/50'
                      : 'bg-[#102219] text-stone-300 border border-[#1b3a2a] hover:border-cyan-700/60 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
              <span>Accent:</span>
              <span className="px-2 py-0.5 rounded bg-[#102219] border border-[#1b3a2a] text-cyan-400 font-bold uppercase">
                {currentSpec.accent}
              </span>
            </div>

            {is3DMode && (
              <div className="w-full text-center text-[11px] font-mono text-stone-500 pt-1 border-t border-[#183425]/60">
                Move cursor across canvas to guide entity · Click entity to trigger curse shockwave
              </div>
            )}
          </div>

          {/* Quick Bestiary Switcher Ribbon */}
          <div className="flex items-center justify-between pt-1 text-xs font-mono">
            <Link
              to={`/docs/components/bestiary/${prevSpec.id}`}
              className="text-stone-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              ← {prevSpec.name}
            </Link>
            <Link
              to="/docs/components/bestiary"
              className="text-stone-500 hover:text-stone-300 transition-colors"
            >
              [All Creatures]
            </Link>
            <Link
              to={`/docs/components/bestiary/${nextSpec.id}`}
              className="text-stone-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              {nextSpec.name} →
            </Link>
          </div>
        </div>
      }
      codeSnippet={is3DMode ? codeSnippet3D : codeSnippet2D}
      propsList={[
        {
          name: 'characterId',
          type: 'string',
          default: `'${currentSpec.id}'`,
          description: 'Unique identifier for the bestiary creature.',
        },
        {
          name: 'hauntMode',
          type: "'whisper' | 'manifest' | 'poltergeist'",
          default: "'manifest'",
          description: 'Determines floating animation velocity, particle count, and soul flame flicker.',
        },
        {
          name: 'accentColor',
          type: 'string',
          description: 'Custom override for the soul eye glow and celestial corona disc.',
        },
        {
          name: 'onTriggerCurse',
          type: '() => void',
          description: 'Callback fired when the user clicks the 3D entity to unleash a soul shockwave.',
        },
      ]}
      prevPage={{ title: prevSpec.name, path: `/docs/components/bestiary/${prevSpec.id}` }}
      nextPage={{ title: nextSpec.name, path: `/docs/components/bestiary/${nextSpec.id}` }}
    />
  );
}

