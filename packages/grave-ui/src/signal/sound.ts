/**
 * Plain sounds that do a job: a steady alarm tone, a Morse pattern as sound, and
 * a steady beat. No spooky effects. Everything plays through Groove UI's shared
 * audio context and limiter, and is booked ahead on the audio clock, so it keeps
 * time even when the phone is busy.
 * @module signal/sound
 */
import { getAudioContext, getMasterBus, resumeAudioContext } from '../audio/context';
import type { MorseSegment } from './morse';
import { signalTokens } from './tokens';

/** A sound that is playing. */
export interface SignalPlayback {
  /** Stops it at once. Safe to call more than once. */
  stop: () => void;
}

/** Options shared by the alarm tones. */
export interface AlarmToneOptions {
  /** Pitch in hertz. Defaults to {@link signalTokens.whistleHz}. */
  frequency?: number;
  /** Loudness from 0 to 1. Defaults to {@link signalTokens.alarmVolume}. */
  volume?: number;
}

/** Options for {@link playMorse}. */
export interface PlayMorseOptions extends AlarmToneOptions {
  /** One Morse unit in milliseconds. Defaults to {@link signalTokens.soundUnitMs}. */
  unitMs?: number;
  /** Start again from the top when it ends. Defaults to `true`. */
  loop?: boolean;
  /** Called once, when a pattern that doesn't loop has finished. */
  onEnd?: () => void;
}

/** Options for {@link startBeat}. */
export interface BeatOptions {
  /** Beats per minute. */
  bpm: number;
  /** Called on each beat, as it sounds, with the beat's number (starting at 1). */
  onBeat?: (count: number) => void;
  /** Return `true` for a beat that should sound higher, to stand out. */
  accent?: (count: number) => boolean;
  /** Loudness from 0 to 1. Defaults to the beat token's volume. */
  volume?: number;
}

const seconds = (ms: number) => ms / 1000;

/** Books work on the audio clock a little ahead, every few milliseconds, until stopped. */
const runAhead = (ctx: AudioContext, book: (until: number) => boolean): (() => void) => {
  const lookAhead = seconds(signalTokens.scheduler.lookAheadMs);
  let timer: ReturnType<typeof setInterval> | null = null;
  const tick = () => {
    if (!book(ctx.currentTime + lookAhead) && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  timer = setInterval(tick, signalTokens.scheduler.tickMs);
  tick();
  return () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
};

/** One oscillator through a gain that starts silent, wired to the shared limiter. */
const openVoice = (ctx: AudioContext, frequency: number) => {
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  oscillator.connect(gain).connect(getMasterBus(ctx));
  oscillator.start();
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    const now = ctx.currentTime;
    const ramp = seconds(signalTokens.rampMs);
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + ramp);
    oscillator.stop(now + ramp * 2);
    oscillator.onended = () => gain.disconnect();
  };
  return { gain, close };
};

/**
 * Plays one steady tone until stopped, like holding a whistle.
 * Call it from a tap or key press: browsers keep sound off until then.
 *
 * @returns The playback, or `null` where the browser has no Web Audio.
 * @example
 * const whistle = playAlarmTone()
 * // later
 * whistle?.stop()
 */
export const playAlarmTone = (options: AlarmToneOptions = {}): SignalPlayback | null => {
  const ctx = getAudioContext();
  if (!ctx) return null;
  void resumeAudioContext();
  const voice = openVoice(ctx, options.frequency ?? signalTokens.whistleHz);
  const start = ctx.currentTime + seconds(signalTokens.scheduler.startDelayMs);
  voice.gain.gain.setValueAtTime(0, start);
  voice.gain.gain.linearRampToValueAtTime(options.volume ?? signalTokens.alarmVolume, start + seconds(signalTokens.rampMs));
  return { stop: voice.close };
};

/**
 * Plays a Morse pattern as sound, by default over and over.
 *
 * @returns The playback, or `null` where the browser has no Web Audio.
 * @example
 * const sos = playMorse(SOS_SEGMENTS)
 */
export const playMorse = (segments: readonly MorseSegment[], options: PlayMorseOptions = {}): SignalPlayback | null => {
  const ctx = getAudioContext();
  if (!ctx || segments.length === 0) return null;
  void resumeAudioContext();
  const unit = seconds(options.unitMs ?? signalTokens.soundUnitMs);
  const volume = options.volume ?? signalTokens.alarmVolume;
  const ramp = seconds(signalTokens.rampMs);
  const loop = options.loop ?? true;
  const voice = openVoice(ctx, options.frequency ?? signalTokens.whistleHz);
  let at = ctx.currentTime + seconds(signalTokens.scheduler.startDelayMs);
  let index = 0;
  let endTimer: ReturnType<typeof setTimeout> | null = null;
  const stopBooking = runAhead(ctx, (until) => {
    while (at < until) {
      const segment = segments[index];
      const length = segment.units * unit;
      if (segment.on) {
        voice.gain.gain.setValueAtTime(0, at);
        voice.gain.gain.linearRampToValueAtTime(volume, at + ramp);
        voice.gain.gain.setValueAtTime(volume, at + length - ramp);
        voice.gain.gain.linearRampToValueAtTime(0, at + length);
      }
      at += length;
      index += 1;
      if (index === segments.length) {
        if (!loop) {
          endTimer = setTimeout(() => {
            voice.close();
            options.onEnd?.();
          }, (at - ctx.currentTime) * 1000);
          return false;
        }
        index = 0;
      }
    }
    return true;
  });
  return {
    stop: () => {
      stopBooking();
      if (endTimer) clearTimeout(endTimer);
      voice.close();
    },
  };
};

/**
 * Starts a steady beat, such as a CPR pace, until stopped. Each beat is a short
 * click booked on the audio clock; `onBeat` is called as it sounds.
 *
 * @returns The playback, or `null` where the browser has no Web Audio.
 * @example
 * const beat = startBeat({ bpm: 110, onBeat: (n) => setCount(n) })
 */
export const startBeat = (options: BeatOptions): SignalPlayback | null => {
  const ctx = getAudioContext();
  if (!ctx || options.bpm <= 0) return null;
  void resumeAudioContext();
  const { clickHz, accentHz, clickMs, volume: defaultVolume } = signalTokens.beat;
  const volume = options.volume ?? defaultVolume;
  const interval = 60 / options.bpm;
  const click = seconds(clickMs);
  const ramp = seconds(signalTokens.rampMs);
  const bus = getMasterBus(ctx);
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let at = ctx.currentTime + seconds(signalTokens.scheduler.startDelayMs);
  let count = 0;
  const stopBooking = runAhead(ctx, (until) => {
    while (at < until) {
      count += 1;
      const beat = count;
      const oscillator = ctx.createOscillator();
      oscillator.frequency.value = options.accent?.(beat) ? accentHz : clickHz;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(volume, at + ramp);
      gain.gain.linearRampToValueAtTime(0, at + click);
      oscillator.connect(gain).connect(bus);
      oscillator.start(at);
      oscillator.stop(at + click);
      oscillator.onended = () => gain.disconnect();
      const timer = setTimeout(() => {
        timers.delete(timer);
        options.onBeat?.(beat);
      }, Math.max(0, (at - ctx.currentTime) * 1000));
      timers.add(timer);
      at += interval;
    }
    return true;
  });
  return {
    stop: () => {
      stopBooking();
      timers.forEach(clearTimeout);
      timers.clear();
    },
  };
};
