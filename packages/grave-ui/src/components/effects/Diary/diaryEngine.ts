/**
 * The diary's mind: entry types, answer matching, memory conditions, and
 * templates. Pure data and functions, so any set of riddles can be plugged in.
 * @module components/effects/Diary/diaryEngine
 */

/** What the diary remembers from earlier answers, by key. */
export type DiaryMemory = Readonly<Record<string, string>>;

/** Show an entry only when memory matches. All given fields must hold. */
export interface DiaryCondition {
  key: string;
  /** The remembered value must equal this (compared without case). */
  equals?: string;
  /** The remembered value must not equal this. */
  notEquals?: string;
}

interface DiaryEntryBase {
  id: string;
  /** What the diary writes. `{key}` is replaced with a remembered answer. */
  text: string;
  /** Only ask this once memory matches. */
  when?: DiaryCondition;
  /** Hold this back until nothing else is left to ask, such as a closing message. Matters when `pickFrom` is above 1. */
  last?: boolean;
}

/** A riddle with accepted answers. */
export interface DiaryRiddle extends DiaryEntryBase {
  kind: 'riddle';
  /** Accepted answers. Case, punctuation, and words like "a", "the", "your" are ignored. */
  answers: readonly string[];
  /** The reply to a right answer. `{answer}` is what they wrote. */
  right: string;
  /** The reply to a wrong answer. Leave out to use the diary's general wrong replies. */
  wrong?: string;
}

/** A question with no right answer. Whatever is written gets the reply. */
export interface DiaryOpen extends DiaryEntryBase {
  kind: 'open';
  reply: string;
  /** Remember the answer under this key, for later entries. */
  remember?: string;
  /** `numeric` shows a number keyboard and only accepts numbers. @default 'text' */
  input?: 'text' | 'numeric';
}

/** A choice between written options. */
export interface DiaryChoice extends DiaryEntryBase {
  kind: 'choice';
  options: readonly { label: string; reply: string }[];
  /** Remember the chosen label under this key. */
  remember?: string;
}

/** Something the diary says that expects no answer. */
export interface DiaryMessage extends DiaryEntryBase {
  kind: 'message';
}

export type DiaryEntry = DiaryRiddle | DiaryOpen | DiaryChoice | DiaryMessage;

/** Words dropped before comparing answers, so "your shadow" matches "shadow". */
const FILLER = new Set(['a', 'an', 'the', 'your', 'my', 'its', 'it', 'is', 'just']);

/** Reduces an answer to its plain words: lower case, no punctuation, no filler words. */
export const normalizeAnswer = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word !== '' && !FILLER.has(word))
    .join(' ');

/** Whether an answer matches one of a riddle's accepted answers. */
export const isRightAnswer = (riddle: DiaryRiddle, answer: string): boolean => {
  const given = normalizeAnswer(answer);
  if (given === '') return false;
  return riddle.answers.some((accepted) => {
    const target = normalizeAnswer(accepted);
    return given === target || given === `${target}s` || `${given}s` === target;
  });
};

/** Whether memory allows an entry to be asked. */
export const meetsCondition = (condition: DiaryCondition | undefined, memory: DiaryMemory): boolean => {
  if (!condition) return true;
  const value = memory[condition.key];
  if (value === undefined) return false;
  const same = (other: string) => value.toLowerCase() === other.toLowerCase();
  if (condition.equals !== undefined && !same(condition.equals)) return false;
  if (condition.notEquals !== undefined && same(condition.notEquals)) return false;
  return true;
};

/** Fills `{key}` from memory and `{answer}` from the latest answer. Unknown keys are left out. */
export const fillDiaryText = (text: string, memory: DiaryMemory, answer = ''): string =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => (key === 'answer' ? answer : memory[key] ?? ''));

/** By default the diary asks in order: the next entry is always the first one it may ask. */
export const DIARY_PICK_FROM_DEFAULT = 1;

/**
 * The entries the diary may ask next, in order: not yet asked, allowed by memory,
 * at most `limit`. Entries marked `last` only count once nothing else is left.
 */
