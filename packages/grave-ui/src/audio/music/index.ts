/**
 * Music system: theory, scales, instruments, and a scale-aware synth.
 *
 * Layers, from the bottom up:
 * 1. `theory`: note names (sargam, solfege, letters), tuning, pitch math
 * 2. `scales`: scales and ragas as interval lists
 * 3. `instruments`: timbre recipes
 * 4. `voice`: renders an instrument at a frequency
 * 5. `synth`: ties scale, tuning, and instrument into a simple player
 *
 * @module audio/music
 */

export * from './theory';
export * from './scales';
export * from './instruments';
export * from './voice';
export * from './synth';
