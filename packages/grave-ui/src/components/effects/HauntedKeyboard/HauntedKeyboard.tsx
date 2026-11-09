/**
 * HauntedKeyboard - A playable on-screen keyboard locked to a scale.
 * @module components/effects/HauntedKeyboard/HauntedKeyboard
 */

import type { CSSProperties } from 'react';
import { useHauntedKeystrokes, type HauntedKeystrokesOptions } from '../../../hooks/useHauntedKeystrokes';
import { keyboardTokens } from './tokens';

/**
 * Props for {@link HauntedKeyboard}. Extends the keystroke options, so scale,
 * tonic, tuning, instrument, volume, rows, sustain, and `onKeystroke` all work.
 */
export interface HauntedKeyboardProps extends HauntedKeystrokesOptions {
  /** Show the note name under each key. @default true */
  showLabels?: boolean;
  /** Additional CSS classes for the keyboard wrapper. */
  className?: string;
  /** Inline styles for the keyboard wrapper. */
  style?: CSSProperties;
}

/**
 * A keyboard where every key plays a note from the chosen scale.
 *
 * Physical key presses and pointer presses both sound, so it works with a
 * keyboard, mouse, or touch. Because the keys are locked to a scale, any
 * sequence of presses sounds in key. Choose a dark scale such as `todi`,
 * `phrygian`, or `marwa` and a bell or ghost instrument for the haunted feel.
 *
 * Sound follows the global audio switch from `AudioProvider`. Key presses
 * inside inputs and textareas are ignored by default.
 *
 * Accessibility: keys are buttons with labels, and `aria-pressed` reflects
 * which are sounding. Enter and Space on a focused key play it.
 *
 * @example
 * ```tsx
 * <HauntedKeyboard scale="todi" tonic="D3" instrument="glass" />
 * ```
 *
 * @example React to every note
 * ```tsx
 * <HauntedKeyboard
 *   scale="phrygian"
 *   labelSystem="solfege"
 *   onKeystroke={({ label, frequency }) => console.log(label, frequency)}
 * />
 * ```
 */
export const HauntedKeyboard = ({
  showLabels = true,
  className = '',
  style,
  ...options
}: HauntedKeyboardProps) => {
  const { layout, activeKeys, press, release, tap } = useHauntedKeystrokes(options);
  const { key: keySize, colors, shadow, font, rowStagger, transition } = keyboardTokens;

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: keySize.gap,
    fontFamily: font.family,
    ...style,
  };

  return (
    <div
      role="group"
      aria-label="Haunted keyboard"
      className={`grave-haunted-keyboard ${className}`.trim()}
      style={wrapperStyle}
    >
      {layout.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'flex',
            gap: keySize.gap,
            marginLeft: (layout.length - 1 - rowIndex) * rowStagger * keySize.width,
          }}
        >
          {row.map((entry) => {
            const active = activeKeys.has(entry.key);
            return (
              <button
                key={entry.key}
                type="button"
                aria-pressed={active}
                aria-label={`${entry.key.toUpperCase()}, ${entry.label}`}
                onPointerDown={(event) => {
                  if (event.button === 0) press(entry.key);
                }}
                onPointerUp={() => release(entry.key)}
                onPointerLeave={() => release(entry.key)}
                onPointerCancel={() => release(entry.key)}
                onClick={(event) => {
                  // detail is 0 for keyboard-initiated clicks (Enter, Space).
                  if (event.detail === 0) tap(entry.key);
                }}
                style={{
                  width: keySize.width,
                  height: keySize.height,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: keySize.border,
                  cursor: 'pointer',
                  touchAction: 'none',
                  userSelect: 'none',
                  fontFamily: 'inherit',
                  fontSize: font.key,
                  color: active ? colors.textActive : colors.text,
                  backgroundColor: active ? colors.surfaceActive : colors.surface,
                  border: `${keySize.border}px solid ${active ? colors.borderActive : colors.border}`,
                  borderRadius: keySize.radius,
                  boxShadow: active ? shadow.active : shadow.rest,
                  transform: active ? `translateY(${keySize.pressDepth}px)` : 'none',
                  transition,
                }}
              >
                <span>{entry.key.toUpperCase()}</span>
                {showLabels && (
                  <span style={{ fontSize: font.label, color: colors.label }}>{entry.label}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
