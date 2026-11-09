/**
 * Audio system - procedural Web Audio API synthesis
 * @module audio
 */

// Low-level audio engine
export * from './SpookyAudio';

// Sound effects: the catalog and the engine that plays it
export * from './effects';

// Music system: scales, ragas, instruments, synth
export * from './music';

// React context and hooks
export * from './AudioContext';
export type { SpookySound } from './AudioContext';
