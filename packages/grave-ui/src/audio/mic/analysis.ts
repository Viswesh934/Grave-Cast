/**
 * Microphone analysis: turning raw audio into a level and a kind of sound.
 *
 * Everything here is pure TypeScript with no Web Audio dependency, so it can
 * be unit tested and reused. The `useOccultMic` hook feeds it live audio.
 *
 * @module audio/mic/analysis
 */

/**
 * What the detector can hear.
 *
 * - `whisper`: quiet, sustained sound
 * - `voice`: normal speaking volume
 * - `blow`: loud sound dominated by low rumble, like breath on the microphone
 * - `scream`: very loud sound that is not a blow
 */
export type SoundKind = 'whisper' | 'voice' | 'blow' | 'scream';

/** Every sound kind, quietest first. */
export const SOUND_KINDS: readonly SoundKind[] = ['whisper', 'voice', 'blow', 'scream'];

/** Analysis settings. Frequencies are in Hz, levels in decibels, times in ms. */
export const MIC_ANALYSIS = {
  /** FFT window size. Larger is finer in frequency and slower to react. */
  fftSize: 2048,
  /** Loudness mapped to level 0 and level 1. Quieter or louder is clamped. */
  floorDb: -62,
  ceilDb: -14,
  /** How fast the displayed level rises and falls. The slow release keeps a meter from flickering. */
  attackMs: 30,
  releaseMs: 220,
  /**
   * Release of the level the detector reads. It must be quick: if the detector
   * followed the slow display level, the fading tail of a spoken word would
   * pass through the whisper range and be reported as a whisper.
   */
  detectReleaseMs: 50,
  /** The rumble band where breath on a microphone shows up, and the band it is compared with. */
  lowBand: { from: 20, to: 250 },
  totalBand: { from: 20, to: 8000 },
  /** Floor for a spectrum bin in decibels, so silence does not become negative infinity. */
  binFloorDb: -120,
  /** The smallest amplitude measured, to keep the logarithm finite. */
  minRms: 1e-8,
} as const;

/**
 * Where each kind of sound begins, as a level from 0 to 1.
 */
export interface SoundThresholds {
  /** Level at which sound counts as a whisper. */
  whisper: number;
  /** Level at which sound counts as a voice. */
  voice: number;
  /** Level at which sound counts as a scream. */
  scream: number;
  /** Minimum level for a blow. */
  blow: number;
  /** Share of energy in the low band (0-1) at which loud sound counts as a blow. */
  blowLowRatio: number;
}

/**
 * How long a sound must last before it counts, and how long it must stop.
 */
export interface SoundTiming {
  /** Milliseconds a kind of sound must be steady before it begins. */
  hold: Record<SoundKind, number>;
  /** Milliseconds of change before a sound ends or becomes another kind. */
  release: number;
  /** Milliseconds before the same kind can begin again. */
  cooldown: number;
}

export const DEFAULT_THRESHOLDS: SoundThresholds = {
  whisper: 0.12,
  voice: 0.35,
  scream: 0.8,
  blow: 0.3,
  blowLowRatio: 0.65,
};

export const DEFAULT_TIMING: SoundTiming = {
  hold: { whisper: 160, voice: 120, blow: 140, scream: 90 },
  release: 200,
  cooldown: 400,
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * Root-mean-square amplitude of a block of samples, from 0 (silence) up to
 * about 1 for a full-scale signal.
 */
export const rmsOf = (samples: ArrayLike<number>): number => {
  const count = samples.length;
  if (count === 0) return 0;
  let sum = 0;
  for (let i = 0; i < count; i += 1) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / count);
};

/**
 * Maps an amplitude to a comfortable 0-1 level on a decibel scale, so quiet
 * sounds register and loud ones do not pin the meter.
 */
export const levelFromRms = (
  rms: number,
  floorDb: number = MIC_ANALYSIS.floorDb,
  ceilDb: number = MIC_ANALYSIS.ceilDb
): number => {
  const db = 20 * Math.log10(Math.max(rms, MIC_ANALYSIS.minRms));
  return clamp01((db - floorDb) / (ceilDb - floorDb));
};

/**
 * Moves a level toward a new reading, quickly when rising and slowly when
 * falling, so a meter feels responsive without flickering.
 *
 * @param dtMs - Milliseconds since the previous reading.
 */
export const smoothLevel = (
  previous: number,
  next: number,
  dtMs: number,
  attackMs: number = MIC_ANALYSIS.attackMs,
  releaseMs: number = MIC_ANALYSIS.releaseMs
): number => {
  const tau = next > previous ? attackMs : releaseMs;
  if (tau <= 0 || dtMs <= 0) return tau <= 0 ? next : previous;
  return previous + (next - previous) * (1 - Math.exp(-dtMs / tau));
};

