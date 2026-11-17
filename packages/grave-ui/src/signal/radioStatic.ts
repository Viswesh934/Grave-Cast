/**
 * A receiver's hiss: quiet band-limited noise that plays while a radio is on, so
 * the listener can hear that it is running. It fades under a message while one
 * plays, the way a set quietens when it locks onto a signal. Reuses Groove UI's
 * cached noise buffers, so it costs one small buffer and no library.
 * @module signal/radioStatic
 */
import { getAudioContext, getMasterBus, resumeAudioContext } from '../audio/context';
import { getNoiseBuffer } from '../audio/effects/noise';
import { signalTokens } from './tokens';

/** Options for {@link startRadioStatic}. */
export interface RadioStaticOptions {
  /** The set's volume, from 0 to 1. The hiss plays at a small share of it. Defaults to the RTTY volume. */
  volume?: number;
}

/** A hiss that is playing. */
export interface RadioStatic {
  /** Follows the set's volume control, from 0 to 1. */
  setVolume: (volume: number) => void;
  /** Fades the hiss under a message (`true`) or back up (`false`). */
  duck: (ducked: boolean) => void;
  /** Fades out and stops. Safe to call more than once. */
  stop: () => void;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Starts a receiver's hiss, until stopped.
 * Call it from a tap or key press: browsers keep sound off until then.
 *
 * @returns The hiss, or `null` where the browser has no Web Audio.
 * @example
 * const hiss = startRadioStatic({ volume: 0.5 })
 * hiss?.duck(true) // a message starts
 * hiss?.stop()     // the radio is turned off
 */
export const startRadioStatic = (options: RadioStaticOptions = {}): RadioStatic | null => {
  const ctx = getAudioContext();
  if (!ctx) return null;
  void resumeAudioContext();
  const { level, centreHz, q, duck: duckShare, fadeMs } = signalTokens.rtty.static;
  const fade = fadeMs / 1000;
  // setTargetAtTime gets about 95% of the way in three time constants.
  const timeConstant = fade / 3;

  const buffer = getNoiseBuffer(ctx, 'pink');
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = centreHz;
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(filter).connect(gain).connect(getMasterBus(ctx));
  // Start somewhere random in the buffer, so two sets never hiss in step.
  source.start(0, Math.random() * buffer.duration);

  let volume = clamp01(options.volume ?? signalTokens.rtty.volume);
  let ducked = false;
  let stopped = false;
  const apply = () => {
    if (stopped) return;
    const target = volume * level * (ducked ? duckShare : 1);
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(target, ctx.currentTime, timeConstant);
  };
  apply();

  return {
    setVolume: (next) => {
      volume = clamp01(next);
      apply();
    },
    duck: (next) => {
      ducked = next;
      apply();
    },
    stop: () => {
      if (stopped) return;
      stopped = true;
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, timeConstant);
      source.stop(now + fade);
      source.onended = () => gain.disconnect();
    },
  };
};
