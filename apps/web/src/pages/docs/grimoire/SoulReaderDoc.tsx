import { useState } from 'react';
import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { HauntedStage } from '../../../components/docs/grimoire/HauntedStage';
import { SoulReaderRite, soulReaderRite } from 'groove-ui';
import { riteNeighbors } from './paths';

function SoulReaderDemo() {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  return (
    <div className="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <HauntedStage stageRef={setStage} label="The Hollow Inn, a sample page to read" />
      <SoulReaderRite root={stage} headingLevel={3} />
    </div>
  );
}

const codeSnippet = `import { SoulReaderRite, auditContrast, useEyeDropper } from 'groove-ui/grimoire';

// The whole rite.
<SoulReaderRite />

// Or just the parts.
const { issues } = auditContrast(document.body);   // text below WCAG AA, worst first
const dropper = useEyeDropper();                     // pick any color on the screen
<button onClick={dropper.pick} disabled={!dropper.supported}>Pick a color</button>`;

export function SoulReaderDoc() {
  return (
    <ComponentDocPage
      title={soulReaderRite.name}
      category="The Grimoire"
      description={`${soulReaderRite.tagline} Choose a color to see everything that uses it, or a hard-to-read line to have it pointed out on the page. The faint caption at the bottom of the sample page is waiting to be found.`}
      packageName="grimoire"
      preview={<SoulReaderDemo />}
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'root', type: 'Element | null', default: 'the whole page', description: 'The part of the page to read' },
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'auditContrast(root)', type: 'function', default: '—', description: 'Every piece of visible text below WCAG AA, hardest to read first, with a note when the background is an estimate' },
        { name: 'useEyeDropper()', type: 'hook', default: '—', description: 'Pick a color from anywhere on the screen. Chrome and Edge only; elsewhere it says so plainly' },
        { name: 'collectColors(root)', type: 'function', default: '—', description: 'Every color the page paints, how often, and where' },
      ]}
      {...riteNeighbors(soulReaderRite.id)}
    />
  );
}
