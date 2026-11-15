/**
 * Diary: a cursed book that writes back.
 * @module components/effects/Diary
 */
export { HauntedDiary, DIARY_CLASS, type HauntedDiaryProps, type DiarySounds } from './HauntedDiary';
export {
  normalizeAnswer,
  isRightAnswer,
  meetsCondition,
  fillDiaryText,
  nextDiaryEntry,
  answerDiaryEntry,
  type DiaryEntry,
  type DiaryRiddle,
  type DiaryOpen,
  type DiaryChoice,
  type DiaryMessage,
  type DiaryCondition,
  type DiaryMemory,
  type DiaryOutcome,
} from './diaryEngine';
export { diaryTokens } from './tokens';
