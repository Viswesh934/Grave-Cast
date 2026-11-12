/**
 * AutopsyRite - Web Vitals and the slowest parts of the page, live
 * @module components/grimoire/rites/AutopsyRite
 */

import type { CSSProperties } from 'react';
import {
  AUTOPSY_LABELS,
  VERDICT_WORDS,
  autopsyCapability,
  autopsyRite,
  judgeMetric,
  type AutopsyMetric,
  type AutopsyReport,
} from '../../../grimoire/rites/autopsy';
import { useAutopsy } from '../../../hooks/useAutopsy';
import { useCopyText } from '../../../hooks/useCopyText';
import { useRite } from '../../../hooks/useRite';
import { Button } from '../../primitives/Button';
import { formatBytes, formatMs } from '../format';
import { RiteLog, RiteSection, RiteStat, RiteStatGrid } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens } from '../tokens';
import { codeTag, columns, note, row, stack } from './styles';

/** The order measures are shown in. */
export const AUTOPSY_ORDER: readonly AutopsyMetric[] = ['lcp', 'fcp', 'ttfb', 'cls', 'inp', 'tbt'];

/** Decimal places shown for layout shift. */
const SHIFT_DECIMALS = 3;
/** Spaces of indent in the copied report. */
const REPORT_INDENT = 2;

/** The browser report each measure comes from, for saying what is missing. */
const SOURCES: Record<AutopsyMetric, string> = {
  lcp: 'largest-contentful-paint',
  fcp: 'paint',
  ttfb: 'navigation',
  cls: 'layout-shift',
  inp: 'event',
  tbt: 'longtask',
};

const surface = riteTokens.surface;

const formatMetric = (metric: AutopsyMetric, value: number) => (metric === 'cls' ? value.toFixed(SHIFT_DECIMALS) : formatMs(value));

const waitingHint = (metric: AutopsyMetric, report: AutopsyReport): string => {
  if (!report.supported.includes(SOURCES[metric])) return 'This browser does not report it';
  return metric === 'inp' ? 'Click or type anywhere' : 'Not measured yet';
};

/**
 * Props for {@link AutopsyRite}.
 */
export interface AutopsyRiteProps {
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Autopsy: opens up the page's own timings. How long until the largest
 * thing appeared, how much the layout jumped, how fast clicks are answered,
 * and which files and tasks were slowest. Each measure is judged against
 * the Web Vitals guidance, in words as well as color.
 *
 * @example
 * ```tsx
 * <AutopsyRite />
 * ```
 */
export const AutopsyRite = ({ headingLevel = 2, className, style }: AutopsyRiteProps) => {
  const rite = useRite(autopsyCapability, { start: () => true });
  const awake = rite.status === 'active';
  const report = useAutopsy({ enabled: awake });
  const { copy, copied } = useCopyText();

  return (
    <RiteShell
      name={autopsyRite.name}
      tagline={autopsyRite.tagline}
      sigil={autopsyRite.sigil}
      accent={autopsyRite.accent}
      rite={rite}
      startLabel="Begin the autopsy"
      stopLabel="Close it up"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Measured in this browser, on this visit. Numbers vary between visits and devices."
    >
      {!awake ? (
        <p style={{ ...note, color: surface.text }}>Begin the autopsy to see how this page loaded and how quickly it answers you.</p>
      ) : (
        <div style={stack}>
          <RiteStatGrid>
            {AUTOPSY_ORDER.map((metric) => {
              const value = report.metrics[metric];
              if (value === null) return <RiteStat key={metric} label={AUTOPSY_LABELS[metric]} value="—" hint={waitingHint(metric, report)} />;
              const verdict = judgeMetric(metric, value);
              return <RiteStat key={metric} label={AUTOPSY_LABELS[metric]} value={formatMetric(metric, value)} hint={VERDICT_WORDS[verdict]} tone={verdict} />;
            })}
          </RiteStatGrid>

          <p style={note}>
            {report.lcpElement ? (
              <>
                The largest thing to appear was <code style={codeTag}>{report.lcpElement}</code>.{' '}
              </>
            ) : null}
            {report.interactions > 0 ? `${report.interactions} interactions timed so far.` : 'Click or type anywhere to time a response.'}
          </p>

          <div style={columns}>
            <RiteSection title={`Long tasks (${report.longTaskCount})`}>
              <RiteLog
                label="Longest tasks"
                empty="No task has held up the page."
                entries={report.longTasks.map((task, index) => ({
                  id: `${task.start}-${index}`,
                  text: `${task.name}: ${formatMs(task.duration)}`,
                  detail: `at ${formatMs(task.start)}`,
                  tone: judgeMetric('tbt', task.duration),
                }))}
              />
            </RiteSection>

            <RiteSection title={`Files (${report.resourceCount}, ${formatBytes(report.resourceBytes)})`}>
              <RiteLog
                label="Slowest files"
                empty="No files were loaded."
                entries={report.slowestResources.map((resource, index) => ({
                  id: `${resource.name}-${resource.start}-${index}`,
                  text: `${resource.name}: ${formatMs(resource.duration)}`,
                  detail: [resource.size ? formatBytes(resource.size) : 'size unknown', `started at ${formatMs(resource.start)}`].join(' · '),
                }))}
              />
            </RiteSection>
          </div>

          <div style={row}>
            <Button size="sm" variant="ghost" onClick={() => void copy(JSON.stringify(report, null, REPORT_INDENT))}>
              {copied ? 'Copied' : 'Copy the report'}
            </Button>
          </div>
        </div>
      )}
    </RiteShell>
  );
};
