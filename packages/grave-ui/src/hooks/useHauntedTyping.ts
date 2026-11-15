/**
 * useHauntedTyping - Eerie notes while someone types in a field
 * @module hooks/useHauntedTyping
 */
import { useHauntedKeystrokes, type HauntedKeystrokesOptions, type HauntedKeystrokesReturn } from './useHauntedKeystrokes';

/** The haunted typing sound: a dark scale on glass, an octave low, short and quiet. */
export const HAUNTED_TYPING_PRESET = {
  scale: 'todi',
  instrument: 'glass',
  octaveShift: -1,
  duration: 0.45,
  volume: 0.3,
} as const satisfies HauntedKeystrokesOptions;

/**
 * Plays a note for each letter or number typed while `active`, such as while a
 * text field has focus. It stays silent until sound is switched on through
 * `AudioProvider`, like every other Groove UI sound.
 *
 * @example
 * ```tsx
 * const [typing, setTyping] = useState(false);
 * useHauntedTyping(typing);
 * <input onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} />
 * ```
 */
export const useHauntedTyping = (active: boolean, options: HauntedKeystrokesOptions = {}): HauntedKeystrokesReturn =>
  useHauntedKeystrokes({
    ...HAUNTED_TYPING_PRESET,
    ...options,
    enabled: active && (options.enabled ?? true),
    // Typing in a field is the point, so editable targets are not ignored.
    ignoreEditable: false,
  });
