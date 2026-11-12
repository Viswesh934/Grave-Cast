/**
 * HauntedInkRite - Find words on the page and make them glow
 * @module components/grimoire/rites/HauntedInkRite
 */

import { useEffect, useState, type CSSProperties } from 'react';
import { grimoireIgnoreProps } from '../../../grimoire/dom/marker';
import { INK_COLORS, hauntedInkCapability, hauntedInkRite, type InkColor } from '../../../grimoire/rites/hauntedInk';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useHauntedInk } from '../../../hooks/useHauntedInk';
import { useRite } from '../../../hooks/useRite';
import { Button } from '../../primitives/Button';
import { RiteInput, RiteSection, RiteSegmented } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens } from '../tokens';
import { note, row, stack } from './styles';

/** How long typing must pause before the number of matches is read aloud, in ms. */
export const INK_ANNOUNCE_DELAY_MS = 600;

const INK_LABELS: Record<InkColor, string> = { ectoplasm: 'Ectoplasm', blood: 'Blood', candle: 'Candlelight' };

const { space, font } = riteTokens;
const surface = riteTokens.surface;

/**
 * Props for {@link HauntedInkRite}.
 */
export interface HauntedInkRiteProps {
  /** Where to look for words. @default the whole page */
  root?: Element | null;
  /** Words to look for when the rite wakes. @default '' */
  defaultQuery?: string;
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * Haunted Ink: type a word and every place it appears glows in the ink of
 * your choice. Step through the matches with Enter or the buttons. Where the
 * browser has a highlighter the page is never changed; elsewhere the words
 * are marked and unmarked again when the search changes.
 *
 * @example
 * ```tsx
 * <HauntedInkRite defaultQuery="ghost" />
 * ```
 */
export const HauntedInkRite = ({ root = null, defaultQuery = '', headingLevel = 2, className, style }: HauntedInkRiteProps) => {
  const [query, setQuery] = useState(defaultQuery);
  const [ink, setInk] = useState<InkColor>('ectoplasm');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const { announce } = useAriaAnnounce();

  const rite = useRite(hauntedInkCapability, { start: () => true });
  const awake = rite.status === 'active';

  const found = useHauntedInk({
    root: awake ? root ?? document.body : null,
    query,
    ink,
    caseSensitive,
    wholeWord,
    enabled: awake,
  });

  // Read the count aloud once typing pauses, not on every key.
  useEffect(() => {
    if (!awake || query.trim() === '') return undefined;
    const timer = setTimeout(
      () => announce(found.count === 0 ? 'No matches.' : `${found.count} ${found.count === 1 ? 'match' : 'matches'} inked.`),
      INK_ANNOUNCE_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [awake, query, found.count, announce]);

  const step = (direction: 'next' | 'previous') => {
    if (found.count === 0) return;
    if (direction === 'next') found.next();
    else found.previous();
  };

  let position = 'Type to start looking.';
  if (query.trim() !== '') {
    if (found.count === 0) position = 'No matches.';
    else if (found.index < 0) position = `${found.count} ${found.count === 1 ? 'match' : 'matches'}. Press Enter to go to the first.`;
    else position = `${found.index + 1} of ${found.count}`;
  }

  return (
    <RiteShell
      {...grimoireIgnoreProps}
      name={hauntedInkRite.name}
      tagline={hauntedInkRite.tagline}
      sigil={hauntedInkRite.sigil}
      accent={hauntedInkRite.accent}
      rite={rite}
      startLabel="Dip the quill"
      stopLabel="Wipe the ink"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Wiping the ink or changing the search removes every highlight. The page itself is left as it was."
    >
      {!awake ? (
        <p style={{ ...note, color: surface.text }}>Dip the quill, then type the words you want to find.</p>
      ) : (
        <div style={stack}>
          <RiteInput
            label="Words to find"
            type="search"
            value={query}
            onChange={setQuery}
            onEnter={() => step('next')}
            placeholder="ghost"
            hint="Press Enter to go to the next match."
          />

          <div style={{ ...row, gap: space.lg }}>
            <RiteSegmented
              label="Ink"
              value={ink}
              onChange={setInk}
              options={INK_COLORS.map((value) => ({ value, label: INK_LABELS[value] }))}
            />
            <div role="group" aria-label="Search options" style={{ ...row, gap: space.xs }}>
              <Button size="sm" variant={caseSensitive ? 'secondary' : 'ghost'} aria-pressed={caseSensitive} onClick={() => setCaseSensitive((on) => !on)}>
                Match case
              </Button>
              <Button size="sm" variant={wholeWord ? 'secondary' : 'ghost'} aria-pressed={wholeWord} onClick={() => setWholeWord((on) => !on)}>
                Whole words
              </Button>
            </div>
          </div>

          <RiteSection title="Matches">
            <div style={{ ...row, justifyContent: 'space-between' }}>
              <span role="status" style={{ fontFamily: font.mono, fontSize: font.small, color: surface.text }}>
                {position}
              </span>
              <div style={{ ...row, gap: space.xs }}>
                <Button size="sm" variant="ghost" disabled={found.count === 0} onClick={() => step('previous')} aria-label="Previous match">
                  ← Previous
                </Button>
                <Button size="sm" variant="secondary" disabled={found.count === 0} onClick={() => step('next')} aria-label="Next match">
                  Next →
                </Button>
              </div>
            </div>
            {found.mode === 'marks' && (
              <p style={note}>This browser has no highlighter, so the words are marked on the page and unmarked when you search again.</p>
            )}
          </RiteSection>
        </div>
      )}
    </RiteShell>
  );
};
