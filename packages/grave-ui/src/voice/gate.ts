/**
 * Utterance gate: decides when someone started and stopped speaking.
 *
 * It watches a loudness level and reports when a spoken phrase begins and
 * ends, ignoring short blips and cutting off after a pause.
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module voice/gate
 */

/**
 * Options for {@link createUtteranceGate}.
 */
export interface UtteranceGateOptions {
  /** Level (0-1) that starts a phrase. @default 0.2 */
  startLevel?: number;
  /** Level (0-1) below which sound counts as a pause. Lower than `startLevel`, so small dips do not end a phrase. @default 0.1 */
  endLevel?: number;
  /** Milliseconds of quiet that end a phrase. @default 700 */
  silenceMs?: number;
  /** Shortest phrase worth keeping, in milliseconds. Shorter ones are dropped. @default 250 */
  minMs?: number;
  /** Longest phrase, in milliseconds. It is cut off here. @default 8000 */
  maxMs?: number;
}

/** Defaults for {@link UtteranceGateOptions}. */
export const DEFAULT_GATE: Required<UtteranceGateOptions> = {
  startLevel: 0.2,
  endLevel: 0.1,
  silenceMs: 700,
  minMs: 250,
  maxMs: 8000,
};

/**
 * What happened on a reading.
 *
 * - `started`: a phrase began
 * - `ended`: a phrase finished and is long enough to keep
 * - `discarded`: a phrase finished but was too short
 */
export type GateEvent = 'started' | 'ended' | 'discarded';

/**
 * The gate's state after a reading.
 */
export interface GateResult {
  /** `true` while a phrase is being captured. */
  recording: boolean;
  /** Set only on the reading where something happened. */
  event: GateEvent | null;
  /** Milliseconds of speech so far, or in the finished phrase. */
  speechMs: number;
}

export interface UtteranceGate {
  /** Feeds one reading. `now` is a clock in milliseconds. */
  update: (reading: { level: number; now: number }) => GateResult;
  /** Forgets any phrase in progress. */
  reset: () => void;
}

/**
 * Creates a gate. Feed it a level on every frame.
 *
 * @example
 * ```ts
 * const gate = createUtteranceGate();
 * const { event } = gate.update({ level, now });
 * if (event === 'started') recorder.start();
 * if (event === 'ended') recorder.stop();
 * ```
 */
export const createUtteranceGate = (options: UtteranceGateOptions = {}): UtteranceGate => {
  const config = { ...DEFAULT_GATE, ...options };

  let recording = false;
  let startedAt = 0;
  let lastLoud = 0;

  return {
    update: ({ level, now }) => {
      if (!recording) {
        if (level >= config.startLevel) {
          recording = true;
          startedAt = now;
          lastLoud = now;
          return { recording: true, event: 'started', speechMs: 0 };
        }
        return { recording: false, event: null, speechMs: 0 };
      }

      if (level >= config.endLevel) lastLoud = now;

      const quietFor = now - lastLoud;
      const tooLong = now - startedAt >= config.maxMs;
      if (quietFor >= config.silenceMs || tooLong) {
        recording = false;
        const speechMs = tooLong ? now - startedAt : lastLoud - startedAt;
        return { recording: false, event: speechMs >= config.minMs ? 'ended' : 'discarded', speechMs };
      }
      return { recording: true, event: null, speechMs: lastLoud - startedAt };
    },
    reset: () => {
      recording = false;
      startedAt = 0;
      lastLoud = 0;
    },
  };
};
