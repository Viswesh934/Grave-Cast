/**
 * StudioSlider - A labelled range control that shows its value.
 * @module components/effects/VoiceStudio/StudioSlider
 */

import { useId } from 'react';
import { labelStyle, studioTokens } from './tokens';

/**
 * Props for {@link StudioSlider}.
 */
export interface StudioSliderProps {
  /** What the slider changes. Also its accessible name. */
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Called with the new value as it moves. */
  onChange: (value: number) => void;
  /** Shown after the value, such as `Hz`. */
  unit?: string;
  /** Turns the value into text for display and for screen readers. */
  format?: (value: number) => string;
  disabled?: boolean;
}

/** Most decimal places a value is shown with. */
const MAX_DECIMALS = 3;

/** Digits shown for values that move in steps smaller than one. */
const decimalsFor = (step: number): number => (step >= 1 ? 0 : Math.min(MAX_DECIMALS, Math.ceil(-Math.log10(step))));

/**
 * A native range input with a visible label and value. It works with the
 * keyboard (arrows, Page Up/Down, Home/End) and reads its value aloud.
 */
export const StudioSlider = ({ label, value, min, max, step, onChange, unit, format, disabled = false }: StudioSliderProps) => {
  const id = useId();
  const text = format ? format(value) : `${value.toFixed(decimalsFor(step))}${unit ? ` ${unit}` : ''}`;

  return (
    <div style={{ minWidth: 0 }}>
      <label htmlFor={id} style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between', gap: studioTokens.space.sm }}>
        <span>{label}</span>
        <output htmlFor={id} style={{ fontFamily: studioTokens.font.mono, color: studioTokens.colors.text }}>
          {text}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={text}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: '100%', accentColor: studioTokens.colors.playhead }}
      />
    </div>
  );
};
