/**
 * WatchingEyesRite - See which parts of the page have been looked at
 * @module components/grimoire/rites/WatchingEyesRite
 */

import { useState, type CSSProperties } from 'react';
import { grimoireIgnoreProps } from '../../../grimoire/dom/marker';
import { heatOf, watchingEyesCapability, watchingEyesRite } from '../../../grimoire/rites/watchingEyes';
import { grimoireAccents } from '../../../grimoire/tokens';
import { useRite } from '../../../hooks/useRite';
import { useWatchingEyes } from '../../../hooks/useWatchingEyes';
import { withAlpha } from '../../../tokens/colors';
import { Button } from '../../primitives/Button';
import { formatDuration, formatMs } from '../format';
import { RiteEmpty, RiteSection, RiteStat, RiteStatGrid } from '../RiteParts';
import { RiteElementOutline } from '../RiteElementOutline';
import { RiteLayer } from '../RiteLayer';
import { RiteShell } from '../RiteShell';
import { riteTokens } from '../tokens';
import { ACCENT_VAR, note, plainList, row, stack } from './styles';

/** Elements listed in the panel, longest looked at first. */
export const WATCHING_EYES_SHOWN = 8;

/** How strongly the heat outlines show, in percent, from coolest to hottest. */
export const HEAT_STRENGTH = { min: 25, max: 100 } as const;

/** Looks shorter than a minute are shown to the hundredth of a second. */
const MS_PER_MINUTE = 60_000;
const PERCENT = 100;

const { space, font, radius } = riteTokens;
const surface = riteTokens.surface;

const lookText = (ms: number) => (ms < MS_PER_MINUTE ? formatMs(ms) : formatDuration(ms));

/**
 * Props for {@link WatchingEyesRite}.
 */
export interface WatchingEyesRiteProps {
  /** Where to watch. @default the whole page */
  root?: Element | null;
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Watching Eyes: open them and scroll around. They note which parts of
 * the page are on screen and for how long, and can show it as heat: the
 * longer something was in view, the brighter its outline.
 *
 * @example
 * ```tsx
 * <WatchingEyesRite root={articleRef.current} />
 * ```
 */
export const WatchingEyesRite = ({ root = null, headingLevel = 2, className, style }: WatchingEyesRiteProps) => {
  const rite = useRite(watchingEyesCapability, { start: () => true });
  const awake = rite.status === 'active';
  const eyes = useWatchingEyes({ root: awake ? root ?? document.body : null, enabled: awake });
  const [showHeat, setShowHeat] = useState(true);

  const looked = eyes.watched.filter((item) => item.dwellMs > 0);
  const strength = (dwellMs: number) => Math.round(HEAT_STRENGTH.min + (HEAT_STRENGTH.max - HEAT_STRENGTH.min) * heatOf(dwellMs, eyes.longestMs));

  return (
    <RiteShell
      {...grimoireIgnoreProps}
      name={watchingEyesRite.name}
      tagline={watchingEyesRite.tagline}
      sigil={watchingEyesRite.sigil}
      accent={watchingEyesRite.accent}
      rite={rite}
      startLabel="Open the eyes"
      stopLabel="Close the eyes"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Time only counts while this tab is showing. Nothing is stored or sent anywhere."
    >
      {!awake ? (
        <p style={{ ...note, color: surface.text }}>Open the eyes, then scroll around. They notice what you look at, and for how long.</p>
      ) : (
        <div style={stack}>
          <RiteStatGrid>
            <RiteStat label="Watched" value={eyes.watched.length} hint="parts of the page" />
            <RiteStat label="On screen" value={eyes.seenNow} />
            <RiteStat label="Longest look" value={lookText(eyes.longestMs)} />
          </RiteStatGrid>

          <div style={row}>
            <Button size="sm" variant={showHeat ? 'secondary' : 'ghost'} aria-pressed={showHeat} onClick={() => setShowHeat((on) => !on)}>
              Show the heat
            </Button>
            <Button size="sm" variant="ghost" onClick={eyes.reset}>
              Start counting again
            </Button>
          </div>

          <RiteSection title="Looked at most">
            {looked.length === 0 ? (
              <RiteEmpty>Nothing has been on screen long enough yet.</RiteEmpty>
            ) : (
              <ol aria-label="Looked at most" style={plainList}>
                {looked.slice(0, WATCHING_EYES_SHOWN).map((item, index) => (
                  <li key={index} style={{ display: 'grid', gap: space.xs }}>
                    <div style={{ ...row, justifyContent: 'space-between', fontSize: font.small }}>
                      <span style={{ color: surface.text, overflowWrap: 'anywhere' }}>
                        {item.label}
                        {item.visible && <span style={{ color: surface.muted }}> · on screen</span>}
                      </span>
                      <span style={{ fontFamily: font.mono, color: surface.muted }}>{lookText(item.dwellMs)}</span>
                    </div>
                    <div aria-hidden="true" style={{ height: space.xs, background: surface.raised, borderRadius: radius.pill }}>
                      <div
                        style={{
                          width: `${(eyes.longestMs > 0 ? item.dwellMs / eyes.longestMs : 0) * PERCENT}%`,
                          height: '100%',
                          background: ACCENT_VAR,
                          borderRadius: radius.pill,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </RiteSection>

          {showHeat && looked.length > 0 && (
            <RiteLayer>
              {looked.map((item, index) => (
                <RiteElementOutline key={index} element={item.element} color={withAlpha(grimoireAccents.ember, strength(item.dwellMs))} />
              ))}
            </RiteLayer>
          )}
        </div>
      )}
    </RiteShell>
  );
};