/**
 * Total energy in a frequency band, from a spectrum in decibels (the output
 * of `AnalyserNode.getFloatFrequencyData`).
 */
export const bandEnergy = (
  spectrumDb: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  fromHz: number,
  toHz: number
): number => {
  const binHz = sampleRate / fftSize;
  const first = Math.max(1, Math.floor(fromHz / binHz));
  const last = Math.min(spectrumDb.length - 1, Math.ceil(toHz / binHz));

  let energy = 0;
  for (let bin = first; bin <= last; bin += 1) {
    const db = spectrumDb[bin];
    if (Number.isFinite(db)) {
      energy += Math.pow(10, Math.max(db, MIC_ANALYSIS.binFloorDb) / 10);
    }
  }
  return energy;
};

/**
 * Share of the sound's energy that sits in the low rumble band, from 0 to 1.
 * Breath on a microphone is mostly rumble, while speech and screams have far
 * more energy higher up.
 */
export const lowFrequencyRatio = (
  spectrumDb: ArrayLike<number>,
  sampleRate: number,
  fftSize: number
): number => {
  const { lowBand, totalBand } = MIC_ANALYSIS;
  const total = bandEnergy(spectrumDb, sampleRate, fftSize, totalBand.from, totalBand.to);
  if (total <= 0) return 0;
  return clamp01(bandEnergy(spectrumDb, sampleRate, fftSize, lowBand.from, lowBand.to) / total);
};

/**
 * What kind of sound one reading looks like, or `null` for near silence.
 * A blow is checked first because it is also loud.
 */
export const classifyReading = (
  level: number,
  lowRatio: number,
  thresholds: SoundThresholds = DEFAULT_THRESHOLDS
): SoundKind | null => {
  if (level < thresholds.whisper) return null;
  if (lowRatio >= thresholds.blowLowRatio && level >= thresholds.blow) return 'blow';
  if (level >= thresholds.scream) return 'scream';
  if (level >= thresholds.voice) return 'voice';
  return 'whisper';
};

/**
 * One reading fed to the detector.
 */
export interface DetectorFrame {
  /** Smoothed level, 0-1. */
  level: number;
  /** Low band share, 0-1. */
  lowRatio: number;
  /** A clock in milliseconds. Only differences matter. */
  now: number;
}

/**
 * What the detector reports after each reading.
 */
export interface DetectorResult {
  /** The sound happening now, or `null`. */
  sound: SoundKind | null;
  /** Set only on the reading where a sound begins. */
  onset: SoundKind | null;
  /** Milliseconds the current sound has lasted. 0 when silent. */
  heldMs: number;
}

export interface SoundDetector {
  /** Feeds one reading and returns the current state. */
  update: (frame: DetectorFrame) => DetectorResult;
  /** Forgets everything, for example when the microphone is stopped. */
  reset: () => void;
}

/**
 * Creates a detector that turns noisy per-frame readings into steady events.
 *
 * A change only counts after it has lasted long enough (`timing.hold` to
 * begin, `timing.release` to end), which stops flicker at the edges of a
 * threshold. The same kind of sound cannot begin again until `cooldown` has
 * passed, so one long scream is reported once.
 */
export const createSoundDetector = (
  thresholds: Partial<SoundThresholds> = {},
  timing: Partial<Omit<SoundTiming, 'hold'>> & { hold?: Partial<SoundTiming['hold']> } = {}
): SoundDetector => {
  const limits: SoundThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const holds: Record<SoundKind, number> = { ...DEFAULT_TIMING.hold, ...timing.hold };
  const release = timing.release ?? DEFAULT_TIMING.release;
  const cooldown = timing.cooldown ?? DEFAULT_TIMING.cooldown;

  let current: SoundKind | null = null;
  let currentSince = 0;
  let pending: { kind: SoundKind | null; since: number } | null = null;
  const lastOnset: Partial<Record<SoundKind, number>> = {};

  return {
    update: ({ level, lowRatio, now }) => {
      const candidate = classifyReading(level, lowRatio, limits);
      let onset: SoundKind | null = null;

      if (candidate === current) {
        pending = null;
      } else {
        if (!pending || pending.kind !== candidate) pending = { kind: candidate, since: now };
        const needed = candidate === null ? release : holds[candidate];

        if (now - pending.since >= needed) {
          current = candidate;
          currentSince = now;
          pending = null;

          if (candidate !== null) {
            const previous = lastOnset[candidate];
            if (previous === undefined || now - previous >= cooldown) {
              onset = candidate;
              lastOnset[candidate] = now;
            }
          }
        }
      }

      return { sound: current, onset, heldMs: current === null ? 0 : now - currentSince };
    },
    reset: () => {
      current = null;
      currentSince = 0;
      pending = null;
      for (const kind of SOUND_KINDS) delete lastOnset[kind];
    },
  };
};
