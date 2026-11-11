/**
 * Adapting a persona to the moment.
 *
 * A voice can lean darker late at night, rougher when the room is loud, and
 * more haunted for someone who keeps coming back. It only uses a few coarse
 * values the caller passes in. It reads nothing from the browser itself,
 * stores nothing, and cannot tell people apart.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module voice/adapt
 */

import type { PersonaSettings } from './personas';

/**
 * What the voice may adapt to. Every field is optional.
 */
export interface VoiceContext {
  /** Hour of the day, 0-23. Late night deepens the voice. */
  hour?: number;
  /** How loud the surroundings or the speaker are, 0-1. Loud adds grit. */
  loudness?: number;
  /** How many times the person has come back. More visits add more echo. */
  visits?: number;
}

/** The hours (inclusive start, exclusive end) treated as deep night and as late evening. */
export const NIGHT_HOURS = { deepFrom: 0, deepTo: 5, lateFrom: 22 } as const;

/** Effect of each context signal. */
export const ADAPTATION = {
  /** Playback rate multipliers: deep night and late evening. */
  deepNightRate: 0.92,
  lateRate: 0.96,
  /** Extra reverb at deep night. */
  deepNightReverb: 0.1,
  /** Loudness above this adds distortion. */
  loudFrom: 0.7,
  loudDistortion: 0.2,
  /** Extra echo per visit, and the visit count where it stops growing. */
  echoPerVisit: 0.04,
  maxVisits: 5,
  /** Speech pitch drops by this much at deep night. */
  deepNightPitch: 0.1,
  /** Used when a persona has no echo or reverb of its own to strengthen. */
  defaultEchoSeconds: 0.25,
  defaultEchoFeedback: 0.3,
  defaultReverbSeconds: 1,
} as const;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * Returns a copy of `persona` adjusted for the context. The original is not
 * changed. A persona with no effects (like `natural`) is returned unchanged,
 * so a clean voice stays clean.
 */
export const adaptPersona = (persona: PersonaSettings, context: VoiceContext = {}): PersonaSettings => {
  const { hour, loudness, visits } = context;
  const effects = { ...persona.effects };
  const speech = { ...persona.speech };

  const isClean =
    effects.rate === 1 && effects.distortion === 0 && effects.echoMix === 0 && effects.reverbMix === 0 && effects.layerMix === 0;
  if (isClean) return { ...persona, effects, speech };

  if (hour !== undefined && Number.isFinite(hour)) {
    const h = ((Math.floor(hour) % 24) + 24) % 24;
    if (h >= NIGHT_HOURS.deepFrom && h < NIGHT_HOURS.deepTo) {
      effects.rate *= ADAPTATION.deepNightRate;
      effects.reverbMix = clamp(effects.reverbMix + ADAPTATION.deepNightReverb, 0, 1);
      if (effects.reverbSeconds === 0) effects.reverbSeconds = ADAPTATION.defaultReverbSeconds;
      speech.pitch = clamp(speech.pitch - ADAPTATION.deepNightPitch, 0, 2);
    } else if (h >= NIGHT_HOURS.lateFrom) {
      effects.rate *= ADAPTATION.lateRate;
    }
  }

  if (loudness !== undefined && loudness > ADAPTATION.loudFrom) {
    effects.distortion = clamp(effects.distortion + ADAPTATION.loudDistortion, 0, 1);
  }

  if (visits !== undefined && visits > 0) {
    const counted = Math.min(Math.floor(visits), ADAPTATION.maxVisits);
    effects.echoMix = clamp(effects.echoMix + counted * ADAPTATION.echoPerVisit, 0, 1);
    if (effects.echoSeconds === 0) effects.echoSeconds = ADAPTATION.defaultEchoSeconds;
    if (effects.echoFeedback === 0) effects.echoFeedback = ADAPTATION.defaultEchoFeedback;
  }

  return { ...persona, effects, speech };
};
