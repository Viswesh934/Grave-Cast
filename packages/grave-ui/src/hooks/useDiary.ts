/**
 * useDiary - The diary's memory and the state of one exchange
 * @module hooks/useDiary
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  answerDiaryEntry,
  DIARY_PICK_FROM_DEFAULT,
  fillDiaryText,
  nextDiaryEntry,
  orderDiaryEntries,
  shuffleDiaryOrder,
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

/** What the diary tells onAnswer after each answer. */
export interface DiaryAnswerEvent {
  /** The entry that was answered. */
  entry: DiaryEntry;
  /** What was written, trimmed and cut to DIARY_ANSWER_LIMIT. For a choice, the option's label. */
  answer: string;
  /** Whether it was a wrong riddle answer. Only riddles can be wrong. */
  wrong: boolean;
}

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
  /**
   * Choose each entry at random from the next this many it may ask, so every
   * visit goes a little differently while still moving from the start of the list
   * to the end. 1 asks strictly in order.
   * @default 1
   */
  pickFrom?: number;
  /**
   * Ask in a new random order each session, and again after every full round,
   * instead of the order of entries. Entries with \when\ still wait for the
   * answer they need, and entries marked \last\ still come last.
   * @default false
   */
  shuffle?: boolean;
  /** Called after each answer, once the diary has judged it. A right riddle answer has entry.kind === 'riddle' and wrong false. */
  onAnswer?: (event: DiaryAnswerEvent) => void;
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
  /** The shuffled order of entry ids for this session, when \shuffle\ is on. */
  order: string[];
}

const EMPTY: Saved = { seen: [], memory: {}, wrongCount: 0, order: [] };

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []);

const read = (storageKey: string | undefined): Saved => {
  if (!storageKey || typeof sessionStorage === 'undefined') return EMPTY;
  try {
    const data: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
    if (!data || typeof data !== 'object') return EMPTY;
    const { seen, memory, wrongCount, order } = data as Partial<Saved>;
    return {
      seen: strings(seen),
      order: strings(order),
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
export const useDiary = ({
  entries,
  wrongReplies = [],
  storageKey,
  cycle = true,
  pickFrom = DIARY_PICK_FROM_DEFAULT,
  shuffle = false,
  onAnswer,
}: DiaryOptions): DiaryReturn => {
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;
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
    // A shuffled session keeps one order until the round is over.
    let order = shuffle && current.order.length > 0 ? current.order : shuffle ? shuffleDiaryOrder(entries) : [];
    let list = shuffle ? orderDiaryEntries(entries, order) : entries;
    let next = nextDiaryEntry(list, seen, current.memory, pickFrom);
    if (!next && cycle && seen.length > 0) {
      // A new round: ask again, but not the entry it just asked. A shuffled diary also gets a fresh order.
      const last = seen[seen.length - 1];
      if (shuffle) {
        order = shuffleDiaryOrder(entries);
        list = orderDiaryEntries(entries, order);
      }
      seen = [last];
      next = nextDiaryEntry(list, seen, current.memory, pickFrom) ?? nextDiaryEntry(list, [], current.memory, pickFrom);
      seen = [];
    }
    setEntry(next);
    setReply(null);
    setWrong(false);
    setStage(next ? 'asking' : 'silent');
    if (next) {
      const updated = { ...current, seen: [...seen, next.id], order };
      savedRef.current = updated;
      setSaved(updated);
    }
  }, [entries, cycle, pickFrom, shuffle]);

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
      onAnswerRef.current?.({ entry, answer: given, wrong: outcome.wrong });
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
