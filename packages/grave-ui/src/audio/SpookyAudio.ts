/**
 * SpookyAudio - Procedural Web Audio API sound synthesis engine
 * Zero external audio files - all sounds generated procedurally
 * @module audio/SpookyAudio
 */

/**
 * Available sound effects
 */
export type SoundEffectType = 'stoneGrind' | 'coffinCreak' | 'boneClick' | 'cauldronBubble';

/**
 * Audio context singleton
 */
let audioContext: AudioContext | null = null;

/**
 * Global volume control (0-1)
 */
let globalVolume = 0.5;

/**
 * Initialize audio context (lazy initialization)
 */
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined' || !window.AudioContext) {
    return null;
  }
  
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  
  return audioContext;
};

/**
 * Stone grinding sound - brown noise with bandpass filter
 */
const playStoneGrind = (volume: number = globalVolume): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.3;
  const now = ctx.currentTime;

  // Create brown noise using buffer
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3; // Amplify
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Bandpass filter for stone texture
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400;
  filter.Q.value = 1;

  // Volume control
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume * 0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration);
};

/**
 * Coffin creak sound - square wave with pitch decay
 */
const playCoffinCreak = (volume: number = globalVolume): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.5;
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(200, now);
  oscillator.frequency.exponentialRampToValueAtTime(100, now + duration);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume * 0.2, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
};

/**
 * Bone click sound - sharp transient impulse
 */
const playBoneClick = (volume: number = globalVolume): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.05;
  const now = ctx.currentTime;

  // Create sharp click using white noise burst
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // High-pass filter for bone quality
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume * 0.4, now);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration);
};

/**
 * Cauldron bubble sound - sine sweep with resonance
 */
const playCauldronBubble = (volume: number = globalVolume): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const duration = 0.4;
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(100, now);
  oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
  oscillator.frequency.exponentialRampToValueAtTime(80, now + duration);

  // Add resonant filter for bubble quality
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 200;
  filter.Q.value = 10; // High resonance

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
};

/**
 * Play a sound effect by name
 */
export const playSound = (effect: SoundEffectType, volume?: number): void => {
  switch (effect) {
    case 'stoneGrind':
      playStoneGrind(volume);
      break;
    case 'coffinCreak':
      playCoffinCreak(volume);
      break;
    case 'boneClick':
      playBoneClick(volume);
      break;
    case 'cauldronBubble':
      playCauldronBubble(volume);
      break;
  }
};

/**
 * Set global volume (0-1)
 */
export const setGlobalVolume = (volume: number): void => {
  globalVolume = Math.max(0, Math.min(1, volume));
};

/**
 * Get current global volume
 */
export const getGlobalVolume = (): number => {
  return globalVolume;
};

/**
 * Resume audio context (required after user interaction on some browsers)
 */
export const resumeAudioContext = async (): Promise<void> => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume();
  }
};
