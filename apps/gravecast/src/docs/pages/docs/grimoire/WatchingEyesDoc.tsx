import { useState } from 'react';
import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { HauntedStage } from '../../../components/docs/grimoire/HauntedStage';
import { WatchingEyesRite, watchingEyesRite } from 'groove-ui';
import { riteNeighbors } from './paths';

function WatchingEyesDemo() {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  return (
    <div className="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <HauntedStage stageRef={setStage} label="Maple Street Café, a sample page to watch" />
      <WatchingEyesRite root={stage} headingLevel={3} />
    </div>
  );
}

const codeSnippet = `import { WatchingEyesRite, useWatchingEyes } from 'groove-ui/grimoire';

// The whole rite.
<WatchingEyesRite />

// Or count looks yourself.
const eyes = useWatchingEyes({ root: article });
<p>Read most: {eyes.watched[0]?.label}</p>`;

export function WatchingEyesDoc() {
  return (
    <ComponentDocPage
      title={watchingEyesRite.name}
      category="The Grimoire"
      description={`${watchingEyesRite.tagline} Open the eyes and scroll: the longer part of the sample page stays in view, the brighter its outline glows.`}
      packageName="grimoire"
      preview={<WatchingEyesDemo />}
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'root', type: 'Element | null', default: 'the whole page', description: 'Where to watch' },
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'useWatchingEyes({ root, selector, threshold })', type: 'hook', default: '—', description: 'Time on screen for each element, counted only while the tab is showing' },
        { name: 'heatOf(dwellMs, longestMs)', type: 'function', default: '—', description: 'How warm an element looks, from 0 to 1' },
      ]}
      {...riteNeighbors(watchingEyesRite.id)}
    />
  );
}
