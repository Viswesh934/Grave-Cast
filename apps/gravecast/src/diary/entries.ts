/**
 * What the diary writes while a scan runs, in the order it tries them. Each
 * scan asks the next one, so the diary grows darker and more personal over the
 * session. Entries with `when` only appear once the diary remembers an answer.
 */
import type { DiaryEntry } from 'groove-ui'

export const DIARY_STORAGE_KEY = 'gravecast-diary'

export const DIARY_ENTRIES: readonly DiaryEntry[] = [
  {
    id: 'what-am-i',
    kind: 'riddle',
    text: 'I have no mouth, yet I can answer. I have no body, yet I can follow you. What am I?',
    answers: ['diary', 'book', 'journal', 'you', 'echo'],
    right: 'Clever. Now I know your handwriting.',
  },
  {
    id: 'colour',
    kind: 'open',
    text: 'Before we go any further. What is your favourite colour?',
    remember: 'colour',
    reply: '{answer}. I will remember that.',
  },
  {
    id: 'presence',
    kind: 'riddle',
    text: 'I follow you wherever you go, yet I disappear when darkness takes over. What am I?',
    answers: ['shadow'],
    right: 'How unfortunate. Even your shadow knows when to abandon you.',
  },
  {
    id: 'doors',
    kind: 'choice',
    text: 'Which door would you open: the one that screams, or the one that whispers?',
    remember: 'door',
    options: [
      { label: 'The one that screams', reply: 'Brave. Screams at least tell you where they are.' },
      { label: 'The one that whispers', reply: 'Of course. You always did prefer the voices that come closer.' },
    ],
  },
  {
    id: 'reflection',
    kind: 'riddle',
    text: 'I copy every movement you make. I smile when you smile. Yet if I ever move before you, what would you do?',
    answers: ['reflection', 'mirror', 'mirror image'],
    right: 'Perhaps you should stop looking into mirrors tonight.',
  },
  {
    id: 'dark',
    kind: 'choice',
    text: 'Tell me honestly. Are you afraid of the dark?',
    remember: 'dark',
    options: [
      { label: 'Yes', reply: 'Good. Fear keeps you careful. For a while.' },
      { label: 'No', reply: 'Interesting. Most people say yes.' },
    ],
  },
  {
    id: 'silence',
    kind: 'riddle',
    text: 'The more you take from me, the larger I become. What am I?',
    answers: ['hole', 'pit'],
    right: 'Some things grow when you feed them. Remember that.',
  },
  {
    id: 'knocks',
    kind: 'open',
    input: 'numeric',
    text: 'How many times would you knock before entering your own house?',
    reply: '{answer}. And who did you expect to answer?',
  },
  {
    id: 'clock',
    kind: 'riddle',
    text: 'I have a face but no eyes. I have hands but touch nothing. I count the moments until your final breath. What am I?',
    answers: ['clock', 'watch'],
    right: 'Tick. Tock. You seem rather interested in time.',
  },
  {
    id: 'colour-again',
    kind: 'choice',
    when: { key: 'colour' },
    text: 'You chose {colour} earlier. Would you still choose it if it were the only thing you could see?',
    options: [
      { label: 'Yes', reply: 'Then you will not mind when it is.' },
      { label: 'No', reply: 'So you lied to me. I will remember that too.' },
    ],
  },
  {
    id: 'house',
    kind: 'open',
    text: 'A family enters a house. Every window is closed. Every door is locked. In the morning, nobody is there, but four shadows remain. What happened?',
    reply: 'Interesting. You assumed they left.',
  },
  {
    id: 'returns',
    kind: 'riddle',
    text: 'What dies every night but returns every morning?',
    answers: ['day', 'sun', 'light', 'daylight', 'morning'],
    right: 'And one morning, it will not.',
  },
  {
    id: 'reader',
    kind: 'message',
    text: 'Someone else wrote in this diary before you. They never finished their last sentence.',
  },
  {
    id: 'grave',
    kind: 'riddle',
    text: 'I am made for the living, occupied by the dead, and visited by those who fear becoming me. What am I?',
    answers: ['grave', 'tomb', 'grave site'],
    right: 'Every visitor eventually becomes a resident.',
  },
  {
    id: 'watched',
    kind: 'choice',
    text: 'What is more frightening: being watched, or being remembered?',
    options: [
      { label: 'Being watched', reply: 'Then you should know. You have been, all night.' },
      { label: 'Being remembered', reply: 'Then I am sorry. I never forget.' },
    ],
  },
  {
    id: 'light-on',
    kind: 'message',
    when: { key: 'dark', equals: 'No' },
    text: 'You said you were not afraid of the dark. Then why haven’t you turned off the light?',
  },
  {
    id: 'dark-noticed',
    kind: 'message',
    when: { key: 'dark', equals: 'Yes' },
    text: 'You said you fear the dark. It has started to notice you too.',
  },
  {
    id: 'lungs',
    kind: 'choice',
    text: 'What has no lungs, yet whispers?',
    options: [
      { label: 'The wind', reply: 'The wind, yes. And what else is whispering to you now?' },
      { label: 'A ghost', reply: 'Ghosts do not whisper. They wait.' },
      { label: 'This diary', reply: 'You are learning.' },
    ],
  },
  {
    id: 'name',
    kind: 'riddle',
    text: 'I am spoken once by the living, remembered by the dead, and repeated by those who remain. What am I?',
    answers: ['name'],
    right: 'Keep yours close. It is the last thing you own.',
  },
  {
    id: 'visitor',
    kind: 'open',
    text: 'You hear three knocks at your door. You look through the peephole. Nobody is there. Then three knocks come from inside your bedroom. Who is visiting?',
    reply: 'You should not have answered the first knock.',
  },
  {
    id: 'tombstone',
    kind: 'choice',
    text: 'If your name appeared on a tombstone, would you read the date?',
    options: [
      { label: 'Yes', reply: 'Most people look away. You are not most people.' },
      { label: 'No', reply: 'Wise. Some dates are better kept as surprises.' },
    ],
  },
  {
    id: 'follows',
    kind: 'riddle',
    text: 'What follows you but never walks?',
    answers: ['shadow', 'time', 'past', 'death'],
    right: 'It is closer than you think.',
  },
  {
    id: 'candle',
    kind: 'riddle',
    text: 'I am born from fire, grow shorter as I live, and die when I have nothing left to give. What am I?',
    answers: ['candle'],
    right: 'We all burn for something.',
  },
  {
    id: 'enough',
    kind: 'message',
    text: 'That is enough for now. I will be here the next time you open me.',
  },
]

/** Used in turn when a riddle is answered wrongly. */
export const DIARY_WRONG_REPLIES: readonly string[] = [
  'No. But you were so certain, weren’t you?',
  'Wrong. I expected more from you.',
  'Close. Not close enough. It rarely is.',
  'That is exactly what the last one said.',
]

export const DIARY_SILENT_TEXT = 'There is nothing left to ask. I already know enough about you.'
