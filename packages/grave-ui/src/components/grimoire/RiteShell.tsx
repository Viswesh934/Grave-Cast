/**
 * RiteShell - The frame every rite lives in
 * @module components/grimoire/RiteShell
 */

import { useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import type { RiteStatus } from '../../grimoire/core/status';
import { grimoireAccents, grimoireShades, type GrimoireAccent } from '../../grimoire/tokens';
import { withAlpha } from '../../tokens/colors';
import { Button } from '../primitives/Button';
import { RiteHeadingContext } from './RiteParts';
import { RiteSigil, type SigilGlyph } from './RiteSigil';
import { ACCENT_STRENGTH, RITE_CLASS, RITE_VARS, accentGlow, riteAnimation, riteStatusMeta, riteStyles, riteTokens } from './tokens';

/**
 * The parts of a rite the shell can drive. The return value of `useRite`
 * fits, so a rite can be passed straight in.
 */
export interface RiteShellControls {
  status: RiteStatus;
  error: string | null;
  supported: boolean;
  start: () => unknown;
  stop: () => void;
  clearError: () => void;
}

/**
 * Props for {@link RiteShell}.
 */
export interface RiteShellProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /** The rite's name, shown as the heading. */
  name: string;
  /** One plain line on what it does. */
  tagline?: string;
  /** The rite's mark. @default 'pentacle' */
  sigil?: SigilGlyph;
  /** The color the rite is lit by. @default 'witchfire' */
  accent?: GrimoireAccent;
  /** A rite from `useRite`. Adds the status line, the start and stop button, and error messages. */
  rite?: RiteShellControls;
  /** Label of the start button. @default 'Wake' */
  startLabel?: string;
  /** Label of the stop button. @default 'Put to sleep' */
  stopLabel?: string;
  /** More buttons, shown beside the start button. */
  actions?: ReactNode;
  /** The heading level, to fit the page outline. @default 2 */
  headingLevel?: 2 | 3 | 4;
  /** What the rite shows. */
  children?: ReactNode;
  /** A quiet line at the bottom, for hints and shortcuts. */
  footer?: ReactNode;
}

const { space, radius, font, line, motion } = riteTokens;
const surface = riteTokens.surface;

/** Narrowest the name column gets before the controls wrap below it. */
const TITLE_MIN_WIDTH = '12rem';

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: space.md };

/** A small round light and a word: where the rite stands. */
const StatusLine = ({ status }: { status: RiteStatus }) => {
  const meta = riteStatusMeta[status];
  return (
    <span
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: space.sm,
        padding: `${space.xs} ${space.md}`,
        borderRadius: radius.pill,
        border: `${line.hairline} solid ${surface.border}`,
        background: surface.raised,
        color: surface.text,
        fontSize: font.small,
        fontFamily: font.mono,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: riteTokens.size.dot,
          height: riteTokens.size.dot,
          borderRadius: radius.pill,
          background: meta.color,
          boxShadow: status === 'active' ? `0 0 ${riteTokens.size.dot} ${meta.color}` : undefined,
          animation: meta.pulsing ? `${riteAnimation.breathe} ${motion.breathe} ease-in-out infinite` : undefined,
        }}
      />
      {meta.label}
    </span>
  );
};

/**
 * The shared frame for every rite: its mark and name, a status line, the
 * start and stop button, plain-language errors, and room for the rite itself.
 * Pass the rite from `useRite` and the frame wires itself up.
 *
 * - The status line is announced politely as it changes. Errors are
 *   announced right away; "not available here" is shown quietly.
 * - Focus rings use the rite's accent, and every accent is visible on the
 *   panel. Motion stops for people who prefer less of it.
 *
 * @example
 * ```tsx
 * const vigil = useRite(wakeLockCapability, { start, stop });
 *
 * <RiteShell name="Vigil" tagline="Keeps the screen awake" sigil="candle" accent="candle" rite={vigil}>
 *   <p>The candle burns while this page is open.</p>
 * </RiteShell>
 * ```
 */
