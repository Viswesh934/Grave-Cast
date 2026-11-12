import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { VigilRite, vigilRite } from 'groove-ui';
import { riteNeighbors } from './paths';

const codeSnippet = `import { VigilRite, useVigil, useFullscreen } from 'groove-ui/grimoire';

// The whole rite.
<VigilRite />

// Or keep the screen awake yourself.
const vigil = useVigil();
<button onClick={vigil.start}>Keep the screen on</button>
<p>{vigil.status === 'active' ? 'Awake' : 'May sleep'}</p>`;

export function VigilDoc() {
  return (
    <ComponentDocPage
      title={vigilRite.name}
      category="The Grimoire"
      description={`${vigilRite.tagline} Useful for recipes, slides, timers, and anything people read without touching the screen. Switch tabs and come back: the candle lights itself again.`}
      packageName="grimoire"
      preview={
        <div className="w-full max-w-xl">
          <VigilRite headingLevel={3} />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'useVigil()', type: 'hook', default: '—', description: 'Keeps the screen awake, takes it back after tab switches, and reports when the browser lets go' },
        { name: 'litAt · relit', type: 'number | null · number', default: '—', description: 'When the candle was lit, and how many times it was lit again after you came back' },
        { name: 'useFullscreen()', type: 'hook', default: '—', description: 'Fill the screen with one element, and know when people leave with Escape' },
      ]}
      {...riteNeighbors(vigilRite.id)}
    />
  );
}
