/**
 * useSpookySpeech - Speak text aloud in a persona, using the browser's built-in voices
 * @module hooks/useSpookySpeech
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PERSONAS,
  SPEECH_PITCH_RANGE,
  SPEECH_RATE_RANGE,
  adaptPersona,
  chunkText,
  pickVoice,
  type VoiceContext,
  type VoicePersona,
} from '../voice';

/**
 * Options for {@link useSpookySpeech}.
 */
export interface SpookySpeechOptions {
  /** Language to prefer when choosing a voice, such as `en-GB`. @default the browser's language */
  lang?: string;
}

/**
 * Options for a single {@link SpookySpeechReturn.speak} call.
 */
export interface SpeakOptions {
  /** How the voice should sound. @default 'natural' */
  persona?: VoicePersona;
  /** The exact name of an installed voice to use instead of choosing one. */
  voice?: string;
  /** Language to prefer for this call. Overrides the hook's `lang`. */
  lang?: string;
  /** Coarse signals the voice may adapt to, such as the hour. See `adaptPersona`. */
  context?: VoiceContext;
  /** Volume from 0 to 1. @default 1 */
  volume?: number;
}

/**
 * Return value of {@link useSpookySpeech}.
 */
export interface SpookySpeechReturn {
  /** Whether this browser can speak text aloud. */
  supported: boolean;
  /** The voices installed on this device. Empty until the browser has loaded them. */
  voices: SpeechSynthesisVoice[];
  /** `true` while speaking. */
  speaking: boolean;
  /**
   * Speaks the text. Resolves when it finishes or is stopped. A new call
   * stops whatever was being said before.
   */
  speak: (text: string, options?: SpeakOptions) => Promise<void>;
  /** Stops speaking at once. */
  cancel: () => void;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/** Whether the browser can speak text. `false` on the server. */
export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

/**
 * Speaks text through the voices installed on the device, shaped by a persona.
 *
 * - Voices differ a lot between browsers and operating systems. The hook picks
 *   the closest match to the persona's tone and your language, and falls back
 *   to the browser's default voice.
 * - Long text is spoken in short pieces, because some browsers stop partway
 *   through a long passage.
 * - Only pitch and speed can be changed on built-in voices. For echoes, reverb,
 *   and grit, use `useVoiceEcho`, which works on recorded audio.
 * - The browser does not let pages record its speech, so spoken text cannot be
 *   kept as a file.
 * - Speech stops when the component unmounts.
 *
 * @example
 * ```tsx
 * const { speak, speaking, supported } = useSpookySpeech();
 *
 * return (
 *   <button disabled={!supported || speaking} onClick={() => speak('Do not look behind you', { persona: 'demon' })}>
 *     Speak
 *   </button>
 * );
 * ```
 */
export const useSpookySpeech = (options: SpookySpeechOptions = {}): SpookySpeechReturn => {
  const { lang } = options;
  const supported = isSpeechSupported();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const runRef = useRef(0);

  useEffect(() => {
    if (!supported) return undefined;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener('voiceschanged', load);
    return () => synth.removeEventListener('voiceschanged', load);
  }, [supported]);

  const cancel = useCallback(() => {
    if (!isSpeechSupported()) return;
    runRef.current += 1;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, speakOptions: SpeakOptions = {}): Promise<void> => {
      if (!isSpeechSupported()) return Promise.resolve();
      const synth = window.speechSynthesis;
      const chunks = chunkText(text);
      if (chunks.length === 0) return Promise.resolve();

      const run = ++runRef.current;
      synth.cancel();

      const persona = adaptPersona(PERSONAS[speakOptions.persona ?? 'natural'], speakOptions.context);
      const language = speakOptions.lang ?? lang ?? (typeof navigator !== 'undefined' ? navigator.language : undefined);
      const voice = pickVoice(synth.getVoices(), {
        lang: language,
        tone: persona.speech.tone,
        name: speakOptions.voice,
      });

      setSpeaking(true);
      return new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          if (runRef.current === run) setSpeaking(false);
          resolve();
        };

        chunks.forEach((chunk, index) => {
          const utterance = new SpeechSynthesisUtterance(chunk);
          if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
          } else if (language) {
            utterance.lang = language;
          }
          utterance.pitch = clamp(persona.speech.pitch, SPEECH_PITCH_RANGE.min, SPEECH_PITCH_RANGE.max);
          utterance.rate = clamp(persona.speech.rate, SPEECH_RATE_RANGE.min, SPEECH_RATE_RANGE.max);
          utterance.volume = clamp(speakOptions.volume ?? 1, 0, 1);

          const last = index === chunks.length - 1;
          utterance.onend = () => {
            if (last) finish();
          };
          utterance.onerror = () => {
            // A cancelled or failed piece ends the whole phrase.
            if (last || runRef.current !== run) finish();
          };
          synth.speak(utterance);
        });
      });
    },
    [lang]
  );

  useEffect(
    () => () => {
      if (isSpeechSupported() && runRef.current > 0) window.speechSynthesis.cancel();
      runRef.current += 1;
    },
    []
  );

  return { supported, voices, speaking, speak, cancel };
};
