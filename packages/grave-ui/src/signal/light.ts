/**
 * Morse by light: a timer that switches anything on and off in a pattern (the
 * torch, or the whole screen), and access to the phone's torch.
 * @module signal/light
 */
import { minimumLightUnitMs, type MorseSegment } from './morse';
import type { SignalPlayback } from './sound';
import { signalTokens } from './tokens';

/** Options for {@link runLightPattern}. */
export interface LightPatternOptions {
  /**
   * One Morse unit in milliseconds. Defaults to {@link signalTokens.lightUnitMs}.
   * Never shorter than {@link minimumLightUnitMs}, so the light stays within the WCAG 2.3.1 flash limit.
   */
  unitMs?: number;
  /** Start again from the top when it ends. Defaults to `true`. */
  loop?: boolean;
}

/**
 * Switches a light on and off in a Morse pattern. Each step is timed from the
 * start, so small timer delays never add up. Stopping always leaves the light off.
 *
 * @example
 * const sos = runLightPattern(SOS_SEGMENTS, (on) => setLit(on))
 * // later
 * sos.stop()
 */
export const runLightPattern = (
  segments: readonly MorseSegment[],
  onChange: (on: boolean) => void,
  options: LightPatternOptions = {},
): SignalPlayback => {
  const unitMs = Math.max(options.unitMs ?? signalTokens.lightUnitMs, minimumLightUnitMs());
  const loop = options.loop ?? true;
  let index = 0;
  let next = performance.now();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = segments.length === 0;
  const wait = (step: () => void) => {
    timer = setTimeout(step, Math.max(0, next - performance.now()));
  };
  const step = () => {
    if (stopped) return;
    const segment = segments[index];
    onChange(segment.on);
    next += segment.units * unitMs;
    index += 1;
    if (index === segments.length) {
      if (!loop) {
        wait(() => !stopped && onChange(false));
        return;
      }
      index = 0;
    }
    wait(step);
  };
  step();
  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      if (timer) clearTimeout(timer);
      onChange(false);
    },
  };
};

/** The phone's torch, once opened. */
export interface Torch {
  /** Turns the torch on or off. */
  set: (on: boolean) => Promise<void>;
  /** Turns it off and lets go of the camera. */
  close: () => void;
}

type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };
type TorchConstraints = MediaTrackConstraintSet & { torch?: boolean };

/**
 * Opens the phone's torch through the back camera. Asks for camera permission.
 * Only some browsers can do this (Chrome on Android, at the time of writing).
 *
 * @returns The torch, or `null` when there is no torch, no permission, or no support.
 * @example
 * const torch = await openTorch()
 * if (torch) runLightPattern(SOS_SEGMENTS, (on) => void torch.set(on))
 */
export const openTorch = async (): Promise<Torch | null> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
  } catch {
    return null;
  }
  const close = () => stream.getTracks().forEach((track) => track.stop());
  const track = stream.getVideoTracks()[0];
  const capabilities = track?.getCapabilities?.() as TorchCapabilities | undefined;
  if (!track || !capabilities?.torch) {
    close();
    return null;
  }
  return {
    set: (on) => track.applyConstraints({ advanced: [{ torch: on } as TorchConstraints] }),
    close: () => {
      void track.applyConstraints({ advanced: [{ torch: false } as TorchConstraints] }).catch(() => undefined);
      close();
    },
  };
};

/**
 * Vibrates the phone, where it can. Pass one length, or on/off lengths in milliseconds.
 *
 * @returns Whether the browser accepted it.
 */
export const vibrate = (pattern: number | number[]): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' ? navigator.vibrate(pattern) : false;
