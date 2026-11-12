/**
 * SoulReaderRite - The true colors of a page, and the words nobody can read
 * @module components/grimoire/rites/SoulReaderRite
 */

import { useMemo, useState, type CSSProperties } from 'react';
import { BLACK, WHITE, contrastRatio, rateContrast } from '../../../grimoire/color/contrast';
import { formatHex, formatHsl, formatRgb } from '../../../grimoire/color/parse';
import { grimoireIgnoreProps } from '../../../grimoire/dom/marker';
import { collectColors, type ColorUse, type PageColor } from '../../../grimoire/dom/palette';
import { auditContrast, soulReaderCapability, soulReaderRite } from '../../../grimoire/rites/soulReader';
import { grimoireAccents, grimoireShades } from '../../../grimoire/tokens';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useCopyText } from '../../../hooks/useCopyText';
import { EYE_DROPPER_MESSAGES, useEyeDropper } from '../../../hooks/useEyeDropper';
import { useRite } from '../../../hooks/useRite';
import { Button } from '../../primitives/Button';
import { ColorSwatch } from '../ColorSwatch';
import { ContrastBadge } from '../ContrastBadge';
import { RiteElementOutline } from '../RiteElementOutline';
import { RiteLayer } from '../RiteLayer';
import { RiteEmpty, RiteSection, RiteStat, RiteStatGrid } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens } from '../tokens';
import { ACCENT_VAR, codeTag, note, plainList, row, stack } from './styles';

/** How many colors the palette shows. */
export const SOUL_READER_PALETTE_SHOWN = 12;

/** How many hard-to-read pieces of text are listed before "and more". */
export const SOUL_READER_ISSUES_SHOWN = 8;

/** Narrowest the text of an issue gets before its badge wraps below it. */
const ISSUE_TEXT_MIN = '8rem';

const { space, radius, font, line } = riteTokens;
const surface = riteTokens.surface;

/** What each use of a color is called. */
const USE_WORDS: Record<ColorUse, string> = {
  text: 'text',
  background: 'fill',
  border: 'border',
  outline: 'outline',
  fill: 'shape',
  stroke: 'line',
};

/** The use a color is most often found in, such as "text ×3". */
const mainUse = (entry: PageColor): string => {
  const [use, count] = (Object.entries(entry.uses) as [ColorUse, number][]).sort((a, b) => b[1] - a[1])[0] ?? ['text', 0];
  return `${USE_WORDS[use]} ×${count}`;
};

const issueButton = (pressed: boolean): CSSProperties => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: space.sm,
  width: '100%',
  padding: space.sm,
  textAlign: 'left',
  background: pressed ? surface.raised : 'transparent',
  color: surface.text,
  border: `${line.hairline} solid ${pressed ? ACCENT_VAR : surface.border}`,
  borderRadius: radius.md,
  fontFamily: font.body,
  fontSize: font.small,
  cursor: 'pointer',
});

/**
 * Props for {@link SoulReaderRite}.
 */
