import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { SeanceRite, seanceRite } from 'groove-ui';
import { riteNeighbors } from './paths';

const codeSnippet = `import { SeanceRite, useSeance } from 'groove-ui/grimoire';

// The whole rite.
<SeanceRite />

// Or hold your own séance.
const seance = useSeance({ channel: 'my-app' });
<button onClick={seance.start}>Join</button>
<p>{seance.spirits.length} tabs open</p>
<button onClick={() => seance.whisper('Saved!')}>Tell the others</button>
<button onClick={() => seance.setValue('dark')}>Dark theme everywhere</button>`;

export function SeanceDoc() {
  return (
    <ComponentDocPage
      title={seanceRite.name}
      category="The Grimoire"
      description={`${seanceRite.tagline} Join the circle here, then open this page in a second tab and join there too. Useful for keeping a theme, a cart, or a sign-out in step across tabs.`}
      packageName="grimoire"
      preview={
        <div className="w-full max-w-3xl">
          <SeanceRite headingLevel={3} />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'channel', type: 'string', default: "'grimoire-seance'", description: 'Tabs only see others on the same channel' },
        { name: 'name', type: 'string', default: 'a picked name', description: 'What other tabs call this one' },
        { name: 'useSeance({ channel, name })', type: 'hook', default: '—', description: 'Who is present, whispers, and one shared value. The latest change wins in every tab' },
        { name: 'readSeanceWire(data)', type: 'function', default: '—', description: 'Checks a message from another tab before it is trusted' },
      ]}
      {...riteNeighbors(seanceRite.id)}
    />
  );
}
