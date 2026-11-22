import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  HauntedDiary,
  Button,
  useAriaAnnounce,
  type DiaryEntry,
} from 'groove-ui';
import { markGamesFound } from '../../../site/gamesFound';

const SAMPLE_ENTRIES: DiaryEntry[] = [
  {
    id: 'riddle-1',
    kind: 'riddle',
    text: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
    answers: ['echo', 'an echo'],
    right: 'The ink ripples. "You listen well to the hollows."',
    wrong: 'The pages shiver violently. "A hollow guess."',
  },
  {
    id: 'riddle-2',
    kind: 'riddle',
    text: 'The more you take, the more you leave behind. What am I?',
    answers: ['footsteps', 'steps'],
    right: 'A dark smudge forms a smiling skull. "Walk deeper."',
    wrong: 'Cold ash spills between the margins. "Blind footsteps."',
  },
  {
    id: 'open-1',
    kind: 'open',
    text: 'Speak your truest fear into the parchment.',
    reply: 'The ink drinks your fear greedily. It will remember.',
  },
];

const codeSnippet = `import { HauntedDiary, type DiaryEntry } from 'groove-ui';

const entries: DiaryEntry[] = [
  {
    id: 'riddle-gate',
    kind: 'riddle',
    text: 'I speak without a mouth and hear without ears. What am I?',
    answers: ['echo'],
    right: 'The ink ripples. You may pass.',
    wrong: 'The pages shudder in rejection.',
  },
];

export function CryptLibrary() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Consult Diary</button>
      <HauntedDiary
        open={open}
        entries={entries}
        onAnswer={(event) => console.log('Answered:', event)}
        onVanished={() => setOpen(false)}
      />
    </>
  );
}`;

export function DiaryDoc() {
  const [open, setOpen] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const { announce } = useAriaAnnounce();

  return (
    <ComponentDocPage
      title="HauntedDiary"
      category="The Effects"
      description="An interactive paranormal grimoire and riddle solver. Answers written with ink ripple into the page, unlocking easter eggs or darker branching lore."
      packageName="haunted-diary"
      gothicPhilosophy={{
        influence: 'Tom Riddle’s Diary & The Cursed Ledger',
        movement: 'Living Parchment, Ingestion of Text, Vanishing Spells',
      }}
      preview={
        <div className="flex flex-col items-center justify-center p-8 gap-4 text-center">
          <p className="text-sm text-stone-400 font-mono max-w-md">
            Click below to awaken the ledger. Answer its cryptic riddles to appease the spirit bound within.
          </p>
          <Button
            variant="primary"
            onClick={() => setOpen(true)}
            className="px-6 py-3 font-serif text-base"
          >
            Open Haunted Diary
          </Button>

          {answeredCount > 0 && (
            <p className="text-xs font-mono text-emerald-400">
              Riddles answered this session: {answeredCount}
            </p>
          )}

          <HauntedDiary
            open={open}
            entries={SAMPLE_ENTRIES}
            onAnswer={({ entry, wrong }) => {
              setAnsweredCount((c) => c + 1);
              // The easter egg: a right riddle answer reveals the games, here and on the home page.
              if (entry.kind === 'riddle' && !wrong && markGamesFound()) {
                announce('A new section has appeared in the sidebar: Games.');
              }
            }}
            onVanished={() => setOpen(false)}
          />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'open', type: 'boolean', description: 'Whether the diary overlay is awake and visible' },
        { name: 'entries', type: 'readonly DiaryEntry[]', description: 'List of riddles, open prompts, or choice branches for the diary to present' },
        { name: 'wrongReplies', type: 'readonly string[]', default: 'undefined', description: 'Replies to wrong riddle answers, used in turn' },
        { name: 'silentText', type: 'string', default: 'undefined', description: 'What it writes once it has nothing left to ask' },
        { name: 'storageKey', type: 'string', default: 'undefined', description: 'Key used to persist answered riddles and memories in localStorage' },
        { name: 'pickFrom', type: 'number', default: '1', description: 'Choose each entry at random from next N entries' },
        { name: 'sounds', type: 'DiarySounds', description: 'Custom procedural sound handles for awaken, reply, wrong, and vanish' },
        { name: 'onAnswer', type: '(event: DiaryAnswerEvent) => void', description: 'Called each time a riddle or question is answered' },
        { name: 'onSettled', type: '() => void', description: 'Called when a reply or message has finished being written' },
        { name: 'onVanished', type: '() => void', description: 'Triggered after the book dissolves and unmounts' },
      ]}
      prevPage={{ title: 'Doodle', path: '/docs/components/doodle' }}
      nextPage={{ title: 'BitingFrame', path: '/docs/components/biting-frame' }}
    />
  );
}
