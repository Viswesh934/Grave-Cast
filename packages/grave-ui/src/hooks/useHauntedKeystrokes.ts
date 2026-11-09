/**
 * useHauntedKeystrokes - Turn the keyboard into an instrument
 * @module hooks/useHauntedKeystrokes
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { noteName } from '../audio';
import type { NoteSystem, Synth, SynthConfig, VoiceHandle } from '../audio';
import { useSpookyMusic } from './useSpookyMusic';

/**
 * Default key rows, bottom row first. Each row covers one octave of the
 * scale, so the keyboard climbs from the tonic as you move up the rows.
 */
export const DEFAULT_KEY_ROWS: readonly string[] = ['zxcvbnm', 'asdfghjkl', 'qwertyuiop', '1234567890'];

/** Seconds a key sounds in non-sustain mode. */
export const DEFAULT_KEY_DURATION = 0.6;

/** Milliseconds a tapped key stays lit when triggered without a held press. */
const KEY_TAP_MS = 140;

/**
 * One mapped key.
 */
export interface HauntedKey {
  /** The lowercase key character. */
  key: string;
  /** Row index, 0 for the bottom row. */
  row: number;
  /** Scale degree the key plays. */
  degree: number;
  /** MIDI number of the pitch. */
  midi: number;
  /** Note name in the chosen label system. */
  label: string;
}

/**
 * Passed to `onKeystroke` when a key sounds.
 */
export interface HauntedKeystroke {
  key: string;
  degree: number;
  midi: number;
  /** Frequency in Hz under the active tuning. */
  frequency: number;
  label: string;
}

/**
 * Options for {@link useHauntedKeystrokes}. Extends the synth config, so
 * `scale`, `tonic`, `tuning`, `instrument`, and `volume` all apply.
 */
export interface HauntedKeystrokesOptions extends SynthConfig {
  /** Listen for physical key presses. Clicking on-screen keys always works. @default true */
  enabled?: boolean;
  /** Key rows, bottom first. @default DEFAULT_KEY_ROWS */
  rows?: readonly string[];
  /** Shift the whole keyboard up or down by octaves. @default 0 */
  octaveShift?: number;
  /** Naming system for key labels. @default 'sargam' */
  labelSystem?: NoteSystem;
  /** Hold notes while the key is down instead of a fixed length. @default false */
  sustain?: boolean;
  /** Seconds each note sounds when `sustain` is off. @default 0.6 */
  duration?: number;
  /** Skip key presses made inside inputs, textareas, and editable areas. @default true */
  ignoreEditable?: boolean;
  /** Called whenever a key sounds. Use it to drive sparks, shakes, or logs. */
  onKeystroke?: (stroke: HauntedKeystroke) => void;
}

/**
 * Return value of {@link useHauntedKeystrokes}.
 */
export interface HauntedKeystrokesReturn {
  /** The underlying synth, for playing other notes alongside the keys. */
  music: Synth;
  /** Key map by row, bottom row first. */
  layout: readonly (readonly HauntedKey[])[];
  /** Keys currently down. */
  activeKeys: ReadonlySet<string>;
  /** Starts a key. Ignored if it is already down or unmapped. */
  press: (key: string) => void;
  /** Releases a key. */
  release: (key: string) => void;
  /** Presses and releases a key after a short flash. */
  tap: (key: string) => void;
}

const EDITABLE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

const isEditableTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || EDITABLE_TAGS.includes(target.tagName));

/**
 * Maps the keyboard onto a scale so every key press sounds in key.
 *
 * Each row climbs one octave, and keys within a row climb the scale, so
 * mashing keys always sounds musical. Pair it with a dark scale like `todi`
 * or `phrygian` for the haunted effect.
 *
 * @example
 * ```tsx
 * const { activeKeys } = useHauntedKeystrokes({
 *   scale: 'todi',
 *   tonic: 'D3',
 *   instrument: 'glass',
 *   onKeystroke: ({ label }) => console.log(label),
 * });
 * ```
 */
export const useHauntedKeystrokes = (
  options: HauntedKeystrokesOptions = {}
): HauntedKeystrokesReturn => {
  const {
    enabled = true,
    rows = DEFAULT_KEY_ROWS,
    octaveShift = 0,
    labelSystem = 'sargam',
    sustain = false,
    duration = DEFAULT_KEY_DURATION,
    ignoreEditable = true,
    onKeystroke,
    scale,
    tonic,
    tuning,
    instrument,
    volume,
  } = options;

  const music = useSpookyMusic({ scale, tonic, tuning, instrument, volume });

  const layout = useMemo<readonly (readonly HauntedKey[])[]>(
    () =>
      rows.map((row, rowIndex) =>
        Array.from(row).map((key, index) => {
          const degree = (rowIndex + octaveShift) * music.scale.size + index;
          const midi = music.scale.degree(degree);
          return {
            key,
            row: rowIndex,
            degree,
            midi,
            label: noteName(midi, music.tonic, labelSystem),
          };
        })
      ),
    [rows, octaveShift, labelSystem, music]
  );

  const keyMap = useMemo(() => {
    const map = new Map<string, HauntedKey>();
    layout.forEach((row) => row.forEach((entry) => map.set(entry.key, entry)));
    return map;
  }, [layout]);

  const [activeKeys, setActiveKeys] = useState<ReadonlySet<string>>(() => new Set());
  const held = useRef(new Map<string, VoiceHandle | null>());
  const onKeystrokeRef = useRef(onKeystroke);
  onKeystrokeRef.current = onKeystroke;

  const press = useCallback(
    (key: string) => {
      const entry = keyMap.get(key);
      if (!entry || held.current.has(key)) return;

      const handle = music.note(entry.midi, { duration: sustain ? Infinity : duration });
      held.current.set(key, sustain ? handle : null);
      setActiveKeys((previous) => new Set(previous).add(key));

      onKeystrokeRef.current?.({
        key,
        degree: entry.degree,
        midi: entry.midi,
        frequency: music.frequencyOf(entry.midi),
        label: entry.label,
      });
    },
    [keyMap, music, sustain, duration]
  );

  const release = useCallback((key: string) => {
    if (!held.current.has(key)) return;
    held.current.get(key)?.stop();
    held.current.delete(key);
    setActiveKeys((previous) => {
      const next = new Set(previous);
      next.delete(key);
      return next;
    });
  }, []);

  const tap = useCallback(
    (key: string) => {
      press(key);
      window.setTimeout(() => release(key), KEY_TAP_MS);
    },
    [press, release]
  );

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const releaseAll = () => Array.from(held.current.keys()).forEach(release);

    const handleDown = (event: KeyboardEvent) => {
      if (typeof event.key !== 'string' || event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (ignoreEditable && isEditableTarget(event.target)) return;
      press(event.key.toLowerCase());
    };

    const handleUp = (event: KeyboardEvent) => {
      if (typeof event.key !== 'string') return;
      release(event.key.toLowerCase());
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('blur', releaseAll);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      window.removeEventListener('blur', releaseAll);
      releaseAll();
    };
  }, [enabled, ignoreEditable, press, release]);

  // Let go of anything still sounding when the component unmounts.
  useEffect(() => {
    const heldNotes = held.current;
    return () => {
      heldNotes.forEach((handle) => handle?.stop());
      heldNotes.clear();
    };
  }, []);

  return { music, layout, activeKeys, press, release, tap };
};
