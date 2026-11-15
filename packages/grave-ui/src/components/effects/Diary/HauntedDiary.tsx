/**
 * HauntedDiary: a diary that writes back. It asks riddles, judges answers,
 * remembers them, and vanishes when it is done with you.
 * @module components/effects/Diary/HauntedDiary
 */
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { useSpookyAudio, type SpookySound } from '../../../audio';
import { useDiary } from '../../../hooks/useDiary';
import { useHauntedTyping } from '../../../hooks/useHauntedTyping';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useTypewriter } from '../../../hooks/useTypewriter';
import { srOnlyStyle } from '../../../tokens';
import { Button } from '../../primitives';
import type { DiaryEntry } from './diaryEngine';
import { diaryTokens as t } from './tokens';

/** Class names used by the diary's stylesheet. */
export const DIARY_CLASS = {
  backdrop: 'grave-diary__backdrop',
  book: 'grave-diary__book',
  vanishing: 'grave-diary--vanishing',
  mark: 'grave-diary__mark',
  sink: 'grave-diary__sink',
} as const;

const styles = `
@keyframes grave-diary-awaken { from { opacity: 0; transform: translateY(${t.awakenRise}) scale(${t.awakenScale}); filter: blur(${t.awakenBlur}); } }
@keyframes grave-diary-fade-in { from { opacity: 0; } }
@keyframes grave-diary-vanish { to { opacity: 0; transform: scale(${t.vanishScale}); filter: blur(${t.vanishBlur}); } }
@keyframes grave-diary-fade-out { to { opacity: 0; } }
@keyframes grave-diary-mark { 50% { opacity: ${t.markDim}; } }
@keyframes grave-diary-sink { to { opacity: ${t.sinkOpacity}; filter: blur(${t.sinkBlur}); } }
.${DIARY_CLASS.backdrop} { animation: grave-diary-fade-in ${t.awakenMs}ms ease-out both; }
.${DIARY_CLASS.book} { animation: grave-diary-awaken ${t.awakenMs}ms ease-out both; }
.${DIARY_CLASS.vanishing}.${DIARY_CLASS.backdrop} { animation: grave-diary-fade-out ${t.vanishMs}ms ease-in forwards; }
.${DIARY_CLASS.vanishing} .${DIARY_CLASS.book} { animation: grave-diary-vanish ${t.vanishMs}ms ease-in forwards; }
.${DIARY_CLASS.mark} { animation: grave-diary-mark ${t.markPulseMs}ms ease-in-out infinite; }
.${DIARY_CLASS.sink} { animation: grave-diary-sink ${t.sinkMs}ms ease-in forwards; }
@media (prefers-reduced-motion: reduce) {
  .${DIARY_CLASS.backdrop}, .${DIARY_CLASS.book}, .${DIARY_CLASS.mark}, .${DIARY_CLASS.sink} { animation: none; }
}
`;

/** The sounds the diary makes. `null` keeps one quiet. */
export interface DiarySounds {
  awaken?: SpookySound | null;
  reply?: SpookySound | null;
  wrong?: SpookySound | null;
  vanish?: SpookySound | null;
}

const DEFAULT_SOUNDS: Required<DiarySounds> = {
  awaken: 'whisper',
  reply: 'hoverWhisper',
  wrong: 'hollowDenied',
  vanish: 'hoverWhisper',
};

