/**
 * Voice personas: ready-made ways for a voice to sound.
 *
 * Each persona describes two things:
 * - how the browser's built-in speech voice should be asked to speak (pitch,
 *   rate, and a preference for a deep or bright voice), and
 * - how a recorded voice should be changed (speed and pitch together, filters,
 *   grit, echo, reverb, and an optional second voice layered underneath).
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module voice/personas
 */

/** The built-in personas. */
export type VoicePersona = 'natural' | 'demon' | 'ghost' | 'imp' | 'radio' | 'possessed';

/** Every persona, for pickers. */
export const VOICE_PERSONAS: readonly VoicePersona[] = ['natural', 'demon', 'ghost', 'imp', 'radio', 'possessed'];

/** Which kind of installed voice to prefer for a persona. */
export type VoiceTone = 'any' | 'deep' | 'bright';

/** The lowest and highest values `SpeechSynthesisUtterance` accepts. */
export const SPEECH_PITCH_RANGE = { min: 0, max: 2 } as const;
export const SPEECH_RATE_RANGE = { min: 0.1, max: 10 } as const;

/** Filter settings that let everything through. */
export const FILTER_OPEN_HZ = { highpass: 20, lowpass: 20000 } as const;

/** Smallest playback rate used when estimating length, so a bad value cannot divide by zero. */
const MIN_PLAYBACK_RATE = 0.05;

/** Echo repeats are counted until they fade below this fraction of the first one. */
const ECHO_AUDIBLE_FLOOR = 0.01;

/** Most echo repeats that are rendered, and the strongest and weakest feedback allowed. */
const MAX_ECHO_REPEATS = 12;
const MAX_ECHO_FEEDBACK = 0.95;
const MIN_ECHO_FEEDBACK = 0.01;

/** Extra seconds after the last audible sound, so nothing is cut off. */
const TAIL_PADDING_SECONDS = 0.15;

/**
 * How a recorded voice is changed. All amounts are 0-1 unless noted.
 */
export interface PersonaEffects {
  /** Playback rate. Below 1 is slower and deeper, above 1 is faster and higher. Pitch and speed move together. */
  rate: number;
  /** Cuts rumble below this frequency, in Hz. */
  highpassHz: number;
  /** Cuts brightness above this frequency, in Hz. */
  lowpassHz: number;
  /** Grit and crunch. 0 is clean. */
  distortion: number;
  /** Frequency of the ring modulator, in Hz. It gives a robotic, metallic buzz. */
  ringHz: number;
  /** How much of the ring-modulated sound is mixed in. 0 is off. */
  ringMix: number;
  /** Time between echoes, in seconds. */
  echoSeconds: number;
  /** How much each echo feeds the next. Higher means more repeats. */
  echoFeedback: number;
  /** How loud the echoes are. 0 is off. */
  echoMix: number;
  /** Length of the room reverb, in seconds. */
  reverbSeconds: number;
  /** How loud the reverb is. 0 is off. */
  reverbMix: number;
  /** Playback rate of a second copy of the voice layered underneath. */
  layerRate: number;
  /** How loud the second copy is. 0 is off. */
  layerMix: number;
  /** Final volume. */
  gain: number;
}

/**
 * How the browser's built-in voice is asked to speak.
 */
export interface PersonaSpeech {
  /** Pitch, 0-2. 1 is normal. */
  pitch: number;
  /** Speed, 1 is normal. */
  rate: number;
  /** Which kind of installed voice to prefer. */
  tone: VoiceTone;
}

/**
 * One persona in full.
 */
export interface PersonaSettings {
  /** A short name for buttons and pickers. */
  label: string;
  /** One line describing how it sounds. */
  description: string;
  /** Settings for the browser's text-to-speech voice. */
  speech: PersonaSpeech;
  /** Settings for changing a recorded voice. */
  effects: PersonaEffects;
}

/** Effects that leave a voice untouched. */
export const NEUTRAL_EFFECTS: PersonaEffects = {
  rate: 1,
  highpassHz: FILTER_OPEN_HZ.highpass,
  lowpassHz: FILTER_OPEN_HZ.lowpass,
  distortion: 0,
  ringHz: 0,
  ringMix: 0,
  echoSeconds: 0,
  echoFeedback: 0,
  echoMix: 0,
  reverbSeconds: 0,
  reverbMix: 0,
  layerRate: 1,
  layerMix: 0,
  gain: 1,
};