export interface SoulReaderRiteProps {
  /** The part of the page to read. @default the whole page */
  root?: Element | null;
  /** The heading level of the rite's name. @default 2 */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Soul Reader: every color the page really paints, grouped and counted;
 * every piece of text below WCAG AA, worst first; and a picker that steals
 * any color from the screen (Chrome and Edge).
 *
 * Choosing a color outlines everything that uses it; choosing a piece of
 * text outlines it and scrolls it into view.
 *
 * @example
 * ```tsx
 * <SoulReaderRite />
 * ```
 */
export const SoulReaderRite = ({ root = null, headingLevel = 2, className, style }: SoulReaderRiteProps) => {
  const [version, setVersion] = useState(0);
  const [colorKey, setColorKey] = useState<string | null>(null);
  const [focused, setFocused] = useState<Element | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const { announce } = useAriaAnnounce();
  const clipboard = useCopyText();
  const dropper = useEyeDropper();

  const reader = useRite(soulReaderCapability, {
    start: () => true,
    stop: () => {
      setColorKey(null);
      setFocused(null);
    },
  });
  const awake = reader.status === 'active';
  const scope = awake ? root ?? document.body : null;

  const allColors = useMemo(() => (scope && version >= 0 ? collectColors(scope).colors : []), [scope, version]);
  const palette = allColors.slice(0, SOUL_READER_PALETTE_SHOWN);
  const audit = useMemo(() => (scope && version >= 0 ? auditContrast(scope) : null), [scope, version]);
  const chosenColor = palette.find((entry) => entry.key === colorKey) ?? null;
  const issues = audit?.issues ?? [];

  const lookAgain = () => {
    setVersion((current) => current + 1);
    setFocused(null);
    announce('Read the page again.');
  };

  const focusIssue = (element: Element) => {
    const next = focused === element ? null : element;
    setFocused(next);
    next?.scrollIntoView?.({ block: 'nearest' });
  };

  const pickFromScreen = async () => {
    const color = await dropper.pick();
    if (color) announce(`Picked ${formatHex(color)}.`);
  };

  const copyFormat = async (label: string, text: string) => {
    if (await clipboard.copy(text)) {
      setCopiedFormat(label);
      announce(`${label} copied.`);
    }
  };

  const picked = dropper.color;

  return (
    <>
      <RiteShell
        {...grimoireIgnoreProps}
        name={soulReaderRite.name}
        tagline={soulReaderRite.tagline}
        sigil={soulReaderRite.sigil}
        accent={soulReaderRite.accent}
        rite={reader}
        startLabel="Read the page"
        stopLabel="Stop reading"
        headingLevel={headingLevel}
        className={className}
        style={style}
        actions={
          awake ? (
            <Button size="sm" variant="ghost" onClick={lookAgain}>
              Look again
            </Button>
          ) : undefined
        }
        footer="Everything is read on this device. Choose a color or a line of text to point it out on the page."
      >
        {!awake && <p style={{ ...note, color: surface.text }}>Read the page to see its colors and find the words nobody can read.</p>}

        {awake && audit && (
          <div style={stack}>
            <RiteStatGrid>
              <RiteStat label="Colors" value={allColors.length} hint="painted on the page" />
              <RiteStat label="Text checked" value={audit.checked} hint={audit.truncated ? 'the first part of a long page' : 'pieces of text'} />
              <RiteStat
                label="Hard to read"
                value={issues.length}
                hint={issues.length === 0 ? 'Every word can be read' : 'below WCAG AA'}
                tone={issues.length === 0 ? 'good' : 'bad'}
              />
            </RiteStatGrid>

            <RiteSection title="Palette">
              <div role="group" aria-label="Choose a color to outline where it is used." style={{ ...row, gap: space.xs }}>
                {palette.map((entry) => (
                  <ColorSwatch
                    key={entry.key}
                    color={entry.color}
                    detail={mainUse(entry)}
                    description={`used ${entry.count} ${entry.count === 1 ? 'time' : 'times'}, mostly as ${mainUse(entry)}`}
                    selected={entry.key === colorKey}
                    onSelect={() => {
                      const next = entry.key === colorKey ? null : entry.key;
                      setColorKey(next);
                      announce(next ? `Outlining everything that uses ${formatHex(entry.color)}.` : 'Outlines hidden.');
                    }}
                  />
                ))}
              </div>
              {allColors.length > palette.length && <p style={note}>And {allColors.length - palette.length} more, used less often.</p>}
            </RiteSection>

            <RiteSection title="Hard to read">
              {issues.length === 0 ? (
                <RiteEmpty>Every word here can be read.</RiteEmpty>
              ) : (
                <>
                  <ul style={plainList}>
                    {issues.slice(0, SOUL_READER_ISSUES_SHOWN).map((issue, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          aria-pressed={focused === issue.element}
                          onClick={() => focusIssue(issue.element)}
                          style={issueButton(focused === issue.element)}
                        >
                          <code style={{ ...codeTag, fontSize: font.small }}>{issue.label}</code>
                          <span style={{ flex: `1 1 ${ISSUE_TEXT_MIN}`, minWidth: 0, color: surface.muted }}>{issue.text}</span>
                          <ContrastBadge {...issue.contrast} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  {issues.length > SOUL_READER_ISSUES_SHOWN && <p style={note}>And {issues.length - SOUL_READER_ISSUES_SHOWN} more.</p>}
                </>
              )}
            </RiteSection>

            <RiteSection title="Steal a color">
              <div style={row}>
                <Button size="sm" variant="gothic" loading={dropper.picking} disabled={!dropper.supported} onClick={() => void pickFromScreen()}>
                  Pick from the screen
                </Button>
                {!dropper.supported && <span style={note}>{EYE_DROPPER_MESSAGES.unsupported}</span>}
                {dropper.error && dropper.supported && (
                  <span role="alert" style={{ ...note, color: grimoireShades.freshBlood }}>
                    {dropper.error}
                  </span>
                )}
              </div>
              {picked && (
                <div style={{ display: 'grid', gap: space.sm }}>
                  <div style={row}>
                    <ColorSwatch color={picked} description="the picked color" />
                    {[
                      { label: 'On white', ratio: contrastRatio(picked, WHITE) },
                      { label: 'On black', ratio: contrastRatio(picked, BLACK) },
                    ].map(({ label, ratio }) => (
                      <span key={label} style={{ ...row, gap: space.xs }}>
                        <span style={note}>{label}</span>
                        <ContrastBadge ratio={ratio} rating={rateContrast(ratio)} />
                      </span>
                    ))}
                  </div>
                  <div role="group" aria-label="Copy the picked color" style={{ ...row, gap: space.xs }}>
                    {[
                      { label: 'Hex', text: formatHex(picked) },
                      { label: 'RGB', text: formatRgb(picked) },
                      { label: 'HSL', text: formatHsl(picked) },
                    ].map(({ label, text }) => (
                      <Button key={label} size="sm" variant="ghost" aria-label={`Copy ${label}: ${text}`} onClick={() => void copyFormat(label, text)}>
                        {clipboard.copied && copiedFormat === label ? 'Copied' : text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </RiteSection>
          </div>
        )}
      </RiteShell>

      {awake && (
        <RiteLayer>
          {chosenColor?.elements.map((element, index) => (
            <RiteElementOutline key={`${chosenColor.key}-${index}`} element={element} color={grimoireAccents.candle} />
          ))}
          {focused && <RiteElementOutline element={focused} color={grimoireShades.freshBlood} variant="box-model" />}
        </RiteLayer>
      )}
    </>
  );
};
