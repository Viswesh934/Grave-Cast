import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { SoundLibrary, EFFECT_NAMES, EFFECT_CATEGORIES } from 'groove-ui';

const codeSnippet = `import { SoundLibrary, playSound, playEffect, createEffect, downloadEffect } from 'groove-ui';

// 1. A ringtone-store style browser: search, categories,
//    preview, copy-code, and WAV download.
<SoundLibrary maxHeight={480} />

// 2. Play any sound by name. ${EFFECT_NAMES.length} are built in.
playSound('coffinCreak');
playSound('thunder', 0.8);          // louder

// 3. More control: pitch, delay, and stopping early.
const playback = playEffect('windHowl', { rate: 0.8, delay: 0.2 });
playback?.stop();

// 4. Save a sound as a file.
await downloadEffect('churchBell');  // churchBell.wav

// 5. Write your own. A sound is a short list of layers.
const drip = createEffect('drip', {
  label: 'Drip',
  category: 'ambience',
  description: 'A single drop in a cave.',
  layers: [
    { source: 'sine', freq: [1400, 600], length: 0.12 },
    { source: 'white', length: 0.03, filter: { type: 'highpass', freq: 4000 }, gain: 0.3 },
  ],
});
playEffect(drip);`;

export function SoundLibraryDoc() {
  return (
    <ComponentDocPage
      title="SoundLibrary"
      category="The Effects"
      description={`A browsable catalog of ${EFFECT_NAMES.length} procedural sound effects across ${Object.keys(EFFECT_CATEGORIES).length} categories, including vintage CPU clock cycles, mechanical keyboards, floppy seeks, and hardware Easter eggs. Pure Web Audio synthesis with zero external audio assets.`}
      packageName="sound-library"
      preview={
        <div className="w-full max-w-3xl">
          <SoundLibrary maxHeight={520} />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'category', type: "EffectCategory | 'all'", default: "'all'", description: 'Start on this category' },
        { name: 'showSearch', type: 'boolean', default: 'true', description: 'Show the search box' },
        { name: 'showCategories', type: 'boolean', default: 'true', description: 'Show the category filter chips' },
        { name: 'showDownload', type: 'boolean', default: 'true', description: 'Show a Download button that saves a WAV file' },
        { name: 'volume', type: 'number', default: '0.5', description: 'Preview loudness from 0 to 1' },
        { name: 'onPlay', type: '(name: EffectName) => void', default: '—', description: 'Called when a preview starts' },
        { name: 'maxHeight', type: 'number | string', default: '—', description: 'Maximum height of the list before it scrolls' },
        { name: 'className', type: 'string', default: "''", description: 'Extra class for the wrapper' },
      ]}
      prevPage={{ title: 'HauntedKeyboard', path: '/docs/components/haunted-keyboard' }}
      nextPage={{ title: 'HorrorBackground', path: '/docs/components/horror-background' }}
    />
  );
}
