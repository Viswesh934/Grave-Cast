import { useMemo, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  BoxModelDiagram,
  Button,
  ColorSwatch,
  ContrastBadge,
  RiteHighlight,
  RiteLabel,
  RiteLayer,
  RiteShell,
  collectColors,
  createDomJournal,
  defineCapability,
  describeElement,
  formatHex,
  formatSize,
  grimoireAccents,
  grimoireShades,
  inspectorColors,
  textContrast,
  useAriaAnnounce,
  useElementBox,
  useElementPicker,
  useRite,
  type BackgroundDoubt,
  type PageColor,
  type PickerMove,
} from 'groove-ui';

/** What the Medium needs from the browser. */
const inspectionCapability = defineCapability({
  id: 'medium',
  label: 'Element inspection',
  detect: () => typeof document.elementsFromPoint === 'function' && typeof getComputedStyle === 'function',
});

const POSSESSIONS = [
  'It is behind you.',
  'You should not have come here.',
  'The inn is never empty.',
  'Checkout is not possible.',
];

const PALETTE_SHOWN = 8;
const COPIED_MS = 1800;
const FADED_OPACITY = '0.35';

const DOUBT_WORDS: Record<BackgroundDoubt, string> = {
  image: 'a background image',
  media: 'an image or video',
  positioned: 'layers placed over the page',
  opacity: 'see-through layers',
  filter: 'a filter',
  blend: 'a blend mode',
  scheme: 'the dark page color',
};

const describeDoubts = (doubts: BackgroundDoubt[]) =>
  doubts.length === 0 ? '' : `Estimated, because of ${doubts.map((doubt) => DOUBT_WORDS[doubt]).join(' and ')}.`;

/** One sentence for screen readers: what the element is and how readable it is. */
const sentenceFor = (element: Element) => {
  const { label, rects } = describeElement(element);
  const contrast = textContrast(element);
  const verdict = contrast.rating === 'fail' ? 'below AA' : `meets ${contrast.rating}`;
  return `${label}, ${formatSize(rects.border.width, rects.border.height)} pixels. Contrast ${contrast.ratio.toFixed(1)} to 1, ${verdict}.`;
};

const MOVE_LABELS: Record<PickerMove, { text: string; label: string }> = {
  parent: { text: '↑ Parent', label: 'Pin the parent element' },
  child: { text: '↓ Child', label: 'Pin the first child element' },
  previous: { text: '← Previous', label: 'Pin the previous element' },
  next: { text: 'Next →', label: 'Pin the next element' },
};

/** A small, believable website to inspect. Nothing in it goes anywhere. */
function HauntedPage({ stageRef, awake }: { stageRef: (element: HTMLDivElement | null) => void; awake: boolean }) {
  const stay = (event: MouseEvent) => event.preventDefault();
  return (
    <div
      ref={stageRef}
      role="region"
      aria-label="The Hollow Inn, a sample page to inspect"
      className={`overflow-hidden rounded-2xl border border-[#2a2433] bg-[#16141c] text-left shadow-2xl ${awake ? 'cursor-crosshair' : ''}`}
    >
      <header className="flex items-center justify-between gap-4 border-b border-[#2a2433] bg-[#1d1a25] px-5 py-3">
        <span className="font-serif text-lg font-bold text-[#efe6d2]">The Hollow Inn</span>
        <nav aria-label="Inn" className="flex gap-4 text-sm">
          <a href="#rooms" onClick={stay} className="text-[#c9bfa8] hover:text-white">Rooms</a>
          <a href="#dining" onClick={stay} className="text-[#c9bfa8] hover:text-white">Dining</a>
          <a href="#crypt" onClick={stay} className="text-[#c9bfa8] hover:text-white">The crypt</a>
        </nav>
      </header>

      <section className="space-y-3 px-5 py-6">
        <span className="inline-block rounded-full bg-[#2c1d24] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#ff8f9a]">
          Vacancy
        </span>
        <h3 className="title font-serif text-2xl font-bold text-[#f5efe2]">Rooms for the restless</h3>
        <p className="max-w-md text-sm leading-relaxed text-[#b9b0a0]">
          Thirteen candlelit rooms above an old family crypt. Breakfast is served at midnight, and the stairs only
          creak when someone is on them.
        </p>
        <button type="button" className="rounded-lg bg-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7c4fe6]">
          Book a night
        </button>
      </section>

      <section className="grid gap-3 px-5 pb-6 sm:grid-cols-2">
        <article className="rounded-xl border border-[#2a2433] bg-[#1f1b28] p-4">
          <h4 className="font-semibold text-[#efe6d2]">The Widow’s Suite</h4>
          <p className="mt-1 text-sm text-[#b9b0a0]">A four-poster bed and a mirror that looks back.</p>
        </article>
        <article className="rounded-xl border border-[#2a2433] bg-[#1f1b28] p-4">
          <h4 className="font-semibold text-[#efe6d2]">The Bell Tower</h4>
          <p className="mt-1 text-sm text-[#b9b0a0]">Quiet, except at three in the morning.</p>
        </article>
        {/* Deliberately faint, so the Medium has something to warn about. */}
        <p className="caption text-xs text-[#4a4550] sm:col-span-2">Checkout at dawn. No refunds for the possessed.</p>
      </section>
    </div>
  );
}

