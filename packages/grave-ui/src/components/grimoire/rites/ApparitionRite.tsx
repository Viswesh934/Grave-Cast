/**
 * ApparitionRite - Try each way a change can appear
 * @module components/grimoire/rites/ApparitionRite
 */

import { useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import {
  APPARITION_DURATION_MS,
  APPARITION_MAX_MS,
  APPARITION_MIN_MS,
  APPARITION_PRESETS,
  apparitionCapability,
  apparitionRite,
  type ApparitionMode,
  type ApparitionPreset,
} from '../../../grimoire/rites/apparition';
import { useApparition } from '../../../hooks/useApparition';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useRite } from '../../../hooks/useRite';
import { Button } from '../../primitives/Button';
import { RiteSection, RiteSegmented, RiteSlider, RiteStat, RiteStatGrid } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { RiteSigil, type SigilGlyph } from '../RiteSigil';
import { riteTokens } from '../tokens';
import { ACCENT_VAR, note, row, stack } from './styles';

/** How finely the duration slider moves, in ms. */
export const APPARITION_STEP_MS = 50;

/** Who appears in the demo, one after another. */
export const APPARITION_VISITORS: readonly { name: string; line: string; sigil: SigilGlyph }[] = [
  { name: 'The Grey Lady', line: 'Walks the east hall at dusk, looking for a letter.', sigil: 'ghost' },
  { name: 'The Lantern Child', line: 'Carries a light that never needs oil.', sigil: 'candle' },
  { name: 'The Bell Ringer', line: 'Rings at three, though the bell was taken down.', sigil: 'bell' },
  { name: 'The Mirror Guest', line: 'Only seen from the corner of the eye.', sigil: 'mirror' },
];

const PRESET_LABELS: Record<ApparitionPreset, string> = { fade: 'Fade', slide: 'Slide', rise: 'Rise', blur: 'Blur', flip: 'Flip' };
const MODE_WORDS: Record<ApparitionMode, string> = { 'view-transition': 'View Transition', fade: 'Simple fade', instant: 'No motion' };

/** Size of the visitor's sigil, in px. */
const VISITOR_SIGIL_SIZE = 40;

const { space, font, radius, line } = riteTokens;
const surface = riteTokens.surface;

/**
 * Props for {@link ApparitionRite}.
 */
export interface ApparitionRiteProps {
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Apparition: call the next visitor and watch the card change with the
 * chosen transition. Uses View Transitions where the browser has them, a
 * simple fade where it does not, and no motion for people who ask for less.
 *
 * @example
 * ```tsx
 * <ApparitionRite />
 * ```
 */
export const ApparitionRite = ({ headingLevel = 2, className, style }: ApparitionRiteProps) => {
  const rite = useRite(apparitionCapability, { start: () => true });
  const awake = rite.status === 'active';
  const [preset, setPreset] = useState<ApparitionPreset>('slide');
  const [durationMs, setDurationMs] = useState(APPARITION_DURATION_MS);
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const apparition = useApparition({ preset, durationMs });
  const lessMotion = useReducedMotion();
  const visitor = APPARITION_VISITORS[index];

  const step = (direction: 1 | -1) =>
    void apparition.summon(
      () => flushSync(() => setIndex((current) => (current + direction + APPARITION_VISITORS.length) % APPARITION_VISITORS.length)),
      cardRef.current
    );

  return (
    <RiteShell
      name={apparitionRite.name}
      tagline={apparitionRite.tagline}
      sigil={apparitionRite.sigil}
      accent={apparitionRite.accent}
      rite={rite}
      startLabel="Call them forth"
      stopLabel="Let them rest"
      headingLevel={headingLevel}
      className={className}
      style={style}
      footer="Only the card moves; the rest of the page stays still. People who ask their device for less motion see the change at once."
    >
      {!awake ? (
        <p style={{ ...note, color: surface.text }}>Call them forth, then try each way a visitor can appear.</p>
      ) : (
        <div style={stack}>
          <div
            ref={cardRef}
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: space.lg,
              padding: space.lg,
              background: surface.raised,
              border: `${line.hairline} solid ${surface.border}`,
              borderRadius: radius.md,
            }}
          >
            <span style={{ color: ACCENT_VAR, flexShrink: 0 }}>
              <RiteSigil glyph={visitor.sigil} size={VISITOR_SIGIL_SIZE} />
            </span>
            <span style={{ display: 'grid', gap: space.xs }}>
              <strong style={{ fontSize: font.large, color: surface.text }}>{visitor.name}</strong>
              <span style={{ fontSize: font.small, color: surface.muted }}>{visitor.line}</span>
            </span>
          </div>

          <div style={row}>
            <Button size="sm" variant="ghost" onClick={() => step(-1)}>
              ← Previous visitor
            </Button>
            <Button size="sm" variant="secondary" onClick={() => step(1)}>
              Next visitor →
            </Button>
          </div>

          <RiteSection title="How they appear">
            <RiteSegmented
              label="Transition"
              value={preset}
              onChange={setPreset}
              options={APPARITION_PRESETS.map((value) => ({ value, label: PRESET_LABELS[value] }))}
            />
            <RiteSlider
              label="Duration"
              value={durationMs}
              min={APPARITION_MIN_MS}
              max={APPARITION_MAX_MS}
              step={APPARITION_STEP_MS}
              onChange={setDurationMs}
              format={(value) => `${value} ms`}
            />
          </RiteSection>

          <RiteStatGrid>
            <RiteStat label="Last shown with" value={apparition.lastMode ? MODE_WORDS[apparition.lastMode] : 'Not yet'} />
            <RiteStat label="Less motion" value={lessMotion ? 'Asked for' : 'Not asked'} hint={lessMotion ? 'Changes appear at once' : undefined} />
          </RiteStatGrid>
        </div>
      )}
    </RiteShell>
  );
};
