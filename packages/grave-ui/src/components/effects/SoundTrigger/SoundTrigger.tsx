/**
 * SoundTrigger - React to whispers, breath, and screams from the microphone.
 * @module components/effects/SoundTrigger/SoundTrigger
 */

import type { CSSProperties, MutableRefObject, ReactNode } from 'react';
import type { SoundKind } from '../../../audio';
import type { MediaStatus } from '../../../hooks/useMediaStream';
import { useOccultMic, type OccultMicOptions } from '../../../hooks/useOccultMic';
import { useSoundTrigger, type SoundTriggerOptions } from '../../../hooks/useSoundTrigger';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { soundBadge, triggerTokens } from './tokens';

/** Hundred, for turning a 0-1 level into a percentage. */
const PERCENT = 100;

/**
 * Everything a {@link SoundTrigger} knows, passed to its render prop.
 */
export interface SoundTriggerState {
  /** `true` once the chosen sound has been held long enough. */
  triggered: boolean;
  /** `true` while the sound is being held but has not triggered yet. */
  holding: boolean;
  /** Which sound set it off, or `null`. */
  kind: SoundKind | null;
  /** Loudness from 0 to 1, refreshed about 20 times a second. */
  level: number;
  /** The same loudness, updated every frame without re-rendering. */
  levelRef: MutableRefObject<number>;
  /** The sound happening right now, or `null`. */
  sound: SoundKind | null;
  /** Microphone status. */
  status: MediaStatus;
  /** A readable explanation when something went wrong, otherwise `null`. */
  error: string | null;
  /** `true` while the microphone is live. */
  isListening: boolean;
  /** Asks for the microphone. Call from a click. */
  start: () => Promise<boolean>;
  /** Turns the microphone off. */
  stop: () => void;
  /** Clears the trigger so it can fire again. */
  reset: () => void;
}

/**
 * Props for {@link SoundTrigger}. Includes every option of
 * {@link useSoundTrigger} (`on`, `holdMs`, `resetAfterMs`, `onTrigger`) and of
 * {@link useOccultMic} (`thresholds`, `cooldownMs`, `updateHz`, `onSound`).
 */
export interface SoundTriggerProps extends SoundTriggerOptions, OccultMicOptions {
  /** Render prop. Receives the live state so you can change what you draw. */
  children?: (state: SoundTriggerState) => ReactNode;
  /**
   * Show the "Enable microphone" button, level meter, and status line. Turn
   * this off to supply your own controls using the render prop.
   * @default true
   */
  showControls?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the wrapper. */
  style?: CSSProperties;
}

const describeKinds = (on: SoundKind | readonly SoundKind[]): string =>
  (typeof on === 'string' ? [on] : on).join(' or ');

/**
 * Wraps content that reacts to the microphone. Breathing on the microphone,
 * a whisper, or a scream can change what you render.
 *
 * - The microphone is only requested when the user presses the button.
 * - Audio is analysed on the device and never recorded or sent anywhere.
 * - Listening stops when the component unmounts.
 *
 * Headphones are recommended: if your page plays sound in response, the
 * speakers can feed back into the microphone.
 *
 * Accessibility: the meter has `role="meter"` and the status line is a polite
 * live region. Sound is only ever an extra way to interact, so always keep a
 * normal way to do the same thing, such as a button.
 *
 * @example Blow out a candle
 * ```tsx
 * <SoundTrigger on="blow" holdMs={500}>
 *   {({ triggered, reset }) => (
 *     <>
 *       <Candle lit={!triggered} />
 *       {triggered && <button onClick={reset}>Relight</button>}
 *     </>
 *   )}
 * </SoundTrigger>
 * ```
 *
 * @example Screaming shakes the page
 * ```tsx
 * <SoundTrigger on="scream" resetAfterMs={800}>
 *   {({ triggered }) => <Panel shaking={triggered} />}
 * </SoundTrigger>
 * ```
 */
export const SoundTrigger = ({
  on = 'blow',
  holdMs,
  resetAfterMs,
  onTrigger,
  thresholds,
  cooldownMs,
  updateHz,
  onSound,
  children,
  showControls = true,
  className = '',
  style,
}: SoundTriggerProps) => {
  const mic = useOccultMic({ thresholds, cooldownMs, updateHz, onSound });
  const trigger = useSoundTrigger(mic, { on, holdMs, resetAfterMs, onTrigger });

  const state: SoundTriggerState = {
    triggered: trigger.triggered,
    holding: trigger.holding,
    kind: trigger.kind,
    level: mic.level,
    levelRef: mic.levelRef,
    sound: mic.sound,
    status: mic.status,
    error: mic.error,
    isListening: mic.isListening,
    start: mic.start,
    stop: mic.stop,
    reset: trigger.reset,
  };

  const { meter, colors, font, gap, transition } = triggerTokens;
  const requesting = mic.status === 'requesting';
  const problem = mic.status === 'denied' || mic.status === 'unavailable' || mic.status === 'error';

  const statusText = mic.isListening
    ? `Listening for ${describeKinds(on)}`
    : mic.error ?? (requesting ? 'Waiting for permission' : 'Microphone is off');

  return (
    <div
      className={`grave-sound-trigger ${className}`.trim()}
      style={{ display: 'flex', flexDirection: 'column', gap, ...style }}
    >
      {children?.(state)}

      {showControls && (
        <div style={{ display: 'flex', flexDirection: 'column', gap, fontFamily: font.family }}>
          <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant={mic.isListening ? 'secondary' : 'gothic'}
              disabled={requesting}
              onClick={() => (mic.isListening ? mic.stop() : void mic.start())}
            >
              {mic.isListening ? 'Stop listening' : requesting ? 'Waiting...' : 'Enable microphone'}
            </Button>

            {mic.sound && (
              <Badge size="sm" variant={soundBadge[mic.sound]}>
                {mic.sound}
              </Badge>
            )}
          </div>

          <div
            role="meter"
            aria-label="Microphone level"
            aria-valuemin={0}
            aria-valuemax={PERCENT}
            aria-valuenow={Math.round(mic.level * PERCENT)}
            style={{
              height: meter.height,
              borderRadius: meter.radius,
              backgroundColor: colors.track,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${mic.level * PERCENT}%`,
                height: '100%',
                backgroundColor: colors.fill,
                transition,
              }}
            />
          </div>

          <p
            role="status"
            aria-live="polite"
            style={{
              margin: 0,
              fontSize: font.size,
              color: problem ? colors.error : colors.text,
            }}
          >
            {statusText}
          </p>
        </div>
      )}
    </div>
  );
};
