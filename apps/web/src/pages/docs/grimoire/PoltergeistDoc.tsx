import { useState } from 'react';
import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { HauntedStage } from '../../../components/docs/grimoire/HauntedStage';
import { PoltergeistRite, poltergeistRite } from 'groove-ui';
import { riteNeighbors } from './paths';

function PoltergeistDemo() {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  return (
    <div className="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <HauntedStage stageRef={setStage} label="Maple Street Café, a sample page to change" />
      <PoltergeistRite root={stage} headingLevel={3} />
    </div>
  );
}

const codeSnippet = `import { PoltergeistRite, useMutationLog, createDomJournal, replaceAllText } from 'groove-ui/grimoire';

// The whole rite.
<PoltergeistRite />

// Or watch changes yourself.
const log = useMutationLog({ root: article });
<p>{log.total} changes</p>

// And make undoable ones.
const journal = createDomJournal();
replaceAllText(article, 'coffee', 'tea', journal);
journal.undoAll();`;

export function PoltergeistDoc() {
  return (
    <ComponentDocPage
      title={poltergeistRite.name}
      category="The Grimoire"
      description={`${poltergeistRite.tagline} Replace words, shuffle the menu, or hide things on the sample page, and watch every change appear in the log.`}
      packageName="grimoire"
      preview={<PoltergeistDemo />}
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'root', type: 'Element | null', default: 'the whole page', description: 'What it watches and changes' },
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'useMutationLog({ root, limit })', type: 'hook', default: '—', description: 'Every change to the page, in plain words, newest first' },
        { name: 'replaceAllText · shuffleList · hideSomething · scrambleWords', type: 'functions', default: '—', description: 'Page tricks that go through a journal, so each can be undone' },
        { name: 'describeMutation(record)', type: 'function', default: '—', description: 'Turns one MutationRecord into short sentences' },
      ]}
      {...riteNeighbors(poltergeistRite.id)}
    />
  );
}
