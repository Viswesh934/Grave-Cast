import { ComponentDocPage } from '../../../components/docs/ComponentDocPage';
import { AutopsyRite, autopsyRite } from 'groove-ui';
import { riteNeighbors } from './paths';

const codeSnippet = `import { AutopsyRite, useAutopsy, judgeMetric } from 'groove-ui/grimoire';

// The whole rite.
<AutopsyRite />

// Or read the numbers yourself.
const report = useAutopsy();
const lcp = report.metrics.lcp;
<p>{lcp === null ? 'Measuring…' : \`\${Math.round(lcp)} ms, \${judgeMetric('lcp', lcp)}\`}</p>`;

export function AutopsyDoc() {
  return (
    <ComponentDocPage
      title={autopsyRite.name}
      category="The Grimoire"
      description={`${autopsyRite.tagline} It reads this docs page's own load, so the numbers are real. Click around to time how fast the page responds.`}
      packageName="grimoire"
      preview={
        <div className="w-full max-w-4xl">
          <AutopsyRite headingLevel={3} />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'The heading level of the rite’s name' },
        { name: 'useAutopsy({ enabled })', type: 'hook', default: '—', description: 'Largest paint, first paint, server response, layout shift, response to input, and blocked time' },
        { name: 'judgeMetric(metric, value)', type: 'function', default: '—', description: 'good, warn, or bad, following the Web Vitals guidance' },
        { name: 'observeAutopsy(onUpdate)', type: 'function', default: '—', description: 'The plain version. Returns a function that stops measuring' },
      ]}
      {...riteNeighbors(autopsyRite.id)}
    />
  );
}
