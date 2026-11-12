/**
 * VigilRite - Keeps the screen awake while the candle burns
 * @module components/grimoire/rites/VigilRite
 */

import { useEffect, useRef, type CSSProperties } from 'react';
import { vigilRite } from '../../../grimoire/rites/vigil';
import { grimoireAccents, grimoireShades } from '../../../grimoire/tokens';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useFullscreen } from '../../../hooks/useFullscreen';
import { useNow } from '../../../hooks/useNow';
import { useVigil } from '../../../hooks/useVigil';
import { withAlpha } from '../../../tokens/colors';
import { Button } from '../../primitives/Button';
import { formatDuration } from '../format';
import { RiteSection, RiteStat, RiteStatGrid } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { RITE_CLASS, riteTokens } from '../tokens';
import { note, row, stack } from './styles';

/** Class on the wrapper that fills the screen in ritual mode. */
export const VIGIL_CLASS = 'grimoire-vigil';

/** Name of the flame's flicker animation. */
const FLAME_ANIMATION = 'grimoire-flame';

/** Sizes of the candle drawing. */
export const vigilTokens = {
  wax: { width: '2.75rem', height: '6.5rem', radius: '0.5rem' },
  flame: { width: '1.1rem', height: '2rem' },
  wick: { width: '2px', height: '0.6rem' },
  /** Widest the panel grows in ritual mode. */
  ritualWidth: '36rem',
  /** How far the flame sways each way, in degrees, and how much it stretches. */
  sway: { degrees: 3, stretch: 1.08, squash: 0.93 },
  /** How strongly the flame lights its surroundings, in percent. */
  glowStrength: 45,
  /** How far the glow reaches, in px. */
  glowBlur: 28,
} as const;

const { space, font } = riteTokens;
const surface = riteTokens.surface;

const vigilStyles = `
@keyframes ${FLAME_ANIMATION} {
  0%, 100% { transform: rotate(-${vigilTokens.sway.degrees}deg) scale(1, 1); }
  50% { transform: rotate(${vigilTokens.sway.degrees}deg) scale(${vigilTokens.sway.squash}, ${vigilTokens.sway.stretch}); }
}
.${VIGIL_CLASS}:fullscreen {
  display: grid;
  place-items: center;
  padding: ${space.xl};
  background: ${surface.page};
}
.${VIGIL_CLASS}:fullscreen > section {
  width: min(${vigilTokens.ritualWidth}, 100%);
}
`;

/** A candle drawn in CSS: lit and flickering while the Vigil burns. */
const Candle = ({ lit }: { lit: boolean }) => (
  <div aria-hidden="true" style={{ display: 'grid', justifyItems: 'center', paddingTop: space.lg }}>
    <div
      className={RITE_CLASS.motion}
      style={{
        width: vigilTokens.flame.width,
        height: vigilTokens.flame.height,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        transformOrigin: '50% 100%',
        background: `radial-gradient(circle at 50% 70%, ${grimoireShades.parchment} 0%, ${grimoireAccents.candle} 45%, ${grimoireShades.ember} 100%)`,
        boxShadow: `0 0 ${vigilTokens.glowBlur}px ${withAlpha(grimoireAccents.candle, vigilTokens.glowStrength)}`,
        opacity: lit ? 1 : 0,
        animation: lit ? `${FLAME_ANIMATION} ${riteTokens.motion.breathe} ease-in-out infinite` : undefined,
        transition: `opacity ${riteTokens.motion.base} ${riteTokens.motion.ease}`,
      }}
    />
    <div style={{ width: vigilTokens.wick.width, height: vigilTokens.wick.height, background: grimoireShades.binding }} />
    <div
      style={{
        width: vigilTokens.wax.width,
        height: vigilTokens.wax.height,
        borderRadius: `${vigilTokens.wax.radius} ${vigilTokens.wax.radius} 0 0`,
        background: `linear-gradient(90deg, ${surface.muted}, ${grimoireShades.parchment} 45%, ${surface.muted})`,
        boxShadow: lit ? `0 0 ${vigilTokens.glowBlur}px ${withAlpha(grimoireAccents.candle, vigilTokens.glowStrength / 2)}` : undefined,
      }}
    />
  </div>
);

/**
 * Props for {@link VigilRite}.
 */
export interface VigilRiteProps {
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Vigil: light the candle and the screen stays awake. When you switch
 * tabs the browser lets go of the screen; the Vigil lights it again as soon
 * as you come back. Ritual mode fills the screen with the candle.
 *
 * @example
 * ```tsx
 * <VigilRite />
 * ```
 */
export const VigilRite = ({ headingLevel = 2, className, style }: VigilRiteProps) => {
  const vigil = useVigil();
  const fullscreen = useFullscreen();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lit = vigil.status === 'active';
  const now = useNow(undefined, lit);
  const { announce } = useAriaAnnounce();
  const inRitual = fullscreen.element !== null && fullscreen.element === wrapperRef.current;

  useEffect(() => {
    if (vigil.relit > 0) announce('You are back. The candle is lit again.');
  }, [vigil.relit, announce]);

  return (
    <div ref={wrapperRef} className={VIGIL_CLASS}>
      <style>{vigilStyles}</style>
      <RiteShell
        name={vigilRite.name}
        tagline={vigilRite.tagline}
        sigil={vigilRite.sigil}
        accent={vigilRite.accent}
        rite={vigil}
        startLabel="Light the candle"
        stopLabel="Let it go out"
        headingLevel={headingLevel}
        className={className}
        style={style}
        footer="The screen stays awake only while this tab is showing. Nothing is stored."
      >
        <div style={stack}>
          <Candle lit={lit} />
          <p style={{ ...note, textAlign: 'center', color: surface.text }}>
            {lit
              ? 'The candle is burning. The screen will not dim while this tab is showing.'
              : 'Light the candle to keep the screen awake while you read, cook, or keep watch.'}
          </p>

          <RiteStatGrid>
            <RiteStat label="Burning for" value={lit && vigil.litAt ? formatDuration(now.getTime() - vigil.litAt) : 'Not lit'} />
            <RiteStat label="Lit again" value={vigil.relit} hint="times, after you came back" />
          </RiteStatGrid>

          <RiteSection title="Ritual mode">
            {fullscreen.supported ? (
              <div style={row}>
                <Button
                  size="sm"
                  variant={inRitual ? 'secondary' : 'ghost'}
                  onClick={() => void (inRitual ? fullscreen.exit() : fullscreen.enter(wrapperRef.current))}
                >
                  {inRitual ? 'Leave the ritual' : 'Fill the screen'}
                </Button>
                <span style={note}>{inRitual ? 'Press Escape to leave at any time.' : 'Shows only the candle, on a dark screen.'}</span>
              </div>
            ) : (
              <p style={note}>This browser cannot fill the screen with the candle.</p>
            )}
            {fullscreen.error && (
              <p role="alert" style={{ ...note, color: grimoireShades.freshBlood, fontSize: font.small }}>
                {fullscreen.error}
              </p>
            )}
          </RiteSection>
        </div>
      </RiteShell>
    </div>
  );
};