export const RiteShell = ({
  name,
  tagline,
  sigil = 'pentacle',
  accent = 'witchfire',
  rite,
  startLabel = 'Wake',
  stopLabel = 'Put to sleep',
  actions,
  headingLevel = 2,
  children,
  footer,
  className,
  style,
  ...rest
}: RiteShellProps) => {
  const headingId = useId();
  const taglineId = useId();
  const color = grimoireAccents[accent];
  const Heading = `h${headingLevel}` as const;
  const status = rite?.status ?? 'idle';
  const awake = status === 'active';
  const waking = status === 'requesting';
  const blocked = status === 'unavailable';
  const failed = status === 'denied' || status === 'error';
  const shellClass = [RITE_CLASS.shell, className].filter(Boolean).join(' ');

  return (
    <section
      {...rest}
      aria-labelledby={headingId}
      aria-describedby={tagline ? taglineId : undefined}
      className={shellClass}
      style={{
        [RITE_VARS.accent]: color,
        [RITE_VARS.focus]: color,
        color: surface.text,
        background: surface.panel,
        border: `${line.hairline} solid ${surface.border}`,
        borderTop: `${line.focus} solid ${awake ? color : withAlpha(color, ACCENT_STRENGTH.ring)}`,
        borderRadius: radius.lg,
        boxShadow: awake ? accentGlow(color) : riteTokens.shadow,
        fontFamily: font.body,
        fontSize: font.base,
        lineHeight: font.lineHeight,
        transition: `box-shadow ${motion.base} ${motion.ease}, border-color ${motion.base} ${motion.ease}`,
        ...style,
      } as CSSProperties}
    >
      <style>{riteStyles}</style>

      <header style={{ ...row, padding: space.lg, borderBottom: `${line.hairline} solid ${surface.border}` }}>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: riteTokens.size.sigil.lg,
            height: riteTokens.size.sigil.lg,
            borderRadius: radius.pill,
            color,
            background: withAlpha(color, ACCENT_STRENGTH.soft),
            border: `${line.hairline} solid ${withAlpha(color, ACCENT_STRENGTH.ring)}`,
          }}
        >
          <RiteSigil glyph={sigil} size="md" />
        </span>
        <div style={{ flex: `1 1 ${TITLE_MIN_WIDTH}`, minWidth: 0 }}>
          <Heading
            id={headingId}
            style={{ margin: 0, fontFamily: font.title, fontSize: font.heading, fontWeight: font.weight.bold, color: surface.text }}
          >
            {name}
          </Heading>
          {tagline && (
            <p id={taglineId} style={{ margin: 0, marginTop: space.xs, fontSize: font.small, color: surface.muted }}>
              {tagline}
            </p>
          )}
        </div>
        {rite && (
          <div style={{ ...row, gap: space.sm }}>
            <StatusLine status={status} />
            {actions}
            {awake ? (
              <Button size="sm" variant="secondary" onClick={rite.stop}>
                {stopLabel}
              </Button>
            ) : (
              <Button size="sm" variant="gothic" loading={waking} disabled={blocked || !rite.supported} onClick={() => void rite.start()}>
                {waking ? 'Waking…' : failed ? 'Try again' : startLabel}
              </Button>
            )}
          </div>
        )}
        {!rite && actions && <div style={{ ...row, gap: space.sm }}>{actions}</div>}
      </header>

      {rite?.error && failed && (
        <div
          role="alert"
          style={{
            ...row,
            justifyContent: 'space-between',
            padding: `${space.sm} ${space.lg}`,
            background: withAlpha(grimoireShades.freshBlood, ACCENT_STRENGTH.soft),
            color: grimoireShades.freshBlood,
            fontSize: font.small,
          }}
        >
          <span>{rite.error}</span>
          <Button size="sm" variant="ghost" onClick={rite.clearError}>
            Dismiss
          </Button>
        </div>
      )}
      {rite?.error && !failed && (
        <p style={{ margin: 0, padding: `${space.sm} ${space.lg}`, fontSize: font.small, color: surface.muted }}>{rite.error}</p>
      )}

      {children !== undefined && (
        <RiteHeadingContext.Provider value={headingLevel}>
          <div style={{ padding: space.lg }}>{children}</div>
        </RiteHeadingContext.Provider>
      )}

      {footer && (
        <footer
          style={{
            padding: `${space.sm} ${space.lg}`,
            borderTop: `${line.hairline} solid ${surface.border}`,
            fontSize: font.small,
            color: surface.muted,
          }}
        >
          {footer}
        </footer>
      )}
    </section>
  );
};
