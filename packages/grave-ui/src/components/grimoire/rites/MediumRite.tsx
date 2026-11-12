/**
 * MediumRite - Sees through any element on the page
 * @module components/grimoire/rites/MediumRite
 */

import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { formatHex } from '../../../grimoire/color/parse';
import { textContrast } from '../../../grimoire/dom/background';
import { describeElement } from '../../../grimoire/dom/describe';
import { createDomJournal } from '../../../grimoire/dom/journal';
import { grimoireIgnoreProps } from '../../../grimoire/dom/marker';
import { collectColors, type PageColor } from '../../../grimoire/dom/palette';
import { mediumCapability, mediumRite } from '../../../grimoire/rites/medium';
import { grimoireAccents, grimoireShades, inspectorColors } from '../../../grimoire/tokens';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useCopyText } from '../../../hooks/useCopyText';
import { useElementBox } from '../../../hooks/useElementBox';
import { useElementPicker, type PickerMove } from '../../../hooks/useElementPicker';
import { useLatest } from '../../../hooks/useLatest';
import { useRite } from '../../../hooks/useRite';
import { Button } from '../../primitives/Button';
import { BoxModelDiagram } from '../BoxModelDiagram';
import { ColorSwatch } from '../ColorSwatch';
import { ContrastBadge } from '../ContrastBadge';
import { describeDoubts, formatSize, readabilityAdvice } from '../format';
import { RiteElementOutline } from '../RiteElementOutline';
import { RiteHighlight } from '../RiteHighlight';
import { RiteLabel } from '../RiteLabel';
import { RiteLayer } from '../RiteLayer';
import { RiteEmpty, RiteSection } from '../RiteParts';
import { RiteShell } from '../RiteShell';
import { riteTokens } from '../tokens';
import { ACCENT_VAR, chip, codeTag, columns, divider, kbd, note, row, stack } from './styles';

/** Words the Medium can put into a possessed element, in turn. */
export const MEDIUM_POSSESSIONS = [
  'It is behind you.',
  'You should not have come here.',
  'The house is never empty.',
  'Leaving is not possible.',
] as const;

/** How many of the page's colors are shown. */
export const MEDIUM_PALETTE_SHOWN = 8;

/** How see-through "Fade" makes an element. */
const FADED_OPACITY = '0.35';

const { space, font, line } = riteTokens;
const surface = riteTokens.surface;

const MOVES: Record<PickerMove, { text: string; label: string }> = {
  parent: { text: '↑ Parent', label: 'Pin the parent element' },
  child: { text: '↓ Child', label: 'Pin the first child element' },
  previous: { text: '← Previous', label: 'Pin the previous element' },
  next: { text: 'Next →', label: 'Pin the next element' },
};

/** One sentence for screen readers: what an element is and how readable it is. */
const sentenceFor = (element: Element): string => {
  const { label, rects } = describeElement(element);
  const contrast = textContrast(element);
  const verdict = contrast.rating === 'fail' ? 'below AA' : `meets ${contrast.rating}`;
  return `${label}, ${formatSize(rects.border.width, rects.border.height)} pixels. Contrast ${contrast.ratio.toFixed(1)} to 1, ${verdict}.`;
};

const detailRow: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: space.lg,
  padding: `${space.xs} 0`,
  borderBottom: `${line.hairline} solid ${surface.border}`,
};

const Detail = ({ term, children }: { term: string; children: ReactNode }) => (
  <div style={detailRow}>
    <dt style={{ flexShrink: 0, fontSize: font.small, color: surface.muted }}>{term}</dt>
    <dd
      style={{
        margin: 0,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'right',
        fontFamily: font.mono,
        fontSize: font.small,
        color: surface.text,
      }}
    >
      {children}
    </dd>
  </div>
);

/**
 * Props for {@link MediumRite}.
 */
