/**
 * ClickToBegin - A one-time "click to begin" prompt that unlocks audio.
 * @module components/effects/ClickToBegin/ClickToBegin
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { resumeAudioContext, useSpookyAudio, type SpookySound } from '../../../audio';
import { useMediaQuery, breakpoints } from '../../../hooks/useMediaQuery';
import { bgAnimation, backgroundKeyframes } from '../HorrorBackground/styles';
import { withAlpha } from '../HorrorBackground/tokens';
import { PROMPT_Z_INDEX, promptTokens } from './tokens';

/**
 * Props for {@link ClickToBegin}.
 */
export interface ClickToBeginProps {
  /** Main text of the prompt. @default 'Click to begin' */
  label?: string;
  /** Smaller line under the label. Pass an empty string to hide it. @default 'Sound will play' */
  hint?: string;
  /** A sound effect to play on the click, such as `portalOpen`. */
  sound?: SpookySound;
  /**
   * Turn the global audio switch on when the prompt is clicked. The click is
   * the user's consent, so this makes audio opt-in. Needs an `AudioProvider`.
   * @default true
   */
  enableAudio?: boolean;
  /** Cover the whole viewport instead of the nearest positioned parent. @default false */
  fixed?: boolean;
  /** Stacking order. @default 10 */
  zIndex?: number;
  /** Called once, when the prompt is clicked. Start your music or animation here. */
  onBegin?: () => void;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the prompt. */
  style?: CSSProperties;
}

type Phase = 'waiting' | 'leaving' | 'gone';

/**
 * A full-cover prompt that asks for a single click, then gets out of the way
 * for good.
 *
 * Browsers keep audio locked until the user interacts, so this is the
 * friendly way to start sound: the click wakes the audio context, can turn
 * global audio on, can play a sound, and calls `onBegin` so you can start a
 * drone or an animation. After that the prompt fades out and unmounts, so
 * there is nothing left to click and nothing left listening.
 *
 * It is a real button, so it works with a mouse, touch, and the Enter and
 * Space keys. Reduced-motion users skip the fade and pulse.
 *
 * @example
 * ```tsx
 * const music = useSpookyMusic({ scale: 'marwa', tonic: 'D3' });
 *
 * <section style={{ position: 'relative', isolation: 'isolate' }}>
 *   <HorrorBackground variant="hypnotic" />
 *   <ClickToBegin sound="portalOpen" onBegin={() => music.drone()} />
 * </section>
 * ```
 */
export const ClickToBegin = ({
  label = 'Click to begin',
  hint = 'Sound will play',
  sound,
  enableAudio = true,
  fixed = false,
  zIndex = PROMPT_Z_INDEX,
  onBegin,
  className = '',
  style,
}: ClickToBeginProps) => {
  const { playSound, setEnabled } = useSpookyAudio();
  const prefersReducedMotion = useMediaQuery(breakpoints.reducedMotion);
  const [phase, setPhase] = useState<Phase>('waiting');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (phase === 'gone') return null;

  const begin = () => {
    if (phase !== 'waiting') return;

    void resumeAudioContext();
    if (enableAudio) setEnabled(true);
    if (sound) playSound(sound);
    onBegin?.();

    setPhase('leaving');
    timer.current = window.setTimeout(
      () => setPhase('gone'),
      prefersReducedMotion ? 0 : promptTokens.fadeMs
    );
  };

  const { colors, font } = promptTokens;
  const leaving = phase === 'leaving';

  return (
    <>
      <style>{backgroundKeyframes}</style>
      <button
        type="button"
        onClick={begin}
        className={`grave-click-to-begin ${className}`.trim()}
        style={{
          position: fixed ? 'fixed' : 'absolute',
          inset: 0,
          zIndex,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: promptTokens.gap,
          padding: 0,
          border: 'none',
          cursor: 'pointer',
          color: colors.label,
          fontFamily: font.family,
          backgroundColor: withAlpha(colors.overlay, colors.overlayStrength),
          opacity: leaving ? 0 : 1,
          pointerEvents: leaving ? 'none' : 'auto',
          transition: prefersReducedMotion
            ? 'none'
            : `opacity ${promptTokens.fadeMs}ms ${promptTokens.easing}`,
          ...style,
        }}
      >
        <span
          style={{
            fontSize: font.label,
            letterSpacing: promptTokens.letterSpacing,
            textTransform: 'uppercase',
            animation: prefersReducedMotion
              ? 'none'
              : `${bgAnimation.pulse} ${promptTokens.pulseSeconds}s ease-in-out infinite`,
          }}
        >
          {label}
        </span>
        {hint && <span style={{ fontSize: font.hint, color: colors.hint }}>{hint}</span>}
      </button>
    </>
  );
};
