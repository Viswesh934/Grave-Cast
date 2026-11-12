import { useState } from 'react';
import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { HauntedStage } from '../../../components/docs/grimoire/HauntedStage';
import { HauntedInkRite, hauntedInkRite } from 'groove-ui';
import { riteNeighbors } from './paths';

function HauntedInkDemo() {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  return (
    <div className="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <HauntedStage stageRef={setStage} label="The Hollow Inn, a sample page to search" />
      <HauntedInkRite root={stage} defaultQuery="the" headingLevel={3} />
    </div>
  );
}

const codeSnippet = `import { HauntedInkRite, useHauntedInk } from 'groove-ui/grimoire';

// The whole rite.
<HauntedInkRite defaultQuery="ghost" />

// Or ink words yourself.
const ink = useHauntedInk({ root: article, query: 'ghost', ink: 'blood' });
<p>{ink.count} found</p>
<button onClick={ink.next}>Next</button>`;

export function HauntedInkDoc() {
  return (
    <ComponentDocPage
      title={hauntedInkRite.name}
      category="The Grimoire"
      description={`${hauntedInkRite.tagline} Dip the quill and type: every match on the sample page glows, and Enter walks you through them. In browsers with the CSS highlighter the page itself is never touched.`}
      packageName="grimoire"
      preview={<HauntedInkDemo />}
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'root', type: 'Element | null', default: 'the whole page', description: 'Where to look for words' },
        { name: 'defaultQuery', type: 'string', default: "''", description: 'Words to look for when the rite wakes' },
        { name: 'useHauntedInk({ root, query, ink })', type: 'hook', default: '—', description: 'Ink every match and step through them. Ink is removed whenever the search changes' },
        { name: 'ink', type: "'ectoplasm' | 'blood' | 'candle'", default: "'ectoplasm'", description: 'The color the words glow in' },
        { name: 'inkMatches(findText(...))', type: 'function', default: '—', description: 'The plain version: ink any matches, then clear() to remove them' },
      ]}
      {...riteNeighbors(hauntedInkRite.id)}
    />
  );
}
