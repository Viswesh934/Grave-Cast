/**
 * useDiary - The diary's memory and the state of one exchange
 * @module hooks/useDiary
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  answerDiaryEntry,
  fillDiaryText,
  nextDiaryEntry,
  type DiaryEntry,
  type DiaryMemory,
} from '../components/effects/Diary/diaryEngine';

/**
 * Where the diary is in an exchange:
 * - `asking`: it has written an entry and waits for an answer (messages need none)
 * - `replying`: it has answered back
 * - `silent`: it has nothing left to ask
 */
export type DiaryStage = 'asking' | 'replying' | 'silent';

/** Answers longer than this are cut short before they are remembered. */
export const DIARY_ANSWER_LIMIT = 200;

export interface DiaryOptions {
  /** Everything the diary may write, in the order it tries them. */
  entries: readonly DiaryEntry[];
  /** Replies to wrong riddle answers, used in turn when a riddle has none of its own. */
  wrongReplies?: readonly string[];
  /** Keep the diary's memory for this browser session under this key. */
  storageKey?: string;
  /**
   * Once every entry has been asked, start a new round instead of falling
   * silent. What it remembers is kept, so entries that use memory stay personal.
   * @default true
   */
  cycle?: boolean;
}

export interface DiaryReturn {
  /** The entry being asked, or `null` before the first one and when silent. */
  entry: DiaryEntry | null;
  /** The entry's words, with memory filled in. */
  text: string;
  /** The diary's answer back, once there is one. */
  reply: string | null;
  /** Whether the last answer was wrong. */
  wrong: boolean;
  stage: DiaryStage;
  /** What it remembers. */
  memory: DiaryMemory;
  /** Writes the next entry. Call this each time the diary opens. */
  awaken: () => void;
  /** Answers the current entry. For a choice, pass the chosen option's label. */
  answer: (value: string) => void;
  /** Forgets everything. */
  forget: () => void;
}

interface Saved {
  seen: string[];
  memory: Record<string, string>;
  wrongCount: number;
}

const EMPTY: Saved = { seen: [], memory: {}, wrongCount: 0 };

const read = (storageKey: string | undefined): Saved => {
  if (!storageKey || typeof sessionStorage === 'undefined') return EMPTY;
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
    if (!data || typeof data !== 'object') return EMPTY;
    const { seen, memory, wrongCount } = data as Partial<Saved>;
    return {
      seen: Array.isArray(seen) ? seen.filter((id): id is string => typeof id === 'string') : [],
      memory:
        memory && typeof memory === 'object'
          ? Object.fromEntries(
              Object.entries(memory)
                .filter((pair): pair is [string, string] => typeof pair[1] === 'string')
                .map(([key, value]) => [key, value.slice(0, DIARY_ANSWER_LIMIT)])
            )
          : {},
      wrongCount: Number.isInteger(wrongCount) && (wrongCount as number) >= 0 ? (wrongCount as number) : 0,
    };
  } catch {
    return EMPTY;
  }
};

/**
 * Runs a diary: picks the next entry it may ask, judges answers, and remembers
 * them so later entries can turn personal. Memory lasts for the browser session
 * when `storageKey` is given.
 *
 * @example
 * ```tsx
 * const diary = useDiary({ entries, storageKey: 'diary' });
 * useEffect(() => { if (open) diary.awaken(); }, [open]);
 * ```
 */
export const useDiary = ({ entries, wrongReplies = [], storageKey, cycle = true }: DiaryOptions): DiaryReturn => {
  const [saved, setSaved] = useState<Saved>(() => read(storageKey));
  const savedRef = useRef(saved);
  savedRef.current = saved;
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  const [stage, setStage] = useState<DiaryStage>('asking');

  useEffect(() => {
    if (!storageKey || typeof sessionStorage === 'undefined') return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(saved));
    } catch {
      // Storage full or blocked: the diary still works, it just forgets on reload.
    }
  }, [storageKey, saved]);

  const awaken = useCallback(() => {
    const current = savedRef.current;
    let seen = current.seen;
    let next = nextDiaryEntry(entries, seen, current.memory);
    if (!next && cycle && seen.length > 0) {
      // A new round: ask again, but not the entry it just asked.
      const last = seen[seen.length - 1];
      seen = [last];
      next = nextDiaryEntry(entries, seen, current.memory) ?? nextDiaryEntry(entries, [], current.memory);
      seen = [];
    }
    setEntry(next);
    setReply(null);
    setWrong(false);
    setStage(next ? 'asking' : 'silent');
    if (next) {
      const updated = { ...current, seen: [...seen, next.id] };
      savedRef.current = updated;
      setSaved(updated);
    }
  }, [entries, cycle]);

  const answer = useCallback(
    (value: string) => {
      if (!entry || stage !== 'asking' || entry.kind === 'message') return;
      const given = value.trim().slice(0, DIARY_ANSWER_LIMIT);
      if (given === '') return;
      const current = savedRef.current;
      const outcome = answerDiaryEntry(entry, given, current.memory, wrongReplies, current.wrongCount);
      const updated = { ...current, memory: { ...outcome.memory }, wrongCount: current.wrongCount + (outcome.wrong ? 1 : 0) };
      savedRef.current = updated;
      setSaved(updated);
      setReply(outcome.reply);
      setWrong(outcome.wrong);
      setStage('replying');
    },
    [entry, stage, wrongReplies]
  );

  const forget = useCallback(() => {
    savedRef.current = EMPTY;
    setSaved(EMPTY);
    setEntry(null);
    setReply(null);
    setWrong(false);
    setStage('asking');
  }, []);

  return {
    entry,
    text: entry ? fillDiaryText(entry.text, saved.memory) : '',
    reply,
    wrong,
    stage,
    memory: saved.memory,
    awaken,
    answer,
    forget,
  };
};
