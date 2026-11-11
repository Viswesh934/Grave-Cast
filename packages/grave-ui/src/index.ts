/**
 * groove-ui
 * 
 * A horror-themed React component library with folklore-inspired design primitives.
 * Built with radical reusability at its core.
 * 
 * @example
 * ```tsx
 * import { TombstoneCard, AudioProvider } from 'groove-ui';
 * 
 * <AudioProvider initialEnabled={true}>
 *   <TombstoneCard title="Here Lies..." subtitle="1847-1923" cracked />
 * </AudioProvider>
 * ```
 * 
 * @packageDocumentation
 */

// Design tokens
export * from './tokens';

// React hooks
export * from './hooks';

// SVG assets and filters
export * from './assets';

// Audio system
export * from './audio';

// ASCII toolkit
export * from './ascii';

// Video toolkit: motion, color grades, timecodes
export * from './video';

// Voice toolkit: personas, speech voices, recording gate, effects
export * from './voice';

// Voice studio: projects, timeline, lyric singer
export * from './studio';

// Components
export * from './components';
