/**
 * WAV encoding for downloading sound effects.
 *
 * @module audio/effects/wav
 */

/** Bytes in a standard WAV header. */
const HEADER_BYTES = 44;

/** Bytes per 16-bit sample. */
const BYTES_PER_SAMPLE = 2;

/** Largest 16-bit sample magnitudes. */
const PCM_MAX = 0x7fff;
const PCM_MIN = 0x8000;

/** Peak level that downloaded effects are normalised to. */
export const WAV_NORMALIZE_PEAK = 0.89;

const writeText = (view: DataView, offset: number, text: string): void => {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
};

/**
 * Scales samples so the loudest one hits the target peak. Quiet effects get
 * louder and nothing clips. Silent input is returned unchanged.
 */
export const normalizeSamples = (samples: Float32Array, peak: number = WAV_NORMALIZE_PEAK): Float32Array => {
  let loudest = 0;
  for (let i = 0; i < samples.length; i += 1) {
    loudest = Math.max(loudest, Math.abs(samples[i]));
  }
  if (loudest === 0) return samples;

  const gain = peak / loudest;
  const result = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    result[i] = samples[i] * gain;
  }
  return result;
};

/**
 * Encodes audio as a 16-bit PCM WAV file.
 *
 * @param channels - One array of samples per channel, from -1 to 1.
 * @param sampleRate - Samples per second.
 * @returns A `audio/wav` blob.
 */
export const encodeWav = (channels: readonly Float32Array[], sampleRate: number): Blob => {
  const channelCount = channels.length;
  const frames = channels[0]?.length ?? 0;
  const dataBytes = frames * channelCount * BYTES_PER_SAMPLE;

  const buffer = new ArrayBuffer(HEADER_BYTES + dataBytes);
  const view = new DataView(buffer);

  writeText(view, 0, 'RIFF');
  view.setUint32(4, HEADER_BYTES - 8 + dataBytes, true);
  writeText(view, 8, 'WAVE');
  writeText(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * BYTES_PER_SAMPLE, true);
  view.setUint16(32, channelCount * BYTES_PER_SAMPLE, true);
  view.setUint16(34, BYTES_PER_SAMPLE * 8, true);
  writeText(view, 36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = HEADER_BYTES;
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * PCM_MIN : sample * PCM_MAX, true);
      offset += BYTES_PER_SAMPLE;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
};
