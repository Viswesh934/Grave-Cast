/**
 * Audio system - procedural Web Audio API synthesis
 * @module audio
 */

// Low-level audio engine
export * from './SpookyAudio';

// Music system: scales, ragas, instruments, synth
export * from './music';

// React context and hooks
export * from './AudioContext';
export type { SpookySound } from './AudioContext';
