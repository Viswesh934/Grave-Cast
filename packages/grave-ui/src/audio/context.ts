/**
 * Shared audio context and master output bus.
 *
 * Every sound in Grave-UI (sound effects and the music system) plays through
 * this one context and one output stage, so they share a single clock, a
 * single resume call, and a single limiter.
 *
 * @module audio/context
 */

/** Shared output stage: a gentle compressor so stacked sounds never clip. */
const MASTER_BUS = {
  gain: 0.8,
  threshold: -18,
  knee: 24,
  ratio: 6,
  attack: 0.005,
  release: 0.25,
} as const;

let audioContext: AudioContext | null = null;
let bus: { ctx: BaseAudioContext; input: GainNode } | null = null;

/**
 * Gets the shared audio context, creating it on first use.
 *
 * @returns The context, or `null` where Web Audio is unavailable (SSR, old browsers).
 */
export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
};

/**
 * Resumes the audio context. Browsers keep it suspended until a user gesture,
 * so call this from a click or key handler before playing.
 */
export const resumeAudioContext = async (): Promise<void> => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
};

/**
 * Gets the shared output node for a context. Connect sounds here, not to
 * `ctx.destination`, so they pass through the master limiter.
 */
export const getMasterBus = (ctx: BaseAudioContext): GainNode => {
  if (bus && bus.ctx === ctx) return bus.input;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = MASTER_BUS.threshold;
  compressor.knee.value = MASTER_BUS.knee;
  compressor.ratio.value = MASTER_BUS.ratio;
  compressor.attack.value = MASTER_BUS.attack;
  compressor.release.value = MASTER_BUS.release;

  const input = ctx.createGain();
  input.gain.value = MASTER_BUS.gain;
  input.connect(compressor);
  compressor.connect(ctx.destination);

  bus = { ctx, input };
  return input;
};
