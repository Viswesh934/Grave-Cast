/**
 * Grimoire: easy, haunted wrappers around the browser's built-in powers.
 *
 * This entry holds the plain building blocks. The hooks that drive rites
 * (`useRite`, `useCapability`, `usePermissionState`) live in `groove-ui/hooks`.
 *
 * @example
 * ```ts
 * import { defineCapability, classifyRiteError } from 'groove-ui/grimoire';
 * ```
 *
 * @module grimoire
 */

export * from './core';
export * from './tokens';
export * from './color';
export * from './dom';

// The frames and overlays, so one import covers a rite's logic and its look.
export * from '../components/grimoire';
