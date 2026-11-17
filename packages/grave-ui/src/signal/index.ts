/**
 * Signals that do a job: Morse code by light, sound and vibration, a steady beat,
 * the phone's torch, compass and level readings, and keeping the screen on.
 * Plain on purpose: no 3D, no spooky effects. Import it on its own as
 * `groove-ui/signal` so a page loads only this.
 * @module signal
 */
export * from './tokens';
export * from './morse';
export * from './rtty';
export * from './radioStatic';
export * from './shake';
export * from './sound';
export * from './speech';
export * from './light';
export * from './orientation';
export * from '../hooks/useWakeLock';
export * from '../hooks/useOrientation';