export interface MediumRiteProps {
  /** Only elements inside this one can be inspected. @default the whole page */
  root?: Element | null;
  /** The heading level of the rite's name, to fit the page outline. @default 2 */
  headingLevel?: 2 | 3 | 4;
  /** Called when the Medium wakes or falls asleep, for example to change the cursor. */
  onAwakeChange?: (awake: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Medium: point at anything to see its box drawn over the page, check
 * whether its words can be read, and possess it for a moment. Every change
 * can be undone, and putting the Medium to sleep leaves the page exactly as
 * it was.
 *
 * - Mouse: point to look, click to pin. Clicks pick instead of pressing.
 * - Keyboard: "Pin the first element", then walk the page with the buttons.
 *   Escape lets go; pressed again, it puts the Medium to sleep.
 * - The panel itself is never inspected, so it can sit on the same page.
 *
 * @example
 * ```tsx
 * <MediumRite />                       // the whole page
 * <MediumRite root={sampleElement} />  // just one part of it
 * ```
 */
export const MediumRite = ({ root = null, headingLevel = 2, onAwakeChange, className, style }: MediumRiteProps) => {
  const [journal] = useState(() => createDomJournal());
  const steps = useSyncExternalStore(journal.subscribe, () => journal.steps, () => journal.steps);
  const [colorKey, setColorKey] = useState<string | null>(null);
  const [possessions, setPossessions] = useState(0);
  const { announce } = useAriaAnnounce();
  const clipboard = useCopyText();
  const onAwakeChangeRef = useLatest(onAwakeChange);

  const medium = useRite(mediumCapability, {
    start: () => true,
    // Sleeping leaves the page exactly as it was found.
    stop: () => {
      journal.undoAll();
      setColorKey(null);
    },
  });
  const awake = medium.status === 'active';

  useEffect(() => {
    onAwakeChangeRef.current?.(awake);
  }, [awake, onAwakeChangeRef]);

  const picker = useElementPicker({
    root,
    enabled: awake,
    onPick: (element) => announce(element ? `Pinned ${sentenceFor(element)}` : 'Let go.'),
    onCancel: () => {
      medium.stop();
      picker.clear();
      announce('The Medium is asleep. The page is as it was.');
    },
  });

  const focus = useElementBox(picker.picked ?? picker.hovered);
  const hover = useElementBox(picker.hovered && picker.hovered !== picker.picked ? picker.hovered : null);
  const pinned = useElementBox(picker.picked);
  const description = focus.description;
  const contrast = useMemo(() => (description ? textContrast(description.element) : null), [description]);

  const scope = awake ? root ?? document.body : null;
  // Recounted after every edit, so the palette always matches what is shown.
  const editCount = steps.length;
  const palette = useMemo<PageColor[]>(
    () => (scope && editCount >= 0 ? collectColors(scope).colors.slice(0, MEDIUM_PALETTE_SHOWN) : []),
    [scope, editCount]
  );
  const chosenColor = palette.find((entry) => entry.key === colorKey) ?? null;

  const refreshBoxes = () => {
    focus.refresh();
    pinned.refresh();
  };

  const walk = (direction: PickerMove) => {
    if (!picker.move(direction)) announce(direction === 'parent' ? 'This is the outermost element.' : 'Nothing that way.');
  };

  const edit = (label: string, change: (element: Element) => void) => {
    const element = picker.picked;
    if (!element) return;
    journal.batch(label, () => change(element));
    refreshBoxes();
    announce(`${label}. Undo is available.`);
  };

  const undo = () => {
    if (!journal.undo()) return;
    refreshBoxes();
    announce('Undone.');
  };

  const undoAll = () => {
    const count = journal.undoAll();
    refreshBoxes();
    if (count) announce(`Undid ${count} ${count === 1 ? 'change' : 'changes'}. The page is as it was.`);
  };

  const copySelector = async () => {
    if (!description) return;
    const copied = await clipboard.copy(description.selector);
    announce(copied ? 'Selector copied.' : clipboard.error ?? 'Copying is not available.');
  };

  const possess = () => {
    const phrase = MEDIUM_POSSESSIONS[possessions % MEDIUM_POSSESSIONS.length];
    setPossessions((count) => count + 1);
    edit('Possessed the words', (element) => journal.setText(element, phrase));
  };

  const firstElement = () => picker.pick((root ?? document.body).firstElementChild);

  return (
    <>
      <RiteShell
        {...grimoireIgnoreProps}
        name={mediumRite.name}
        tagline={mediumRite.tagline}
        sigil={mediumRite.sigil}
        accent={mediumRite.accent}
        rite={medium}
        headingLevel={headingLevel}
        className={className}
        style={style}
        footer={
          <>
            <kbd style={kbd}>Esc</kbd> lets go of the pinned element. Press it again to put the Medium to sleep, which also undoes
            every change. Nothing leaves this page.
          </>
        }
      >
        {!awake && (
          <div style={{ display: 'grid', gap: space.sm }}>
            <p style={{ ...note, color: surface.text }}>Wake the Medium, then point at anything on the page.</p>
            <ul style={{ ...note, margin: 0, paddingLeft: space.lg, display: 'grid', gap: space.xs }}>
              <li>See the margin, border, padding, and size, drawn right on the page.</li>
              <li>Check whether its text is readable against what is behind it.</li>
              <li>Possess it for a moment. Every change can be undone.</li>
            </ul>
          </div>
        )}

        {awake && !description && (
          <RiteEmpty
            action={
              <Button size="sm" variant="secondary" onClick={firstElement}>
                Pin the first element
              </Button>
            }
          >
            Point at the page, or start from the top with the keyboard.
          </RiteEmpty>
        )}

        {awake && description && contrast && (
          <div style={stack}>
            <div style={row}>
              <code style={codeTag}>{description.label}</code>
              <span style={chip(Boolean(picker.picked))}>{picker.picked ? 'Pinned' : 'Following the pointer'}</span>
              <span style={{ marginLeft: 'auto' }}>
                <ContrastBadge {...contrast} />
              </span>
            </div>

            {picker.picked && (
              <div role="group" aria-label="Move through the page" style={{ ...row, gap: space.xs }}>
                {(Object.keys(MOVES) as PickerMove[]).map((direction) => (
                  <Button key={direction} size="sm" variant="ghost" aria-label={MOVES[direction].label} onClick={() => walk(direction)}>
                    {MOVES[direction].text}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => picker.pick(null)}>
                  Let go
                </Button>
              </div>
            )}

            <div style={columns}>
              <RiteSection title="Box">
                <BoxModelDiagram box={description.box} content={description.rects.content} />
              </RiteSection>
              <RiteSection
                title="Details"
                actions={
                  <Button size="sm" variant="ghost" onClick={() => void copySelector()}>
                    {clipboard.copied ? 'Copied' : 'Copy selector'}
                  </Button>
                }
              >
                <dl style={{ margin: 0 }}>
                  <Detail term="Size">{formatSize(description.rects.border.width, description.rects.border.height)}</Detail>
                  <Detail term="Display">{description.display}</Detail>
                  <Detail term="Position">{description.position || 'static'}</Detail>
                  <Detail term="Font">
                    {description.font.family || 'inherited'} · {Math.round(description.font.sizePx)}px · {description.font.weight}
                  </Detail>
                  <Detail term="Selector">{description.selector}</Detail>
                </dl>
              </RiteSection>
            </div>

            <RiteSection title="Readability">
              <div style={row}>
                <ColorSwatch color={contrast.foreground} detail="text" description="text color" />
                <span aria-hidden="true" style={note}>
                  on
                </span>
                <ColorSwatch color={contrast.background.color} detail="behind" description="background behind the text" />
              </div>
              <p style={note}>
                {readabilityAdvice(contrast.rating, contrast.large)} {describeDoubts(contrast.background.doubts)}
              </p>
            </RiteSection>

            <RiteSection title="Possess">
              {picker.picked ? (
                <div style={{ ...row, gap: space.xs }}>
                  <Button size="sm" variant="danger" onClick={possess}>
                    Possess the words
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => edit('Bled into it', (element) => journal.setStyle(element, 'color', grimoireShades.freshBlood))}
                  >
                    Bleed
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => edit('Faded it', (element) => journal.setStyle(element, 'opacity', FADED_OPACITY))}>
                    Fade
                  </Button>
                  <span aria-hidden="true" style={divider} />
                  <Button size="sm" variant="ghost" disabled={steps.length === 0} onClick={undo}>
                    {steps.length ? `Undo (${steps.length})` : 'Undo'}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={steps.length === 0} onClick={undoAll}>
                    Undo all
                  </Button>
                </div>
              ) : (
                <p style={note}>Pin an element to possess it.</p>
              )}
            </RiteSection>
          </div>
        )}

        {awake && palette.length > 0 && (
          <RiteSection title="Colors on this page" style={{ marginTop: space.xl }}>
            <div role="group" aria-label="Choose a color to outline where it is used." style={{ ...row, gap: space.xs }}>
              {palette.map((entry) => (
                <ColorSwatch
                  key={entry.key}
                  color={entry.color}
                  detail={`×${entry.count}`}
                  description={`used ${entry.count} ${entry.count === 1 ? 'time' : 'times'}`}
                  selected={entry.key === colorKey}
                  onSelect={() => {
                    const next = entry.key === colorKey ? null : entry.key;
                    setColorKey(next);
                    announce(next ? `Outlining elements that use ${formatHex(entry.color)}.` : 'Outlines hidden.');
                  }}
                />
              ))}
            </div>
          </RiteSection>
        )}
      </RiteShell>

      {awake && (
        <RiteLayer>
          {chosenColor?.elements.map((element, index) => (
            <RiteElementOutline key={`${chosenColor.key}-${index}`} element={element} color={grimoireAccents.candle} />
          ))}
          {pinned.description && <RiteHighlight rects={pinned.description.rects} />}
          {hover.description && <RiteHighlight rects={hover.description.rects} variant="outline" outlineColor={inspectorColors.content} />}
          {description && (
            <RiteLabel anchor={description.rects.border}>
              <span style={{ fontWeight: font.weight.bold, color: ACCENT_VAR }}>{description.label}</span>
              <span style={{ marginLeft: space.sm, color: surface.muted }}>
                {formatSize(description.rects.border.width, description.rects.border.height)}
              </span>
            </RiteLabel>
          )}
        </RiteLayer>
      )}
    </>
  );
};
