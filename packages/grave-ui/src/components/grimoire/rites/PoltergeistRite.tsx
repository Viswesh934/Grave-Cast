/**
 * PoltergeistRite - Watch every change to the page, and make a few
 * @module components/grimoire/rites/PoltergeistRite
 */

import { useEffect, useState, type CSSProperties } from 'react';
import { createDomJournal, type DomJournal, type JournalStep } from '../../../grimoire/dom/journal';
import { grimoireIgnoreProps } from '../../../grimoire/dom/marker';
import { findText } from '../../../grimoire/dom/text';
import {
  hideSomething,
  poltergeistCapability,
  poltergeistRite,
  replaceAllText,
  scrambleWords,
  shuffleList,
  type MutationKind,
} from '../../../grimoire/rites/poltergeist';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useMutationLog } from '../../../hooks/useMutationLog';
import { useRite } from '../../../hooks/useRite';
import { Button } from '../../primitives/Button';
import { formatTimeOfDay } from '../format';
import { RiteInput, RiteLog, RiteSection } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens, type RiteTone } from '../tokens';
import { columns, note, row, stack } from './styles';

const KIND_LABELS: Record<MutationKind, string> = { added: 'Added', removed: 'Removed', text: 'Rewritten', attribute: 'Changed' };
const KIND_TONES: Record<MutationKind, RiteTone> = { added: 'good', removed: 'bad', text: 'warn', attribute: 'neutral' };

const surface = riteTokens.surface;

/**
 * Props for {@link PoltergeistRite}.
 */
export interface PoltergeistRiteProps {
  /** What the Poltergeist watches and plays with. @default the whole page */
  root?: Element | null;
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Poltergeist: notices every change to the page and says what changed,
 * in plain words. It also makes mischief of its own: find and replace,
 * shuffling, hiding, scrambling. Each trick can be undone one at a time, and
 * banishing it undoes them all.
 *
 * @example
 * ```tsx
 * <PoltergeistRite root={stageRef.current} />
 * ```
 */
export const PoltergeistRite = ({ root = null, headingLevel = 2, className, style }: PoltergeistRiteProps) => {
  const rite = useRite<DomJournal>(poltergeistCapability, {
    start: () => createDomJournal(),
    stop: (journal) => void journal.undoAll(),
  });
  const journal = rite.value;
  const awake = rite.status === 'active' && journal !== null;
  const target = awake ? root ?? document.body : null;
  const log = useMutationLog({ root: target, enabled: awake });
  const [steps, setSteps] = useState<readonly JournalStep[]>([]);
  const [find, setFind] = useState('');
  const [replacement, setReplacement] = useState('');
  const { announce } = useAriaAnnounce();

  useEffect(() => {
    if (!journal) {
      setSteps([]);
      return undefined;
    }
    setSteps(journal.steps);
    return journal.subscribe(() => setSteps(journal.steps));
  }, [journal]);

  // Counted on every render: the change log re-renders this whenever the page changes.
  const matches = target && find !== '' ? findText(target, find).length : 0;

  const trick = (work: () => unknown, done: string, nothing: string) => announce(work() ? done : nothing);

  return (
    <RiteShell
      {...grimoireIgnoreProps}
      name={poltergeistRite.name}
      tagline={poltergeistRite.tagline}
      sigil={poltergeistRite.sigil}
      accent={poltergeistRite.accent}
      rite={rite}
      startLabel="Let it in"
      stopLabel="Banish it"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Banishing it undoes every change it made. Changes made by the page itself are only watched."
    >
      {!awake || !journal || !target ? (
        <p style={{ ...note, color: surface.text }}>Let it in to watch the page change, and to make a little mischief of your own.</p>
      ) : (
        <div style={stack}>
          <div style={columns}>
            <RiteSection title="Find and replace">
              <RiteInput
                label="Find"
                type="search"
                value={find}
                onChange={setFind}
                hint={find === '' ? 'Case does not matter.' : `${matches} ${matches === 1 ? 'match' : 'matches'} on the page.`}
              />
              <RiteInput label="Replace with" value={replacement} onChange={setReplacement} />
              <div style={row}>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={matches === 0}
                  onClick={() => {
                    const count = replaceAllText(target, find, replacement, journal);
                    announce(`Replaced ${count} ${count === 1 ? 'match' : 'matches'}.`);
                  }}
                >
                  Replace all
                </Button>
              </div>
            </RiteSection>

            <RiteSection title="Mischief">
              <div style={row}>
                <Button size="sm" variant="ghost" onClick={() => trick(() => shuffleList(target, journal), 'A list was shuffled.', 'There is no list to shuffle.')}>
                  Shuffle a list
                </Button>
                <Button size="sm" variant="ghost" onClick={() => trick(() => hideSomething(target, journal), 'Something vanished.', 'Nothing is left to hide.')}>
                  Hide something
                </Button>
                <Button size="sm" variant="ghost" onClick={() => trick(() => scrambleWords(target, journal), 'Some words were scrambled.', 'There are no words to scramble.')}>
                  Scramble words
                </Button>
              </div>
            </RiteSection>
          </div>

          <RiteSection
            title="Your changes"
            actions={
              <>
                <Button size="sm" variant="ghost" disabled={steps.length === 0} onClick={() => journal.undo()}>
                  Undo
                </Button>
                <Button size="sm" variant="ghost" disabled={steps.length === 0} onClick={() => announce(`Undid ${journal.undoAll()} changes.`)}>
                  Undo all
                </Button>
              </>
            }
          >
            <RiteLog
              label="Your changes"
              empty="You have not changed anything yet."
              entries={[...steps].reverse().map((step, index) => ({ id: steps.length - index, text: step.label }))}
            />
          </RiteSection>

          <RiteSection
            title={`Everything that changed (${log.total})`}
            actions={
              <Button size="sm" variant="ghost" disabled={log.total === 0} onClick={log.clear}>
                Clear
              </Button>
            }
          >
            <RiteLog
              label="Everything that changed on the page"
              empty="Nothing has changed yet."
              entries={log.entries.map((entry) => ({
                id: entry.id,
                time: formatTimeOfDay(entry.at),
                text: `${KIND_LABELS[entry.kind]} ${entry.label}`,
                detail: entry.detail,
                tone: KIND_TONES[entry.kind],
              }))}
            />
          </RiteSection>
        </div>
      )}
    </RiteShell>
  );
};
