/**
 * Backwards - a typing game where each line is typed with its words in reverse order
 * @module components/effects/Backwards/Backwards
 */
import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent } from 'react';
import { ReplayMark } from '../../../assets/svg/base/ReplayMark';
import { useSpookyAudio, type SpookySound } from '../../../audio';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useBestScore } from '../../../hooks/useBestScore';
import { useInterval } from '../../../hooks/useInterval';
import { useLatest } from '../../../hooks/useLatest';
import { GameDialog, GameMessage } from '../GameDialog/GameDialog';
import { gameDialogTokens as d } from '../GameDialog/tokens';
import {
  accuracyPercent,
  markTyping,
  nextBackwardsLine,
  reverseWords,
  rightSoFar,
  backwardsRandom,
  usableLines,
  wordsPerMinute,
  type BackwardsWords,
} from './backwardsEngine';
import { backwardsTokens as t } from './tokens';

/** The sounds the game plays. Any sound from the library can stand in. */
export interface BackwardsSounds {
  /** A line typed right. */
  line: SpookySound;
  /** The round's time is up. */
  end: SpookySound;
}

const DEFAULT_SOUNDS: BackwardsSounds = { line: 'runeChime', end: 'churchBell' };
const MS_PER_SECOND = 1000;

export interface BackwardsProps {
  /** Shows the game. Closing it ends the round in progress. */
  open: boolean;
  /** Called when the person asks to close it: the close button or Escape. */
  onClose: () => void;
  /** Extra lines to type now and then, such as lines from your own app. Punctuation is dropped, and long lines are left out. */
  lines?: readonly string[];
  /** Replace the word lists made-up lines come from. */
  words?: BackwardsWords;
  /** Keep the best speed in this browser under this key. Leave out to forget it when the game closes. */
  storageKey?: string;
  /** @default 'Backwards' */
  title?: string;
  /** The close button's accessible name. It shows as an ×. @default 'Close the game' */
  closeLabel?: string;
  /** Replace any of the game's sounds. Sounds only play once sound is on. */
  sounds?: Partial<BackwardsSounds>;
  className?: string;
  style?: CSSProperties;
}

type Phase = 'ready' | 'running' | 'over';

/** The typing field and the coloured copy of what was typed must match exactly, so the caret lines up. */
const textStyle: CSSProperties = {
  fontFamily: t.font,
  fontSize: t.typeSize,
  lineHeight: t.lineHeight,
  padding: t.fieldPadding,
  margin: 0,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  boxSizing: 'border-box',
};

const css = {
  intro: { margin: 0, fontSize: d.textSize, color: d.muted },
  line: { margin: 0, fontFamily: t.font, fontSize: t.lineSize, lineHeight: t.lineHeight, color: t.colors.line },
  field: {
    position: 'relative',
    background: t.fieldBackground,
    border: `${d.borderWidth} solid ${d.panelEdge}`,
    borderRadius: d.radius,
  },
  mirror: { ...textStyle, minHeight: t.fieldMinHeight, color: t.colors.right },
  wrong: { color: t.colors.wrong, textDecoration: t.wrongUnderline, textUnderlineOffset: t.wrongUnderlineOffset },
  input: {
    ...textStyle,
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    resize: 'none',
    overflow: 'hidden',
    background: 'transparent',
    border: 'none',
    color: 'transparent',
    caretColor: t.colors.caret,
  },
} satisfies Record<string, CSSProperties>;