export const PERSONAS: Record<VoicePersona, PersonaSettings> = {
  natural: {
    label: 'Natural',
    description: 'Your own voice, unchanged.',
    speech: { pitch: 1, rate: 1, tone: 'any' },
    effects: { ...NEUTRAL_EFFECTS },
  },
  demon: {
    label: 'Demon',
    description: 'Slow, huge, and growling, with a second voice an octave below.',
    speech: { pitch: 0.2, rate: 0.8, tone: 'deep' },
    effects: {
      ...NEUTRAL_EFFECTS,
      rate: 0.72,
      highpassHz: 60,
      lowpassHz: 3200,
      distortion: 0.35,
      reverbSeconds: 1.6,
      reverbMix: 0.35,
      layerRate: 0.5,
      layerMix: 0.45,
    },
  },
  ghost: {
    label: 'Ghost',
    description: 'Thin and distant, with long echoes drifting away.',
    speech: { pitch: 1.4, rate: 0.85, tone: 'bright' },
    effects: {
      ...NEUTRAL_EFFECTS,
      rate: 1.02,
      highpassHz: 400,
      lowpassHz: 5000,
      echoSeconds: 0.32,
      echoFeedback: 0.5,
      echoMix: 0.4,
      reverbSeconds: 2.4,
      reverbMix: 0.5,
    },
  },
  imp: {
    label: 'Imp',
    description: 'Fast, squeaky, and gleeful.',
    speech: { pitch: 2, rate: 1.25, tone: 'bright' },
    effects: {
      ...NEUTRAL_EFFECTS,
      rate: 1.55,
      highpassHz: 250,
      lowpassHz: 9000,
      reverbSeconds: 0.3,
      reverbMix: 0.15,
    },
  },
  radio: {
    label: 'Dead radio',
    description: 'A voice through a broken speaker, buzzing and thin.',
    speech: { pitch: 0.9, rate: 1.05, tone: 'any' },
    effects: {
      ...NEUTRAL_EFFECTS,
      highpassHz: 500,
      lowpassHz: 2800,
      distortion: 0.5,
      ringHz: 50,
      ringMix: 0.2,
      reverbSeconds: 0.2,
      reverbMix: 0.1,
    },
  },
  possessed: {
    label: 'Possessed',
    description: 'Two voices at once, one wrong, with a metallic tremor.',
    speech: { pitch: 0.5, rate: 0.9, tone: 'deep' },
    effects: {
      ...NEUTRAL_EFFECTS,
      rate: 0.85,
      highpassHz: 80,
      lowpassHz: 4500,
      distortion: 0.2,
      ringHz: 30,
      ringMix: 0.3,
      echoSeconds: 0.18,
      echoFeedback: 0.4,
      echoMix: 0.35,
      reverbSeconds: 1.2,
      reverbMix: 0.3,
      layerRate: 1.25,
      layerMix: 0.5,
    },
  },
};

/**
 * How many seconds a recorded voice lasts once changed: the slowed-down
 * voice, plus however long its echoes and reverb ring on.
 *
 * @param durationSeconds - Length of the original recording.
 */
export const estimateRenderSeconds = (durationSeconds: number, effects: PersonaEffects): number => {
  const slowestRate = effects.layerMix > 0 ? Math.min(effects.rate, effects.layerRate) : effects.rate;
  const body = Math.max(0, durationSeconds) / Math.max(slowestRate, MIN_PLAYBACK_RATE);

  let echoTail = 0;
  if (effects.echoMix > 0 && effects.echoSeconds > 0) {
    const feedback = Math.min(MAX_ECHO_FEEDBACK, Math.max(MIN_ECHO_FEEDBACK, effects.echoFeedback));
    const repeats = Math.min(MAX_ECHO_REPEATS, Math.max(1, Math.ceil(Math.log(ECHO_AUDIBLE_FLOOR) / Math.log(feedback))));
    echoTail = effects.echoSeconds * repeats;
  }

  const reverbTail = effects.reverbMix > 0 ? effects.reverbSeconds : 0;
  return body + echoTail + reverbTail + TAIL_PADDING_SECONDS;
};
