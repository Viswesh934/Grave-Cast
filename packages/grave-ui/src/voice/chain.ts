/**
 * The Web Audio chain that turns a recorded voice into a persona.
 *
 * The chain is built on any `BaseAudioContext`, so the same graph can play
 * live or be rendered offline. The voice hooks render offline first, then play
 * the result, so what the user hears is exactly what they can keep.
 *
 * @module voice/chain
 */

import { buildImpulse, distortionCurve } from './dsp';
import { estimateRenderSeconds, type PersonaEffects } from './personas';

/** Channels in a rendered voice. The reverb and echoes spread across two. */
export const RENDER_CHANNELS = 2;

/** Longest rendered clip, in seconds, so a long recording cannot use unlimited memory. */
export const MAX_RENDER_SECONDS = 30;

/** Longest delay the echo can be asked for, in seconds. */
const MAX_ECHO_DELAY_SECONDS = 2;

/** The smallest delay a delay node is built with. */
const MIN_ECHO_DELAY_SECONDS = 0.01;

/** The most feedback allowed, so echoes always fade. */
const MAX_FEEDBACK_GAIN = 0.95;

/** A started chain. */
export interface PersonaChain {
  /** Starts every source in the chain. `when` is a time in the context's clock. */
  start: (when?: number) => void;
}

/** The effects part of a chain, which can be fed by any audio. */
export interface EffectsStage {
  /** Starts the stage's own oscillators, such as the ring modulator. */
  start: (when?: number) => void;
}

/**
 * Adds a processing stage that runs beside a dry copy of the sound and mixes
 * the two. `wire` connects the stage's processing between `input` and `wet`.
 */
const parallelStage = (
  ctx: BaseAudioContext,
  input: AudioNode,
  dryAmount: number,
  wetAmount: number,
  wire: (input: AudioNode, wet: AudioNode) => void
): AudioNode => {
  const out = ctx.createGain();

  const dry = ctx.createGain();
  dry.gain.value = dryAmount;
  input.connect(dry);
  dry.connect(out);

  const wet = ctx.createGain();
  wet.gain.value = wetAmount;
  wet.connect(out);
  wire(input, wet);

  return out;
};

/**
 * Builds the effects half of the persona chain on any audio: filters, grit,
 * ring modulation, echo, reverb, compressor, and volume. Speed and the second
 * voice are not part of it, because they belong to recorded audio.
 *
 * @param ctx - A live or offline audio context.
 * @param input - Where the sound comes from.
 * @param effects - The knobs.
 * @param destination - Where the result goes. @default the context's speakers
 */
export const buildEffectsStage = (
  ctx: BaseAudioContext,
  input: AudioNode,
  effects: PersonaEffects,
  destination: AudioNode = ctx.destination
): EffectsStage => {
  const oscillators: OscillatorNode[] = [];

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = effects.highpassHz;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = effects.lowpassHz;
  input.connect(highpass);
  highpass.connect(lowpass);
  let tail: AudioNode = lowpass;

  const curve = distortionCurve(effects.distortion);
  if (curve) {
    const shaper = ctx.createWaveShaper();
    shaper.curve = curve as Float32Array<ArrayBuffer>;
    shaper.oversample = '2x';
    tail.connect(shaper);
    tail = shaper;
  }

  if (effects.ringMix > 0 && effects.ringHz > 0) {
    tail = parallelStage(ctx, tail, 1 - effects.ringMix, effects.ringMix, (source, wet) => {
      // A gain whose level swings with an oscillator multiplies the voice by a tone.
      const modulated = ctx.createGain();
      modulated.gain.value = 0;
      const oscillator = ctx.createOscillator();
      oscillator.frequency.value = effects.ringHz;
      oscillator.connect(modulated.gain);
      oscillators.push(oscillator);
      source.connect(modulated);
      modulated.connect(wet);
    });
  }

  if (effects.echoMix > 0 && effects.echoSeconds > 0) {
    tail = parallelStage(ctx, tail, 1, effects.echoMix, (source, wet) => {
      const delay = ctx.createDelay(MAX_ECHO_DELAY_SECONDS);
      delay.delayTime.value = Math.min(MAX_ECHO_DELAY_SECONDS, Math.max(MIN_ECHO_DELAY_SECONDS, effects.echoSeconds));
      const feedback = ctx.createGain();
      feedback.gain.value = Math.min(MAX_FEEDBACK_GAIN, Math.max(0, effects.echoFeedback));
      source.connect(delay);
      delay.connect(wet);
      delay.connect(feedback);
      feedback.connect(delay);
    });
  }

  if (effects.reverbMix > 0 && effects.reverbSeconds > 0) {
    const impulse = buildImpulse(effects.reverbSeconds, ctx.sampleRate, RENDER_CHANNELS);
    const room = ctx.createBuffer(RENDER_CHANNELS, impulse[0].length, ctx.sampleRate);
    impulse.forEach((samples, channel) => room.copyToChannel(samples as Float32Array<ArrayBuffer>, channel));
    tail = parallelStage(ctx, tail, 1, effects.reverbMix, (source, wet) => {
      const convolver = ctx.createConvolver();
      convolver.buffer = room;
      source.connect(convolver);
      convolver.connect(wet);
    });
  }

  const compressor = ctx.createDynamicsCompressor();
  const master = ctx.createGain();
  master.gain.value = effects.gain;
  tail.connect(compressor);
  compressor.connect(master);
  master.connect(destination);

  return {
    start: (when = 0) => {
      oscillators.forEach((oscillator) => oscillator.start(when));
    },
  };
};

