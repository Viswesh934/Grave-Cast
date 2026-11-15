import { useState } from 'react';
import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { HauntedStage } from '../../../components/docs/grimoire/HauntedStage';
import { NecromancerRite, necromancerRite } from 'groove-ui';
import { riteNeighbors } from './paths';

function NecromancerDemo() {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  return (
    <div className="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <HauntedStage stageRef={setStage} label="Maple Street Café, a sample page with an animation" />
      <NecromancerRite root={stage} headingLevel={3} />
    </div>
  );
}

const codeSnippet = `import { NecromancerRite, useNecromancer } from 'groove-ui/grimoire';

// The whole rite.
<NecromancerRite />

// Or take control yourself.
const necro = useNecromancer({ root: article });
<button onClick={necro.pauseAll}>Freeze</button>
<button onClick={() => necro.setRate(0.25)}>Slow motion</button>
<input type="range" min={0} max={1} step={0.01} onChange={(e) => necro.scrub(Number(e.target.value))} />`;

export function NecromancerDoc() {
  return (
    <ComponentDocPage
      title={necromancerRite.name}
      category="The Grimoire"
      description={`${necromancerRite.tagline} Works on CSS animations, transitions, and script animations. Try it on the "Open now" dot on the sample page.`}
      packageName="grimoire"
      preview={<NecromancerDemo />}
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'root', type: 'Element | null', default: 'the whole page', description: 'Where to look for animations' },
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'useNecromancer({ root, enabled })', type: 'hook', default: '—', description: 'Pause, play, slow down, and scrub every animation. Their own speeds come back when it is turned off' },
        { name: 'listAnimations · describeAnimation', type: 'functions', default: '—', description: 'Find the animations under an element, and describe one in plain words' },
      ]}
      {...riteNeighbors(necromancerRite.id)}
    />
  );
}
