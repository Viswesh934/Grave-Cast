/**
 * GhostRun: a small endless runner, where a ghost drifts left through a graveyard.
 * @module components/effects/GhostRun
 */
export { GhostRun, type GhostRunProps, type GhostRunSounds } from './GhostRun';
export { GhostIcon, type GhostIconProps } from './GhostIcon';
export {
  createGhostRun,
  startGhostRun,
  stepGhostRun,
  jumpGhost,
  ghostRunMetres,
  ghostRunScore,
  type GhostRunPhase,
  type GhostRunState,
  type GhostRunTombstone,
  type GhostRunCoin,
  type GhostRunEvents,
  type GhostRunRandom,
} from './ghostRunEngine';
export { ghostRunTokens } from './tokens';
