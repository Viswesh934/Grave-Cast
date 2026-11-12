/**
 * NecromancerRite - Freeze, slow, and scrub every animation on the page
 * @module components/grimoire/rites/NecromancerRite
 */

import { useState, type CSSProperties } from 'react';
import { grimoireIgnoreProps } from '../../../grimoire/dom/marker';
import { NECROMANCER_SPEEDS, necromancerCapability, necromancerRite } from '../../../grimoire/rites/necromancer';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useNecromancer } from '../../../hooks/useNecromancer';
import { useRite } from '../../../hooks/useRite';
import { Button } from '../../primitives/Button';
import { formatDuration } from '../format';
import { RiteLog, RiteSection, RiteSegmented, RiteSlider, RiteStat, RiteStatGrid } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens } from '../tokens';
import { note, row, stack } from './styles';

/** How finely the scrub slider moves, as a fraction of one run. */
export const NECROMANCER_SCRUB_STEP = 0.01;

/** Percent in one whole. */
const PERCENT = 100;

const surface = riteTokens.surface;

const speedLabel = (speed: number) => `${speed}×`;

/**
 * Props for {@link NecromancerRite}.
 */
export interface NecromancerRiteProps {
  /** Where to look for animations. @default the whole page */
  root?: Element | null;
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Necromancer: takes hold of every animation on the page. Freeze them,
 * slow them to a crawl, or drag them to any moment. Letting them go puts
 * each one back at the speed it had.
 *
 * @example
 * ```tsx
 * <NecromancerRite root={stageRef.current} />
 * ```
 */
export const NecromancerRite = ({ root = null, headingLevel = 2, className, style }: NecromancerRiteProps) => {
  const rite = useRite(necromancerCapability, { start: () => true });
  const awake = rite.status === 'active';
  const necro = useNecromancer({ root, enabled: awake });
  const [position, setPosition] = useState(0);
  const { announce } = useAriaAnnounce();

  const running = necro.animations.filter((info) => info.state === 'running').length;

  return (
    <RiteShell
      {...grimoireIgnoreProps}
      name={necromancerRite.name}
      tagline={necromancerRite.tagline}
      sigil={necromancerRite.sigil}
      accent={necromancerRite.accent}
      rite={rite}
      startLabel="Take control"
      stopLabel="Let them go"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Letting them go puts every animation back at its own speed. The page itself is not changed."
    >
      {!awake ? (
        <p style={{ ...note, color: surface.text }}>Take control to pause, slow down, or scrub through every animation on the page.</p>
      ) : (
        <div style={stack}>
          <RiteStatGrid>
            <RiteStat label="Animations" value={necro.animations.length} />
            <RiteStat label="Running" value={running} hint={necro.frozen ? 'Held still' : undefined} />
            <RiteStat label="Speed" value={speedLabel(necro.multiplier)} />
          </RiteStatGrid>

          <RiteSection title="Control">
            <div style={row}>
              <Button
                size="sm"
                variant={necro.frozen ? 'ghost' : 'secondary'}
                onClick={() => {
                  necro.pauseAll();
                  announce('Every animation is paused.');
                }}
              >
                Pause all
              </Button>
              <Button
                size="sm"
                variant={necro.frozen ? 'secondary' : 'ghost'}
                onClick={() => {
                  necro.playAll();
                  announce('Every animation is playing.');
                }}
              >
                Play all
              </Button>
            </div>
            <RiteSegmented
              label="Speed"
              value={String(necro.multiplier)}
              onChange={(value) => necro.setRate(Number(value))}
              options={NECROMANCER_SPEEDS.map((speed) => ({ value: String(speed), label: speedLabel(speed) }))}
            />
            <RiteSlider
              label="Scrub"
              value={position}
              min={0}
              max={1}
              step={NECROMANCER_SCRUB_STEP}
              format={(value) => `${Math.round(value * PERCENT)}% through`}
              onChange={(value) => {
                setPosition(value);
                necro.scrub(value);
              }}
            />
            <p style={note}>Scrubbing pauses everything. Press Play all to let them move again.</p>
          </RiteSection>

          <RiteSection title="Animations">
            <RiteLog
              label="Animations on the page"
              empty="Nothing is moving on the page right now."
              entries={necro.animations.map((info, index) => ({
                id: `${info.name}-${info.target ?? 'none'}-${index}`,
                text: info.name,
                detail: [info.target ?? 'nothing on the page', info.state, info.duration === null ? 'never ends' : formatDuration(info.duration)].join(' · '),
                tone: info.state === 'running' ? 'good' : 'neutral',
              }))}
            />
          </RiteSection>
        </div>
      )}
    </RiteShell>
  );
};
