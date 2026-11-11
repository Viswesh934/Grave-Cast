/**
 * Waveform - Draws a recording's outline from its peaks.
 * @module components/effects/VoiceStudio/Waveform
 */

/**
 * Props for {@link Waveform}.
 */
export interface WaveformProps {
  /** Loudness per bucket, 0-1, for example from `computePeaks`. */
  peaks: readonly number[];
  /** Color of the bars. */
  color: string;
}

/**
 * A decorative waveform that stretches to fill its box. It is hidden from
 * screen readers; describe the recording in text next to it.
 */
export const Waveform = ({ peaks, color }: WaveformProps) => {
  const count = Math.max(1, peaks.length);
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${count} 2`}
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      {peaks.map((peak, index) => (
        <rect key={index} x={index} y={1 - peak} width={1} height={Math.max(peak * 2, Number.EPSILON)} fill={color} />
      ))}
    </svg>
  );
};
