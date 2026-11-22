import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { GhostRun, Button } from 'groove-ui';

const codeSnippet = `import { useState } from 'react';
import { GhostRun } from 'groove-ui';

export function GraveyardMiniGame() {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <button onClick={() => setPlaying(true)}>Play Ghost Run</button>
      <GhostRun
        open={playing}
        onClose={() => setPlaying(false)}
        storageKey="gravecast_ghostrun_hi"
      />
    </>
  );
}`;

export function GhostRunDoc() {
  const [open, setOpen] = useState(false);

  return (
    <ComponentDocPage
      title="GhostRun"
      category="The Effects"
      description="An interactive arcade mini-game built directly into the design system: a spectral wisp drifts through an endless moonlit graveyard, leaping over crumbling headstones, collecting soul coins, and defying mortal gravity with real-time procedural sound."
      packageName="ghost-run"
      preview={
        <div className="w-full max-w-xl flex flex-col items-center justify-center p-8 rounded-2xl border border-[#1b3d2b] bg-[#091510] gap-6 text-center shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-xs font-mono text-emerald-300">
              <span>🎮 Built-in Easter Egg & Arcade Engine</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white">
              Midnight Graveyard Dash
            </h3>
            <p className="text-sm text-stone-400 max-w-md">
              Press Space or click to leap over headstones and harvest coins. Complete with procedural physics, frame loops, and retro audio beeps.
            </p>
          </div>

          <Button
            variant="gothic"
            onClick={() => setOpen(true)}
            className="px-6 py-3 font-serif text-base"
          >
            Launch Ghost Run
          </Button>

          <GhostRun
            open={open}
            onClose={() => setOpen(false)}
            storageKey="gc_doc_ghostrun_highscore"
          />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'open', type: 'boolean', description: 'Whether the full-screen arcade overlay is active' },
        { name: 'onClose', type: '() => void', description: 'Called when the player closes or presses Escape' },
        { name: 'storageKey', type: 'string', default: 'undefined', description: 'Optional key in localStorage to store the player’s personal best record' },
        { name: 'title', type: 'string', default: "'Ghost run'", description: 'Title banner displayed during the run' },
        { name: 'sounds', type: 'GhostRunSounds', description: 'Sound bindings for jump, coin pickup, and stone crash events' },
      ]}
      prevPage={{ title: 'HauntedDiary', path: '/docs/components/diary' }}
      nextPage={{ title: 'BitingFrame', path: '/docs/components/biting-frame' }}
    />
  );
}

