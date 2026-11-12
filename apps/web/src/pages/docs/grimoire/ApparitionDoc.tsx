import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { ApparitionRite, apparitionRite } from 'groove-ui';
import { riteNeighbors } from './paths';

const codeSnippet = `import { flushSync } from 'react-dom';
import { ApparitionRite, useApparition } from 'groove-ui/grimoire';

// The whole rite.
<ApparitionRite />

// Or animate your own changes.
const apparition = useApparition({ preset: 'slide' });
<button onClick={() => apparition.summon(() => flushSync(() => setPage(page + 1)), cardRef.current)}>
  Next
</button>`;

export function ApparitionDoc() {
  return (
    <ComponentDocPage
      title={apparitionRite.name}
      category="The Grimoire"
      description={`${apparitionRite.tagline} Call the next visitor and try each preset. Turn on reduced motion on your device and the change happens at once.`}
      packageName="grimoire"
      preview={
        <div className="w-full max-w-2xl">
          <ApparitionRite headingLevel={3} />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'useApparition({ preset, durationMs })', type: 'hook', default: '—', description: 'Animate a change to one element; quick clicks never queue up' },
        { name: 'preset', type: "'fade' | 'slide' | 'rise' | 'blur' | 'flip'", default: "'fade'", description: 'How the change appears' },
        { name: 'summon(update, { element })', type: 'function', default: '—', description: 'The plain version. Resolves with view-transition, fade, or instant' },
      ]}
      {...riteNeighbors(apparitionRite.id)}
    />
  );
}
