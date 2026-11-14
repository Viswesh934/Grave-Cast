import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  Doodle,
  DoodleStrip,
  DOODLE_POSES,
  DOODLE_PROPS,
  validateDoodleStrip,
  type DoodleStripSpec,
} from 'groove-ui';

// A short piece of fiction for the docs. Not safety advice.
const nightWatch: DoodleStripSpec = {
  id: 'night-watch',
  title: 'The Night Watch',
  panels: [
    {
      id: 'night-watch-1',
      caption: 'Midnight. Kneel by the old stone, and listen.',
      description: 'A figure kneels beside a headstone under a crescent moon.',
      doodle: {
        id: 'night-watch-1',
        figures: [{ role: 'watcher', pose: 'kneeling_beside', x: 125 }],
        props: [
          { prop: 'tombstone', x: 70, y: 128 },
          { prop: 'moon', x: 170, y: 26 },
        ],
      },
    },
    {
      id: 'night-watch-2',
      caption: 'Something knocks from under the earth. Stay still. Don’t run.',
      description: 'The figure stands frozen beside the headstone. A badge reads "knock… knock".',
      doodle: {
        id: 'night-watch-2',
        figures: [{ role: 'watcher', pose: 'standing', x: 128 }],
        props: [
          { prop: 'tombstone', x: 70, y: 128 },
          { prop: 'badge', x: 70, y: 62, label: 'knock… knock' },
        ],
        highlight: { figure: 0, joint: 'head' },
      },
    },
    {
      id: 'night-watch-3',
      caption: 'Lie flat beside the grave until the moon goes down.',
      description: 'The figure lies on their back beside the headstone. The moon is circled.',
      doodle: {
        id: 'night-watch-3',
        figures: [{ role: 'watcher', pose: 'lying_supine', x: 125 }],
        props: [
          { prop: 'tombstone', x: 60, y: 128 },
          { prop: 'moon', x: 170, y: 28 },
        ],
        highlight: { prop: 1 },
      },
    },
  ],
};

// A deliberately broken strip, to show what the checker reports.
const broken: DoodleStripSpec = {
  id: 'broken-example',
  title: 'Broken example',
  panels: [
    {
      id: 'p1',
      caption: '',
      description: 'A figure in a pose that does not exist.',
      doodle: {
        id: 'p1',
        figures: [{ role: 'ghost', pose: 'floating_upside_down', x: 100 }],
        props: [{ prop: 'haunted_lantern', x: 40, y: 30 }],
        highlight: { figure: 3, joint: 'head' },
      },
    },
  ],
};

// This demo has no source, so the source rule is switched off here. Kit cards keep it on.
const nightIssues = validateDoodleStrip(nightWatch, undefined, { requireSource: false });
const brokenIssues = validateDoodleStrip(broken);

const codeSnippet = `import { DoodleStrip, assertDoodleStrip, type DoodleStripSpec } from 'groove-ui';

// A strip is plain data: named poses and props, never drawn limb by limb.
const strip: DoodleStripSpec = {
  id: 'night-watch',
  title: 'The Night Watch',
  panels: [
    {
      id: 'night-watch-1',
      caption: 'Midnight. Kneel by the old stone, and listen.',
      description: 'A figure kneels beside a headstone under a crescent moon.',
      doodle: {
        id: 'night-watch-1',
        figures: [{ role: 'watcher', pose: 'kneeling_beside', x: 125 }],
        props: [
          { prop: 'tombstone', x: 70, y: 128 },
          { prop: 'moon', x: 170, y: 26 },
        ],
      },
    },
    // …more panels
  ],
};

// Every panel shows at once, as a comic page. Fails loudly if a pose or prop is missing.
<DoodleStrip strip={assertDoodleStrip(strip, undefined, { requireSource: false })} />`;

const galleryCell = 'rounded-xl border border-[#222434] bg-[#0a0a0f] p-2';

export function DoodleDoc() {
  const poseIds = Object.keys(DOODLE_POSES);
  const propIds = Object.keys(DOODLE_PROPS).filter((id) => id !== 'badge');

  return (
    <ComponentDocPage
      title="Doodle"
      category="The Effects"
      description="Comic pages made from data. Describe who is in each panel and what they are doing, and the figures appear as calm, lightly hand-inked silhouettes that look the same on every device. Every panel shows at once, numbered, with its words as real text, so a page can be read in a hurry."
      packageName="doodle"
      preview={
        <div className="w-full max-w-4xl space-y-8">
          <div className="space-y-2">
            <DoodleStrip strip={nightWatch} headingLevel={3} />
            <p className="m-0 text-xs text-stone-500">A short piece of fiction for this page. Not safety advice.</p>
          </div>

          <div className="space-y-2 text-sm text-stone-400">
            <p className="m-0 font-semibold text-stone-200">Checker</p>
            <p className="m-0">
              The Night Watch: {nightIssues.length === 0 ? 'no problems found.' : `${nightIssues.length} problem(s).`}
            </p>
            <p className="m-0">A broken example reports:</p>
            <ul className="m-0 list-disc space-y-1 pl-5 font-mono text-xs text-stone-300">
              {brokenIssues.map((issue) => (
                <li key={issue.path + issue.message}>
                  {issue.path}: {issue.message}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="m-0 text-sm font-semibold text-stone-200">Poses built so far ({poseIds.length})</p>
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
              {poseIds.map((id) => (
                <li key={id} className={galleryCell}>
                  <Doodle
                    draw={false}
                    description={`A figure, ${id.replace(/_/g, ' ')}.`}
                    doodle={{ id: `pose-${id}`, figures: [{ role: 'figure', pose: id, x: 100 }] }}
                  />
                  <p className="m-0 mt-1 text-center font-mono text-xs text-stone-400">{id}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="m-0 text-sm font-semibold text-stone-200">Props built so far ({propIds.length})</p>
            <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-4">
              {propIds.map((id) => (
                <li key={id} className={galleryCell}>
                  <Doodle
                    draw={false}
                    description={`The ${id.replace(/_/g, ' ')} prop.`}
                    doodle={{ id: `prop-${id}`, width: 80, height: 50, ground: false, props: [{ prop: id, x: 40, y: id === 'tombstone' ? 44 : 25, scale: 1.6 }] }}
                  />
                  <p className="m-0 mt-1 text-center font-mono text-xs text-stone-400">{id}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'strip', type: 'DoodleStripSpec', default: '—', description: 'Title, panels (caption, description, doodle), and source' },
        { name: 'headingLevel', type: '2 · 3 · 4', default: '2', description: 'Heading level for the strip title' },
        { name: 'draw', type: 'boolean', default: 'true', description: 'Draw the panels in as if by hand; off when motion is reduced' },
        { name: 'showSource', type: 'boolean', default: 'true', description: 'Show the strip’s source under the page' },
        { name: 'registry', type: 'DoodleRegistry', default: 'built-in library', description: 'Poses and props to draw with; add your own with extendDoodleRegistry' },
        { name: '<Doodle doodle description draw />', type: 'component', default: 'draw: true', description: 'One drawing on its own' },
        { name: 'validateDoodleStrip · assertDoodleStrip', type: 'function', default: '—', description: 'List or throw every problem: unknown poses or props, missing captions, descriptions, or source' },
        { name: 'missingDoodleAssets({ poses, props })', type: 'function', default: '—', description: 'Which pose and prop ids still need building' },
      ]}
      prevPage={{ title: 'Scribble', path: '/docs/components/scribble' }}
      nextPage={{ title: 'Grimoire', path: '/docs/components/grimoire' }}
    />
  );
}