/** The game itself, mounted only while it is open, so every opening starts fresh. */
const BackwardsGame = ({ onClose, lines = [], words, storageKey, title = 'Backwards', closeLabel, sounds, className, style }: Omit<BackwardsProps, 'open'>) => {
  const lineId = useId();
  const random = useRef(backwardsRandom(Date.now()));
  const own = useMemo(() => usableLines(lines), [lines]);
  const input = useRef<HTMLTextAreaElement>(null);
  const again = useRef<HTMLButtonElement>(null);
  const startedAt = useRef(0);
  const counts = useRef({ doneChars: 0, rightKeys: 0, allKeys: 0 });
  const [phase, setPhase] = useState<Phase>('ready');
  const [line, setLine] = useState(() => nextBackwardsLine(random.current, own, '', words));
  const [typed, setTyped] = useState('');
  const [linesDone, setLinesDone] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(t.roundSeconds);
  const [result, setResult] = useState({ wpm: 0, accuracy: 0, record: false });
  const { best, offer } = useBestScore(storageKey);
  const { playSound } = useSpookyAudio();
  const { announce } = useAriaAnnounce();
  const chosen = useLatest({ ...DEFAULT_SOUNDS, ...sounds });
  const answer = useMemo(() => reverseWords(line), [line]);

  const play = (name: keyof BackwardsSounds) => playSound(chosen.current[name], t.volume[name]);

  const finish = () => {
    const { doneChars, rightKeys, allKeys } = counts.current;
    const wpm = wordsPerMinute(doneChars + rightSoFar(answer, typed), t.roundSeconds);
    const accuracy = accuracyPercent(rightKeys, allKeys);
    const { previous, record } = offer(wpm);
    setResult({ wpm, accuracy, record });
    setTimeLeft(0);
    setPhase('over');
    play('end');
    announce(`Time. ${wpm} words a minute, ${accuracy} percent right. ${record ? 'A new best.' : `Best ${previous}.`}`);
  };

  // The clock: it runs from the first key, and the round ends when it reaches zero.
  useInterval(
    () => {
      const left = t.roundSeconds - (performance.now() - startedAt.current) / MS_PER_SECOND;
      if (left <= 0) finish();
      else setTimeLeft(Math.ceil(left));
    },
    phase === 'running' ? t.tickMs : null
  );

  // Typing goes straight into the field when the game opens and after "Play again"; at the end, the button gets the focus.
  useEffect(() => {
    if (phase === 'ready') input.current?.focus();
    if (phase === 'over') again.current?.focus();
  }, [phase]);

  const restart = () => {
    counts.current = { doneChars: 0, rightKeys: 0, allKeys: 0 };
    setLine((previous) => nextBackwardsLine(random.current, own, previous, words));
    setTyped('');
    setLinesDone(0);
    setTimeLeft(t.roundSeconds);
    setPhase('ready');
  };

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (phase === 'over') return;
    const value = event.target.value.replace(/\n/g, '');
    if (phase === 'ready' && value !== '') {
      startedAt.current = performance.now();
      setPhase('running');
    }
    // Each new letter counts once, right or wrong, for the accuracy.
    for (let i = typed.length; i < value.length; i++) {
      counts.current.allKeys += 1;
      if (value[i] === answer[i]) counts.current.rightKeys += 1;
    }
    if (value === answer) {
      // A space's worth for the gap to the next line, as typing tests count it.
      counts.current.doneChars += answer.length + 1;
      const next = nextBackwardsLine(random.current, own, line, words);
      setLine(next);
      setTyped('');
      setLinesDone((count) => count + 1);
      play('line');
      announce(`Next: ${next}`);
      return;
    }
    setTyped(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // A line is one line: Enter does nothing.
    if (event.key === 'Enter') event.preventDefault();
  };

  const marks = markTyping(answer, typed);

  return (
    <GameDialog
      title={title}
      closeLabel={closeLabel}
      onClose={onClose}
      help="Type the words in reverse order. Close: Esc."
      stats={[
        { label: 'Time', value: timeLeft },
        { label: 'Lines', value: linesDone },
        { label: 'Best', value: `${best} wpm` },
      ]}
      className={className}
      style={style}
    >
      {phase === 'ready' && <p style={css.intro}>Type each line with its words in reverse order. The clock starts at your first key.</p>}
      <p id={lineId} style={css.line}>
        {line}
      </p>
      {phase === 'over' ? (
        <GameMessage
          ref={again}
          text={`Time. ${result.wpm} words a minute, ${result.accuracy}% right. ${result.record ? 'A new best.' : `Best ${best} wpm.`}`}
          action="Play again"
          icon={<ReplayMark size={d.actionIconSize} />}
          onAction={restart}
        />
      ) : (
        <div style={css.field}>
          <div aria-hidden="true" style={css.mirror}>
            {marks.map((mark, i) =>
              mark === 'right' ? (
                <span key={i}>{typed[i]}</span>
              ) : (
                <span key={i} style={css.wrong}>
                  {typed[i] === ' ' ? t.wrongSpaceMark : typed[i]}
                </span>
              )
            )}
          </div>
          <textarea
            ref={input}
            value={typed}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onPaste={(event) => event.preventDefault()}
            aria-label="Your answer"
            aria-describedby={lineId}
            rows={t.fieldRows}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={css.input}
          />
        </div>
      )}
    </GameDialog>
  );
};

/**
 * A typing game with a twist: each line has to be typed with its words in
 * reverse order, so "The raven watches the gate" is typed "gate the watches
 * raven The". Words keep their own spelling and capitals; only their order
 * turns around. A round lasts thirty seconds from the first key, and scores
 * words a minute and the share of keys typed right.
 *
 * Lines are made up from small word lists, so they rarely repeat; `lines` mixes
 * in some of your own. It opens in a GameDialog over the page, the typing field
 * is a real text field for screen readers, and a wrong letter is underlined as
 * well as coloured.
 *
 * @example
 * ```tsx
 * <Backwards open={open} onClose={() => setOpen(false)} storageKey="backwards-best" />
 * ```
 */
export const Backwards = ({ open, ...props }: BackwardsProps) => (open ? <BackwardsGame {...props} /> : null);