/**
 * Builds the persona graph for one recording and connects it to the context's
 * destination. Nothing sounds until you call `start()` on the result.
 *
 * Order: speed, optional second voice, filters, grit, ring modulation, echo,
 * reverb, compressor, volume.
 *
 * @param ctx - A live or offline audio context.
 * @param buffer - The recorded voice.
 * @param effects - How to change it.
 */
export const buildPersonaChain = (ctx: BaseAudioContext, buffer: AudioBuffer, effects: PersonaEffects): PersonaChain => {
  const sources: AudioScheduledSourceNode[] = [];

  const bus = ctx.createGain();

  const voice = ctx.createBufferSource();
  voice.buffer = buffer;
  voice.playbackRate.value = effects.rate;
  voice.connect(bus);
  sources.push(voice);

  if (effects.layerMix > 0) {
    const layer = ctx.createBufferSource();
    layer.buffer = buffer;
    layer.playbackRate.value = effects.layerRate;
    const layerGain = ctx.createGain();
    layerGain.gain.value = effects.layerMix;
    layer.connect(layerGain);
    layerGain.connect(bus);
    sources.push(layer);
  }

  const stage = buildEffectsStage(ctx, bus, effects);

  return {
    start: (when = 0) => {
      sources.forEach((source) => source.start(when));
      stage.start(when);
    },
  };
};

/** The offline context constructor, including the older prefixed name. */
export const getOfflineAudioContext = (): typeof OfflineAudioContext | null => {
  if (typeof globalThis === 'undefined') return null;
  const scope = globalThis as unknown as {
    OfflineAudioContext?: typeof OfflineAudioContext;
    webkitOfflineAudioContext?: typeof OfflineAudioContext;
  };
  return scope.OfflineAudioContext ?? scope.webkitOfflineAudioContext ?? null;
};

/** Whether this browser can render a persona. */
export const canRenderPersona = (): boolean => getOfflineAudioContext() !== null;

/**
 * Applies a persona to a recording and returns the changed audio. The result
 * is longer than the original for slow personas and for echoes and reverb.
 * Nothing is played, and nothing leaves the device.
 *
 * @throws If the browser has no offline audio rendering.
 */
export const renderPersona = async (buffer: AudioBuffer, effects: PersonaEffects): Promise<AudioBuffer> => {
  const Offline = getOfflineAudioContext();
  if (!Offline) throw new Error('This browser cannot render audio effects.');

  const seconds = Math.min(MAX_RENDER_SECONDS, estimateRenderSeconds(buffer.duration, effects));
  const length = Math.max(1, Math.ceil(seconds * buffer.sampleRate));
  const ctx = new Offline(RENDER_CHANNELS, length, buffer.sampleRate);
  buildPersonaChain(ctx, buffer, effects).start();
  return ctx.startRendering();
};
