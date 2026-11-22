import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Backwards, Button } from 'groove-ui';

const codeSnippet = `import { useState } from 'react';
import { Backwards } from 'groove-ui';

export function ReverseTypingTest() {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <button onClick={() => setPlaying(true)}>Play Backwards</button>
      <Backwards
        open={playing}
        onClose={() => setPlaying(false)}
        storageKey="backwards-best"
      />
    </>
  );
}`;

export function BackwardsDoc() {
  const [open, setOpen] = useState(false);

  return (
    <ComponentDocPage
      title="Backwards"
      category="The Games"
      description="A typing test with a twist: type each line with its words in reverse order. Thirty seconds from the first key, scored in words per minute and accuracy. Lines are generated from small themed word lists, so they rarely repeat."
      packageName="backwards"
      preview={
        <div className="flex w-full max-w-xl flex-col items-center justify-center gap-6 rounded-2xl border border-grave-dark-600 bg-grave-dark-950 p-8 text-center">
          <div className="space-y-3">
            <p className="m-0 font-mono text-sm text-grave-mist-300">The raven watches the old gate quietly</p>
            <p className="m-0 font-mono text-sm text-grave-grove-glow">quietly gate old the watches raven The</p>
            <p className="m-0 max-w-md text-sm text-grave-mist-400">
              Words keep their own spelling and capitals. Only their order turns around.
            </p>
          </div>
          <Button variant="gothic" onClick={() => setOpen(true)} className="px-6 py-3 font-serif text-base">
            Play Backwards
          </Button>
          <Backwards open={open} onClose={() => setOpen(false)} storageKey="gc_doc_backwards_best" />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'open', type: 'boolean', description: 'Shows the game. Closing it ends the round in progress' },
        { name: 'onClose', type: '() => void', description: 'Called when the player closes the game or presses Escape' },
        { name: 'storageKey', type: 'string', default: 'undefined', description: 'Keep the best speed in localStorage under this key' },
        { name: 'lines', type: 'readonly string[]', default: '[]', description: 'Extra lines to mix in now and then. Punctuation is dropped and long lines are left out' },
        { name: 'words', type: 'BackwardsWords', default: 'BACKWARDS_WORDS', description: 'Replace the word lists made-up lines come from' },
        { name: 'title', type: 'string', default: "'Backwards'", description: 'The game window heading' },
        { name: 'closeLabel', type: 'string', default: "'Close the game'", description: 'Accessible name of the close button' },
        { name: 'sounds', type: 'Partial<BackwardsSounds>', description: 'Sounds for a finished line and the end of the round' },
      ]}
      prevPage={{ title: 'GhostRun', path: '/docs/components/ghost-run' }}
      nextPage={{ title: 'Grimoire', path: '/docs/components/grimoire' }}
    />
  );
}
