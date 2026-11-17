/**
 * Reading text aloud with the phone's own voice (the browser's speech synthesis).
 * No library and no download: the voices come with the phone. Where there is a
 * choice, a voice that works offline is preferred.
 * @module signal/speech
 */
import type { SignalPlayback } from './sound';
import { signalTokens } from './tokens';

/** Options for {@link speak}. */
export interface SpeakOptions {
  /** Loudness from 0 to 1. Defaults to 1. */
  volume?: number;
  /** Speaking speed, where 1 is normal. Defaults to {@link signalTokens.speech}'s rate. */
  rate?: number;
  /** Language to choose a voice for. Defaults to {@link signalTokens.speech}'s language. */
  lang?: string;
  /** Called once, when it has finished speaking. It is not called if stopped early. */
  onEnd?: () => void;
}

/** Whether this browser can read text aloud. */
export const speechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';

/**
 * Picks a voice for a language: one that works offline first, then the default
 * one, then any. Voices can load late, so this is asked each time.
 */
export const pickVoice = (lang: string = signalTokens.speech.lang): SpeechSynthesisVoice | null => {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
  return voices.find((v) => v.localService && v.default) ?? voices.find((v) => v.localService) ?? voices.find((v) => v.default) ?? voices[0] ?? null;
};

/**
 * Reads text aloud. Only one text is read at a time; starting another stops this one.
 * Some browsers never report the end of a sentence, so a safety net ends it after
 * a time worked out from its length, and `onEnd` is still called once.
 *
 * @returns The playback, or `null` where the browser cannot speak.
 * @example
 * const reading = speak('From Ravi. Water at the north gate.', { onEnd: () => setReading(false) })
 */
export const speak = (text: string, options: SpeakOptions = {}): SignalPlayback | null => {
  if (!speechSupported() || text.trim() === '') return null;
  const synth = window.speechSynthesis;
  const { lang: defaultLang, rate, safetyMsPerChar, safetyGraceMs } = signalTokens.speech;
  const lang = options.lang ?? defaultLang;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = options.rate ?? rate;
  utterance.volume = Math.min(1, Math.max(0, options.volume ?? 1));
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(safety);
    options.onEnd?.();
  };
  const safety = setTimeout(finish, text.length * safetyMsPerChar + safetyGraceMs);
  utterance.onend = finish;
  utterance.onerror = finish;

  synth.cancel();
  synth.speak(utterance);

  return {
    stop: () => {
      if (finished) return;
      finished = true;
      clearTimeout(safety);
      utterance.onend = null;
      utterance.onerror = null;
      synth.cancel();
    },
  };
};
