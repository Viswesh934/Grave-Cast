import { useState } from 'react';
import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { HauntedStage } from '../../../components/docs/grimoire/HauntedStage';
import { MediumRite, mediumRite } from 'groove-ui';
import { riteNeighbors } from './paths';

function MediumDemo() {
  // Kept in state so the rite gets the element once it exists.
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [awake, setAwake] = useState(false);
  return (
    <div className="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="space-y-3">
        <HauntedStage stageRef={setStage} awake={awake} label="Maple Street Café, a sample page to inspect" />
        <p className="m-0 px-1 text-xs text-stone-400">
          {awake ? 'Point at anything on the page. Click to pin it.' : 'A sample page. Wake the Medium to look inside it.'}
        </p>
      </div>
      <MediumRite root={stage} headingLevel={3} onAwakeChange={setAwake} />
    </div>
  );
}

const codeSnippet = `import { MediumRite } from 'groove-ui/grimoire';

// Inspect the whole page.
<MediumRite />

// Or only one part of it.
<MediumRite root={articleElement} onAwakeChange={setInspecting} />`;

export function MediumDoc() {
  return (
    <ComponentDocPage
      title={mediumRite.name}
      category="The Grimoire"
      description={`${mediumRite.tagline} Point at anything to see its box drawn over it, check whether its words can be read, and possess it for a moment. Every change can be undone, and putting the Medium to sleep leaves the page exactly as it was.`}
      packageName="grimoire"
      preview={<MediumDemo />}
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'root', type: 'Element | null', default: 'the whole page', description: 'Only elements inside this one can be inspected' },
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name, to fit your page outline' },
        { name: 'onAwakeChange', type: '(awake: boolean) => void', default: '—', description: 'Called when the Medium wakes or sleeps, for example to show a crosshair' },
        { name: 'useElementPicker · useElementBox', type: 'hooks', default: '—', description: 'Build your own inspector: point at and pin elements, and follow their box as they move' },
        { name: 'textContrast · collectColors · createDomJournal', type: 'functions', default: '—', description: 'Readability against the real background, the page’s colors, and undoable edits' },
      ]}
      {...riteNeighbors(mediumRite.id)}
    />
  );
}