export interface HauntedDiaryProps {
  /** Opens the diary. Turning it off makes the book vanish, then calls `onVanished`. */
  open: boolean;
  /** Everything it may write, in the order it tries them. */
  entries: readonly DiaryEntry[];
  /** Replies to wrong riddle answers, used in turn. */
  wrongReplies?: readonly string[];
  /** What it writes once it has nothing left to ask. */
  silentText?: string;
  /** Keep its memory for the browser session under this key. */
  storageKey?: string;
  /** Called when an exchange is over: a reply or a message has been written. */
  onSettled?: () => void;
  /** Called when the person asks to close it (the close button or Escape). */
  onRequestClose?: () => void;
  /** Called once the book has vanished. */
  onVanished?: () => void;
  /** @default 'The diary' */
  title?: string;
  /** The small status beside the title. @default 'Entity awake' */
  status?: string;
  /** The label of the writing field. @default 'Whisper to the diary' */
  inputLabel?: string;
  /** @default 'Whisper' */
  submitLabel?: string;
  /** The close button's accessible name. It shows as an ×. @default 'Close the diary' */
  closeLabel?: string;
  /** Play eerie notes while the person writes (only once sound is on). @default true */
  hauntedTyping?: boolean;
  sounds?: DiarySounds;
  className?: string;
  style?: CSSProperties;
}

const css = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: t.zIndex,
    display: 'grid',
    placeItems: 'center',
    padding: t.gap,
    background: t.backdrop,
  },
  cover: {
    width: `min(100%, ${t.width})`,
    padding: t.coverPadding,
    background: t.cover,
    border: `${t.borderWidth} solid ${t.coverEdge}`,
    borderRadius: t.radius,
  },
  page: {
    display: 'grid',
    gap: t.gap,
    padding: t.padding,
    background: `repeating-linear-gradient(to bottom, transparent 0, transparent calc(${t.ruleGap} - ${t.borderWidth}), ${t.rule} calc(${t.ruleGap} - ${t.borderWidth}), ${t.rule} ${t.ruleGap}), ${t.page}`,
    borderRadius: t.radius,
    color: t.ink,
    fontFamily: t.font,
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.gap },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: t.labelGap,
    margin: 0,
    fontFamily: t.labelFont,
    fontSize: t.labelSize,
    fontWeight: 'normal',
    letterSpacing: t.labelTracking,
    textTransform: 'uppercase',
    color: t.label,
  },
  mark: { width: t.markSize, height: t.markSize, borderRadius: '50%', background: t.accent },
  text: { margin: 0, fontSize: t.textSize, lineHeight: t.lineHeight, fontStyle: 'italic' },
  yours: { margin: 0, fontSize: t.textSize, lineHeight: t.lineHeight, color: t.inkYours },
  form: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: t.gap },
  field: { display: 'grid', gap: t.fieldGap, flex: `1 1 ${t.fieldMinWidth}`, minWidth: 0 },
  fieldLabel: { fontFamily: t.labelFont, fontSize: t.labelSize, letterSpacing: t.fieldTracking, color: t.label },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: t.fieldPadding,
    background: 'transparent',
    border: 'none',
    borderBottom: `${t.borderWidth} solid ${t.coverEdge}`,
    color: t.ink,
    fontFamily: t.font,
    fontSize: t.textSize,
    outlineOffset: t.focusOffset,
  },
  choices: { display: 'flex', flexWrap: 'wrap', gap: t.choiceGap },
} satisfies Record<string, CSSProperties>;

/** Everything Tab can reach inside the book. */
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href]';

/** Shows the typed part, and keeps the rest's space so the page doesn't jump. */
const Ink = ({ text, count }: { text: string; count: number }) => (
  <>
    <span>{text.slice(0, count)}</span>
    <span aria-hidden="true" style={{ visibility: 'hidden' }}>
      {text.slice(count)}
    </span>
  </>
);

/**
 * A diary that writes back, like an old cursed book. It asks one entry each
 * time it opens: a riddle, a choice, an open question, or a message that needs
 * no answer. It replies as if it knows something you don't, remembers what you
 * write, and later entries can use it.
 *
 * Pair it with work in progress: open it when the work starts, close it once
 * the work is done and `onSettled` has fired, and show the result on
 * `onVanished`. It never traps anyone: the close button and Escape always work.
 *
 * @example
 * ```tsx
 * <HauntedDiary open={busy} entries={RIDDLES} storageKey="diary" onSettled={() => setSettled(true)} onVanished={showResult} />
 * ```
 */