export const diaryCandidates = (
  entries: readonly DiaryEntry[],
  seen: readonly string[],
  memory: DiaryMemory,
  limit: number = DIARY_PICK_FROM_DEFAULT
): DiaryEntry[] => {
  const open = entries.filter((entry) => !seen.includes(entry.id) && meetsCondition(entry.when, memory));
  const rest = open.filter((entry) => !entry.last);
  return (rest.length > 0 ? rest : open).slice(0, Math.max(1, Math.floor(limit)));
};

/**
 * The next entry to ask, or `null` when there are none. With `pickFrom` above 1,
 * it is chosen at random from the next `pickFrom` candidates, so the order
 * changes from visit to visit but still moves through the list from start to end.
 * An entry is never overtaken by more than `pickFrom - 1` later ones: then it is
 * asked next, so nothing drifts far from its place.
 */
export const nextDiaryEntry = (
  entries: readonly DiaryEntry[],
  seen: readonly string[],
  memory: DiaryMemory,
  pickFrom: number = DIARY_PICK_FROM_DEFAULT,
  random: () => number = Math.random
): DiaryEntry | null => {
  const candidates = diaryCandidates(entries, seen, memory, pickFrom);
  if (candidates.length === 0) return null;
  const [first] = candidates;
  const place = entries.indexOf(first);
  const overtaken = seen.filter((id) => entries.findIndex((entry) => entry.id === id) > place).length;
  if (overtaken >= candidates.length - 1) return first;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[index];
};

/** A shuffled copy of the entries' ids (Fisher–Yates), for a diary that asks in a new order each session. */
export const shuffleDiaryOrder = (entries: readonly DiaryEntry[], random: () => number = Math.random): string[] => {
  const ids = entries.map((entry) => entry.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
};

/**
 * The entries in a saved order. Ids that are no longer in `entries` are dropped,
 * and entries missing from `order` (added since it was made) go at the end.
 */
export const orderDiaryEntries = (entries: readonly DiaryEntry[], order: readonly string[]): DiaryEntry[] => {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const ordered = order.map((id) => byId.get(id)).filter((entry): entry is DiaryEntry => entry !== undefined);
  const placed = new Set(ordered.map((entry) => entry.id));
  return [...ordered, ...entries.filter((entry) => !placed.has(entry.id))];
};

/** What the diary replies, and what it now remembers. */
export interface DiaryOutcome {
  reply: string;
  /** Whether the answer was wrong. Only riddles can be wrong. */
  wrong: boolean;
  memory: DiaryMemory;
}

/**
 * Works out the reply to an answer. For a choice, `answer` is the chosen
 * option's label. Wrong riddle answers use the riddle's own reply, or one of
 * `wrongReplies` in turn.
 */
export const answerDiaryEntry = (
  entry: DiaryEntry,
  answer: string,
  memory: DiaryMemory,
  wrongReplies: readonly string[] = [],
  wrongCount = 0
): DiaryOutcome => {
  const remembered = (key: string | undefined, value: string): DiaryMemory => (key ? { ...memory, [key]: value } : memory);
  switch (entry.kind) {
    case 'riddle': {
      if (isRightAnswer(entry, answer)) return { reply: fillDiaryText(entry.right, memory, answer), wrong: false, memory };
      const fallback = wrongReplies.length > 0 ? wrongReplies[wrongCount % wrongReplies.length] : '';
      return { reply: fillDiaryText(entry.wrong ?? fallback, memory, answer), wrong: true, memory };
    }
    case 'open': {
      const next = remembered(entry.remember, answer);
      return { reply: fillDiaryText(entry.reply, next, answer), wrong: false, memory: next };
    }
    case 'choice': {
      const option = entry.options.find((item) => item.label === answer);
      const next = remembered(entry.remember, answer);
      return { reply: fillDiaryText(option?.reply ?? '', next, answer), wrong: false, memory: next };
    }
    case 'message':
      return { reply: '', wrong: false, memory };
  }
};
