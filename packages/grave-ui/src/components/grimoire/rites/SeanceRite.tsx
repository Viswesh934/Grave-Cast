/**
 * SeanceRite - Every open tab of the site in one circle
 * @module components/grimoire/rites/SeanceRite
 */

import { useState, type CSSProperties } from 'react';
import { SEANCE_TEXT_LIMIT, seanceRite } from '../../../grimoire/rites/seance';
import { useSeance } from '../../../hooks/useSeance';
import { Button } from '../../primitives/Button';
import { formatTimeOfDay } from '../format';
import { RiteInput, RiteLog, RiteSection, RiteSegmented, RiteStat, RiteStatGrid } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens } from '../tokens';
import { chip, columns, note, plainList, row, stack } from './styles';

/** The answers on the shared board. */
export const SEANCE_BOARD = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-yet', label: 'Not yet' },
] as const;

const { space, font } = riteTokens;
const surface = riteTokens.surface;

/**
 * Props for {@link SeanceRite}.
 */
export interface SeanceRiteProps {
  /** The channel tabs meet on. @default SEANCE_CHANNEL */
  channel?: string;
  /** What other tabs call this one. @default a name picked for this tab */
  name?: string;
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Séance: open this page in more than one tab and they find each other.
 * See who is present, move the shared board in one tab and watch it move in
 * all of them, and pass whispers around the circle.
 *
 * @example
 * ```tsx
 * <SeanceRite />
 * ```
 */
export const SeanceRite = ({ channel, name, headingLevel = 2, className, style }: SeanceRiteProps) => {
  const seance = useSeance({ channel, name });
  const [draft, setDraft] = useState('');
  const awake = seance.status === 'active';
  const tooLong = draft.trim().length > SEANCE_TEXT_LIMIT;

  const send = () => {
    if (seance.whisper(draft)) setDraft('');
  };

  return (
    <RiteShell
      name={seanceRite.name}
      tagline={seanceRite.tagline}
      sigil={seanceRite.sigil}
      accent={seanceRite.accent}
      rite={seance}
      startLabel="Join the circle"
      stopLabel="Leave the circle"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Messages only travel between tabs of this site in this browser. Nothing is sent over the network or stored."
    >
      {!awake ? (
        <p style={{ ...note, color: surface.text }}>
          Join the circle, then open this page in another tab and join there too. Each tab sees the others.
        </p>
      ) : (
        <div style={stack}>
          <RiteStatGrid>
            <RiteStat label="Present" value={seance.spirits.length} hint={seance.spirits.length === 1 ? 'Only you so far' : 'tabs in the circle'} />
            <RiteStat label="You are" value={seance.selfName} />
          </RiteStatGrid>

          <div style={columns}>
            <RiteSection title="The circle">
              <ul aria-label="Tabs in the circle" style={plainList}>
                {seance.spirits.map((spirit) => (
                  <li key={spirit.id} style={{ ...row, gap: space.xs }}>
                    <span style={chip(spirit.self)}>{spirit.self ? 'this tab' : 'another tab'}</span>
                    <span style={{ fontSize: font.small, color: surface.text }}>
                      {spirit.name}
                      {spirit.self && ' (you)'}
                    </span>
                  </li>
                ))}
              </ul>
              {seance.spirits.length === 1 && <p style={note}>Open this page in another tab to see it join.</p>}
            </RiteSection>

            <RiteSection title="The board">
              <RiteSegmented
                label="The board's answer, shared by every tab"
                value={seance.sharedValue ?? ''}
                onChange={seance.setValue}
                options={SEANCE_BOARD}
              />
              <p style={note}>{seance.sharedValue === null ? 'Nobody has moved the board yet.' : 'Every tab shows the latest answer.'}</p>
            </RiteSection>
          </div>

          <RiteSection title="Whispers">
            <RiteInput
              label="Whisper to the circle"
              value={draft}
              onChange={setDraft}
              onEnter={send}
              placeholder="Is anyone there?"
              error={tooLong ? `Keep it under ${SEANCE_TEXT_LIMIT} characters.` : null}
            />
            <div style={row}>
              <Button size="sm" variant="secondary" disabled={draft.trim() === '' || tooLong} onClick={send}>
                Send
              </Button>
            </div>
            <RiteLog
              label="Whispers"
              live
              empty="No whispers yet."
              entries={seance.whispers.map((whisper) => ({
                id: whisper.id,
                time: formatTimeOfDay(whisper.at),
                text: whisper.text,
                detail: whisper.self ? `${whisper.name} (you)` : whisper.name,
              }))}
            />
          </RiteSection>
        </div>
      )}
    </RiteShell>
  );
};