export const HauntedDiary = ({
  open,
  entries,
  wrongReplies,
  silentText = 'There is nothing left to ask. I already know enough.',
  storageKey,
  onSettled,
  onRequestClose,
  onVanished,
  title = 'The diary',
  status = '',
  inputLabel = 'Whisper to the diary',
  submitLabel = 'Whisper',
  closeLabel = 'Close the diary',
  hauntedTyping = true,
  sounds,
  className,
  style,
}: HauntedDiaryProps) => {
  const diary = useDiary({ entries, wrongReplies, storageKey });
  const { playSound } = useSpookyAudio();
  const lessMotion = useReducedMotion();
  const animate = !lessMotion;
  const sound = { ...DEFAULT_SOUNDS, ...sounds };

  const [mounted, setMounted] = useState(open);
  const [vanishing, setVanishing] = useState(false);
  const [draft, setDraft] = useState('');
  const [given, setGiven] = useState('');
  const [writing, setWriting] = useState(false);
  const titleId = useId();
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const settledRef = useRef<string | null>(null);
  const awakeRef = useRef(false);
  const lingerRef = useRef<number | null>(null);
  const callbacks = useRef({ onSettled, onVanished, onRequestClose });
  callbacks.current = { onSettled, onVanished, onRequestClose };

  // Open: wake the diary and write its next entry. Only on opening; the diary's own state drives the rest.
  useEffect(() => {
    // Once per opening: development mode runs effects twice.
    if (!open || awakeRef.current) return;
    awakeRef.current = true;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMounted(true);
    setVanishing(false);
    setDraft('');
    setGiven('');
    settledRef.current = null;
    diary.awaken();
    if (sound.awaken) playSound(sound.awaken);
  }, [open]);

  // Close: let the book vanish, then step aside.
  useEffect(() => {
    if (open || !mounted) return undefined;
    setVanishing(true);
    if (sound.vanish) playSound(sound.vanish);
    const timer = window.setTimeout(() => {
      awakeRef.current = false;
      setMounted(false);
      setVanishing(false);
      returnFocusRef.current?.focus?.();
      callbacks.current.onVanished?.();
    }, animate ? t.vanishMs : 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(
    () => () => {
      if (lingerRef.current !== null) window.clearTimeout(lingerRef.current);
    },
    []
  );

  const exchangeKey = `${diary.entry?.id ?? 'silent'}:${diary.stage}`;
  const settle = useCallback(() => {
    if (settledRef.current === exchangeKey) return;
    settledRef.current = exchangeKey;
    lingerRef.current = window.setTimeout(() => callbacks.current.onSettled?.(), animate ? t.lingerMs : 0);
  }, [exchangeKey, animate]);

  const silent = diary.stage === 'silent';
  const asked = silent ? silentText : diary.text;
  const isMessage = silent || diary.entry?.kind === 'message';
  const replying = diary.stage === 'replying';

  const question = useTypewriter(asked.length, {
    charsPerSecond: t.charsPerSecond,
    enabled: animate && mounted,
    restartKey: diary.entry?.id ?? 'silent',
    onDone: () => {
      if (isMessage) settle();
    },
  });
  const reply = diary.reply ?? '';
  const answered = useTypewriter(reply.length, {
    charsPerSecond: t.charsPerSecond,
    enabled: animate && replying,
    restartKey: exchangeKey,
    onDone: () => {
      if (replying) settle();
    },
  });

  // Without animation there is no typing to wait for.
  useEffect(() => {
    if (!mounted || animate) return;
    if (replying || isMessage) settle();
  }, [mounted, animate, replying, isMessage, settle]);

  const questionDone = question.count >= asked.length;
  const canAnswer = mounted && !vanishing && questionDone && diary.stage === 'asking' && !isMessage;

  // Each letter written into the diary answers with a note, once sound is on.
  useHauntedTyping(hauntedTyping && writing && canAnswer);

  // Focus: the book when it opens, the writing field once the question is written.
  useEffect(() => {
    if (!mounted || vanishing) return;
    if (canAnswer) inputRef.current?.focus();
    else bookRef.current?.focus();
  }, [mounted, vanishing, canAnswer]);

  // Sound for the reply, once it is known whether the answer was wrong.
  useEffect(() => {
    if (!replying) return;
    const cue = diary.wrong ? sound.wrong : sound.reply;
    if (cue) playSound(cue);
  }, [replying, diary.wrong]);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!canAnswer || trimmed === '') return;
    if (diary.entry?.kind === 'open' && diary.entry.input === 'numeric' && !/^\d+$/.test(trimmed)) return;
    setGiven(trimmed);
    diary.answer(trimmed);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      callbacks.current.onRequestClose?.();
      return;
    }
    if (event.key !== 'Tab' || !bookRef.current) return;
    // Keep Tab inside the book while it is open.
    const items = Array.from(bookRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === bookRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!mounted) return null;

  const entry = diary.entry;
  const numeric = entry?.kind === 'open' && entry.input === 'numeric';
  const draftReady = draft.trim() !== '' && (!numeric || /^\d+$/.test(draft.trim()));
  const spoken = [asked, given, replying ? reply : ''].filter(Boolean).join(' ');

  return (
    <div
      className={[DIARY_CLASS.backdrop, vanishing ? DIARY_CLASS.vanishing : null, className].filter(Boolean).join(' ')}
      style={{ ...css.backdrop, ...style }}
      onKeyDown={onKeyDown}
    >
      <style>{styles}</style>
      <div
        ref={bookRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={DIARY_CLASS.book}
        style={css.cover}
      >
        <div style={css.page}>
          <div style={css.header}>
            <h2 id={titleId} style={css.label}>
              <span>{title}</span>
              <span aria-hidden="true">·</span>
              <span className={DIARY_CLASS.mark} aria-hidden="true" style={css.mark} />
              <span>{status}</span>
            </h2>
            <Button variant="gothic" size="sm" aria-label={closeLabel} title={closeLabel} onClick={() => callbacks.current.onRequestClose?.()}>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                width={t.closeIconSize}
                height={t.closeIconSize}
                fill="none"
                stroke="currentColor"
                strokeWidth={t.closeIconStroke}
                strokeLinecap="round"
              >
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </Button>
          </div>

          <p aria-live="polite" style={srOnlyStyle}>
            {spoken}
          </p>

          <p aria-hidden="true" style={css.text}>
            <Ink text={asked} count={question.count} />
          </p>

          {entry && !isMessage && diary.stage === 'asking' && (
            <div style={{ visibility: questionDone ? 'visible' : 'hidden' }}>
              {entry.kind === 'choice' ? (
                <div role="group" aria-label={inputLabel} style={css.choices}>
                  {entry.options.map((option) => (
                    <Button key={option.label} variant="gothic" size="md" disabled={!canAnswer} onClick={() => submit(option.label)}>
                      {option.label}
                    </Button>
                  ))}
                </div>
              ) : (
                <form
                  style={css.form}
                  onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    submit(draft);
                  }}
                >
                  <div style={css.field}>
                    <label htmlFor={fieldId} style={css.fieldLabel}>
                      {inputLabel}
                    </label>
                    <input
                      ref={inputRef}
                      id={fieldId}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onFocus={() => setWriting(true)}
                      onBlur={() => setWriting(false)}
                      inputMode={numeric ? 'numeric' : 'text'}
                      pattern={numeric ? '[0-9]*' : undefined}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={!canAnswer}
                      style={css.input}
                    />
                  </div>
                  <Button type="submit" variant="gothic" size="md" disabled={!canAnswer || !draftReady}>
                    {submitLabel}
                  </Button>
                </form>
              )}
            </div>
          )}

          {replying && (
            <>
              <p aria-hidden="true" className={DIARY_CLASS.sink} style={css.yours}>
                {given}
              </p>
              <p aria-hidden="true" style={css.text}>
                <Ink text={reply} count={answered.count} />
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