/** Traces one element that uses the chosen color, following it as it moves. */
function MatchOutline({ element, color }: { element: Element; color: string }) {
  const { description } = useElementBox(element);
  return description ? <RiteHighlight rects={description.rects} variant="outline" outlineColor={color} /> : null;
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#2a2433] py-1.5 last:border-b-0">
      <dt className="shrink-0 text-xs text-[#9da1b6]">{term}</dt>
      <dd className="m-0 min-w-0 truncate text-right font-mono text-xs text-[#ece2cc]">{children}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h4 className="mb-2 mt-0 font-mono text-[11px] font-normal uppercase tracking-[0.12em] text-[#9da1b6]">{children}</h4>;
}

function MediumDemo() {
  // Kept in state (not a ref) so the palette can be read during render.
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [journal] = useState(() => createDomJournal());
  const steps = useSyncExternalStore(journal.subscribe, () => journal.steps, () => journal.steps);
  const [colorKey, setColorKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [possessions, setPossessions] = useState(0);
  const { announce } = useAriaAnnounce();

  const medium = useRite(inspectionCapability, {
    start: () => true,
    // Sleeping leaves the page exactly as it was found.
    stop: () => {
      journal.undoAll();
      setColorKey(null);
    },
  });
  const awake = medium.status === 'active';

  const picker = useElementPicker({
    root: stage,
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

  // Recounted whenever the page is edited, so the palette always matches what is shown.
  const editCount = steps.length;
  const palette = useMemo<PageColor[]>(
    () => (awake && stage && editCount >= 0 ? collectColors(stage).colors.slice(0, PALETTE_SHOWN) : []),
    [awake, stage, editCount]
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
    try {
      await navigator.clipboard.writeText(description.selector);
      setCopied(true);
      announce('Selector copied.');
      setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      announce('Copying is blocked in this browser.');
    }
  };

  const possess = () => {
    const phrase = POSSESSIONS[possessions % POSSESSIONS.length];
    setPossessions((count) => count + 1);
    edit('Possessed the words', (element) => journal.setText(element, phrase));
  };

  return (
    <div className="grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="space-y-3">
        <HauntedPage stageRef={setStage} awake={awake} />
        <p className="m-0 px-1 text-xs text-stone-400">
          {awake ? 'Point at anything on the page. Click to pin it.' : 'A sample page. Wake the Medium to look inside it.'}
        </p>
      </div>

      <RiteShell
        name="Medium"
        tagline="Sees through any element: its box, its colors, and whether its words can be read."
        sigil="eye"
        accent="witchfire"
        rite={medium}
        headingLevel={3}
        footer={
          <>
            <kbd className="rounded border border-[#3a3047] px-1 font-mono">Esc</kbd> lets go of the pinned element. Press it again to put the
            Medium to sleep, which also undoes every change. Nothing leaves this page.
          </>
        }
      >
        {!awake && (
          <div className="space-y-2 text-sm text-[#c2c5d4]">
            <p className="m-0">Wake the Medium, then point at anything on the sample page.</p>
            <ul className="m-0 list-disc space-y-1 pl-5 text-xs text-[#9da1b6]">
              <li>See the margin, border, padding, and size, drawn right on the page.</li>
              <li>Check whether its text is readable against what is behind it.</li>
              <li>Possess it for a moment. Every change can be undone.</li>
            </ul>
          </div>
        )}

        {awake && !description && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[#3a3047] p-4 text-sm text-[#c2c5d4]">
            <span>Point at the sample page, or start from the top with the keyboard.</span>
            <Button size="sm" variant="secondary" onClick={() => picker.pick(stage?.firstElementChild ?? null)}>
              Pin the first element
            </Button>
          </div>
        )}

        {awake && description && contrast && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-[#1c1925] px-2 py-1 font-mono text-sm text-[#ece2cc]">{description.label}</code>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${
                  picker.picked ? 'border-[#8b5cf6]/60 text-[#d6c8ff]' : 'border-[#3a3047] text-[#9da1b6]'
                }`}
              >
                {picker.picked ? 'Pinned' : 'Following the pointer'}
              </span>
              <span className="ml-auto">
                <ContrastBadge {...contrast} />
              </span>
            </div>

            {picker.picked && (
              <div role="group" aria-label="Move through the page" className="flex flex-wrap gap-1.5">
                {(Object.keys(MOVE_LABELS) as PickerMove[]).map((direction) => (
                  <Button key={direction} size="sm" variant="ghost" aria-label={MOVE_LABELS[direction].label} onClick={() => walk(direction)}>
                    {MOVE_LABELS[direction].text}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => picker.pick(null)}>Let go</Button>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div>
                <SectionTitle>Box</SectionTitle>
                <BoxModelDiagram box={description.box} content={description.rects.content} />
              </div>
              <div>
                <SectionTitle>Details</SectionTitle>
                <dl className="m-0">
                  <Detail term="Size">{formatSize(description.rects.border.width, description.rects.border.height)}</Detail>
                  <Detail term="Display">{description.display}</Detail>
                  <Detail term="Position">{description.position || 'static'}</Detail>
                  <Detail term="Font">
                    {description.font.family || 'inherited'} · {Math.round(description.font.sizePx)}px · {description.font.weight}
                  </Detail>
                  <Detail term="Selector">{description.selector}</Detail>
                </dl>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => void copySelector()}>
                    {copied ? 'Copied' : 'Copy selector'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle>Readability</SectionTitle>
              <div className="flex flex-wrap items-center gap-2">
                <ColorSwatch color={contrast.foreground} detail="text" description="text color" />
                <span aria-hidden="true" className="text-xs text-[#9da1b6]">on</span>
                <ColorSwatch color={contrast.background.color} detail="behind" description="background behind the text" />
              </div>
              <p className="mb-0 mt-2 text-xs text-[#9da1b6]">
                {contrast.rating === 'fail'
                  ? `Hard to read. Text this size needs at least ${contrast.large ? '3' : '4.5'} to 1.`
                  : contrast.rating === 'AA'
                    ? 'Readable for most people.'
                    : 'Easy to read, even in poor light.'}{' '}
                {describeDoubts(contrast.background.doubts)}
              </p>
            </div>

            <div>
              <SectionTitle>Possess</SectionTitle>
              {picker.picked ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button size="sm" variant="danger" onClick={possess}>Possess the words</Button>
                  <Button size="sm" variant="secondary" onClick={() => edit('Bled into it', (element) => journal.setStyle(element, 'color', grimoireShades.freshBlood))}>
                    Bleed
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => edit('Faded it', (element) => journal.setStyle(element, 'opacity', FADED_OPACITY))}>
                    Fade
                  </Button>
                  <span className="mx-1 h-6 w-px bg-[#3a3047]" aria-hidden="true" />
                  <Button size="sm" variant="ghost" disabled={steps.length === 0} onClick={undo}>
                    Undo{steps.length ? ` (${steps.length})` : ''}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={steps.length === 0} onClick={undoAll}>
                    Undo all
                  </Button>
                </div>
              ) : (
                <p className="m-0 text-xs text-[#9da1b6]">Pin an element to possess it.</p>
              )}
            </div>
          </div>
        )}

        {awake && palette.length > 0 && (
          <div className={description ? 'mt-6 border-t border-[#2a2433] pt-5' : 'mt-5'}>
            <SectionTitle>Colors on this page</SectionTitle>
            <div role="group" aria-label="Colors on this page. Choose one to outline where it is used." className="flex flex-wrap gap-1.5">
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
          </div>
        )}
      </RiteShell>

      {awake && (
        <RiteLayer>
          {chosenColor?.elements.map((element, index) => (
            <MatchOutline key={`${chosenColor.key}-${index}`} element={element} color={grimoireAccents.candle} />
          ))}
          {pinned.description && <RiteHighlight rects={pinned.description.rects} />}
          {hover.description && <RiteHighlight rects={hover.description.rects} variant="outline" outlineColor={inspectorColors.content} />}
          {description && (
            <RiteLabel anchor={description.rects.border}>
              <span className="font-semibold text-[#d6c8ff]">{description.label}</span>
              <span className="ml-2 text-[#9da1b6]">{formatSize(description.rects.border.width, description.rects.border.height)}</span>
            </RiteLabel>
          )}
        </RiteLayer>
      )}
    </div>
  );
}

const codeSnippet = `import {
  RiteShell, RiteLayer, RiteHighlight, RiteLabel, BoxModelDiagram, ContrastBadge,
  defineCapability, useRite, useElementPicker, useElementBox, textContrast,
} from 'groove-ui/grimoire';

// 1. Say what the rite needs from the browser.
const inspection = defineCapability({
  id: 'medium',
  label: 'Element inspection',
  detect: () => typeof document.elementsFromPoint === 'function',
});

function Medium({ stageRef }) {
  // 2. A safe start and stop, with plain-language errors.
  const medium = useRite(inspection, { start: () => true });

  // 3. Point at elements and pin one, with a mouse or the keyboard.
  const picker = useElementPicker({ root: stageRef, enabled: medium.status === 'active' });
  const { description } = useElementBox(picker.picked ?? picker.hovered);

  return (
    <>
      <RiteShell name="Medium" sigil="eye" accent="witchfire" rite={medium}>
        {description && (
          <>
            <ContrastBadge {...textContrast(description.element)} />
            <BoxModelDiagram box={description.box} content={description.rects.content} />
          </>
        )}
      </RiteShell>

      {/* 4. Draw over the page without getting in the way. */}
      {description && (
        <RiteLayer>
          <RiteHighlight rects={description.rects} />
          <RiteLabel anchor={description.rects.border}>{description.label}</RiteLabel>
        </RiteLayer>
      )}
    </>
  );
}`;

export function GrimoireDoc() {
  return (
    <ComponentDocPage
      title="Grimoire"
      category="The Grimoire"
      description="Your browser can already inspect pages, read colors, store things, talk between tabs, and much more. Grimoire turns those powers into small, haunted tools you can drop into any page. Each one waits until it is asked, explains itself when it cannot work, and can always be undone. Try the Medium below: it sees through anything on the sample page."
      packageName="grimoire"
      preview={<MediumDemo />}
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'RiteShell', type: 'component', default: '—', description: 'The frame every rite lives in: name, mark, status, start and stop, errors, and your content' },
        { name: 'useRite(capability, { start, stop })', type: 'hook', default: '—', description: 'Starts and stops one browser power safely. Explains in plain words when it is blocked or unavailable' },
        { name: 'defineCapability({ id, label, detect })', type: 'function', default: '—', description: 'Says what a rite needs. Checked once, safely, even during server rendering' },
        { name: 'useElementPicker({ root, enabled })', type: 'hook', default: '—', description: 'Point at and pin elements. Clicks pick instead of acting, Escape lets go, and move() walks the page by keyboard' },
        { name: 'useElementBox(element)', type: 'hook', default: '—', description: 'An element’s box, font, and colors, kept up to date as it scrolls and resizes' },
        { name: 'RiteLayer · RiteHighlight · RiteLabel', type: 'components', default: '—', description: 'Draw over the page. Clicks pass through, and labels move so they never cover what they describe' },
        { name: 'BoxModelDiagram · ColorSwatch · ContrastBadge', type: 'components', default: '—', description: 'The pieces rites share for showing sizes, colors, and readability' },
        { name: 'textContrast · collectColors · parseColor', type: 'functions', default: '—', description: 'Read real colors in any CSS format, find what is behind text, and rate it against WCAG' },
        { name: 'createDomJournal()', type: 'function', default: '—', description: 'Change the page in ways that can always be undone, one step or all at once' },
        { name: 'accent', type: "'witchfire' | 'ectoplasm' | 'blood' | 'candle' | 'moonlight' | 'soulfire' | 'ember' | 'bone'", default: "'witchfire'", description: 'The color a rite is lit by' },
      ]}
      prevPage={{ title: 'Voice', path: '/docs/components/voice' }}
      nextPage={{ title: 'Button', path: '/docs/components/button' }}
    />
  );
}
