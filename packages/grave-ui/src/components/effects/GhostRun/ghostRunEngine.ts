/**
 * The ghost run's rules: where everything is, how it moves, and what counts as
 * a coin or a crash. Pure data and functions, with no drawing, so the game can
 * be tested and run anywhere.
 * @module components/effects/GhostRun/ghostRunEngine
 */
import { ghostRunTokens as t } from './tokens';

/** Waiting to start, being played, or over after hitting a tombstone. */
export type GhostRunPhase = 'ready' | 'running' | 'over';

/** A tombstone. `x` is its left edge; the world moves right, towards the ghost. */
export interface GhostRunTombstone {
  x: number;
  width: number;
  height: number;
}

/** A coin. `x` is its centre; `lift` is how high its centre hangs above the ground. */
export interface GhostRunCoin {
  x: number;
  lift: number;
}

export interface GhostRunState {
  phase: GhostRunPhase;
  /** How high the bottom of the ghost is above the ground. 0 is on the ground. */
  ghostLift: number;
  /** How fast the ghost is rising. Negative while it falls. */
  ghostRise: number;
  /** How fast the world moves, in field units per second. */
  speed: number;
  /** Seconds played this run. */
  elapsed: number;
  /** Field units travelled this run. */
  travelled: number;
  coins: number;
  tombstones: GhostRunTombstone[];
  pickups: GhostRunCoin[];
  /** Seconds until the next tombstone appears at the left edge. */
  nextTombstoneIn: number;
}

/** What happened during one step, so the game can play a sound for it. */
export interface GhostRunEvents {
  /** Coins taken in this step. */
  coins: number;
  /** Whether the ghost hit a tombstone in this step. */
  crashed: boolean;
}

/** A source of random numbers from 0 up to 1. Pass a fixed one to replay a run. */
export type GhostRunRandom = () => number;

const between = (random: GhostRunRandom, low: number, high: number): number => low + (high - low) * random();

/** A game waiting for its first jump. */
export const createGhostRun = (): GhostRunState => ({
  phase: 'ready',
  ghostLift: 0,
  ghostRise: 0,
  speed: t.speed.start,
  elapsed: 0,
  travelled: 0,
  coins: 0,
  tombstones: [],
  pickups: [],
  nextTombstoneIn: t.stoneGap.first,
});

/** A fresh run, already moving. */
export const startGhostRun = (): GhostRunState => ({ ...createGhostRun(), phase: 'running' });

/** Metres travelled this run, as the score shows them. */
export const ghostRunMetres = (state: GhostRunState): number => Math.floor(state.travelled / t.unitsPerMetre);

/** The run's score: metres travelled, plus each coin's worth. */
export const ghostRunScore = (state: GhostRunState): number => ghostRunMetres(state) + state.coins * t.coinScore;

/** Lifts the ghost if it is on the ground. Returns whether it jumped. */
export const jumpGhost = (state: GhostRunState): boolean => {
  if (state.phase !== 'running' || state.ghostLift > 0) return false;
  state.ghostRise = t.jumpSpeed;
  return true;
};

/** How far through the speed range the run is, from 0 at the start to 1 at full speed. */
const progressOf = (speed: number): number => (speed - t.speed.start) / (t.speed.max - t.speed.start);

/** Seconds until the tombstone after this one. The longest gaps shorten as the run speeds up. */
const nextGap = (speed: number, random: GhostRunRandom): number => {
  const longest = t.stoneGap.max - (t.stoneGap.max - t.stoneGap.tightMax) * progressOf(speed);
  return between(random, t.stoneGap.min, longest);
};

/** A new tombstone just off the left edge, and sometimes a row of coins that will arrive halfway to the next one. */
const spawn = (state: GhostRunState, gap: number, random: GhostRunRandom): void => {
  const width = between(random, t.tombstone.minWidth, t.tombstone.maxWidth);
  state.tombstones.push({ x: -width, width, height: between(random, t.tombstone.minHeight, t.tombstone.maxHeight) });
  if (random() >= t.coin.rowChance) return;
  const lift = random() < t.coin.airChance ? t.coin.airLift : t.coin.groundLift;
  const count = 1 + Math.floor(random() * t.coin.rowMax);
  // Further left arrives later: half a gap behind this tombstone is halfway to the next one.
  const middle = -width - (state.speed * gap) / 2;
  const first = middle + ((count - 1) * t.coin.spacing) / 2;
  for (let i = 0; i < count; i++) state.pickups.push({ x: first - i * t.coin.spacing, lift });
};

/** The ghost's hit box, from its left edge to its right, and from its bottom to its top above the ground. */
const ghostBox = (state: GhostRunState) => ({
  left: t.ghost.x + t.hitInset,
  right: t.ghost.x + t.ghost.width - t.hitInset,
  bottom: state.ghostLift + t.hitInset,
  top: state.ghostLift + t.ghost.height - t.hitInset,
});

/**
 * Moves the game on by `seconds` (never more than `maxStepSeconds` at once).
 * Changes `state` in place and says what happened.
 */
export const stepGhostRun = (state: GhostRunState, seconds: number, random: GhostRunRandom = Math.random): GhostRunEvents => {
  const events: GhostRunEvents = { coins: 0, crashed: false };
  if (state.phase !== 'running') return events;
  const dt = Math.min(Math.max(seconds, 0), t.maxStepSeconds);

  state.elapsed += dt;
  state.speed = Math.min(t.speed.max, state.speed + t.speed.gainPerSecond * dt);
  const moved = state.speed * dt;
  state.travelled += moved;

  // The ghost rises, slows, and falls back to the ground.
  if (state.ghostLift > 0 || state.ghostRise > 0) {
    state.ghostRise -= t.gravity * dt;
    state.ghostLift += state.ghostRise * dt;
    if (state.ghostLift <= 0) {
      state.ghostLift = 0;
      state.ghostRise = 0;
    }
  }

  // Everything drifts right, towards the ghost, and is dropped once it is past the edge.
  const edge = t.field.width + t.offscreen;
  for (const stone of state.tombstones) stone.x += moved;
  for (const coin of state.pickups) coin.x += moved;
  state.tombstones = state.tombstones.filter((stone) => stone.x < edge);

  state.nextTombstoneIn -= dt;
  if (state.nextTombstoneIn <= 0) {
    const gap = nextGap(state.speed, random);
    spawn(state, gap, random);
    state.nextTombstoneIn += gap;
  }

  const ghost = ghostBox(state);
  const kept: GhostRunCoin[] = [];
  for (const coin of state.pickups) {
    const touching =
      coin.x + t.coin.radius > ghost.left &&
      coin.x - t.coin.radius < ghost.right &&
      coin.lift + t.coin.radius > ghost.bottom &&
      coin.lift - t.coin.radius < ghost.top;
    if (touching) events.coins += 1;
    else if (coin.x < edge) kept.push(coin);
  }
  state.pickups = kept;
  state.coins += events.coins;

  events.crashed = state.tombstones.some(
    (stone) => stone.x + stone.width - t.hitInset > ghost.left && stone.x + t.hitInset < ghost.right && stone.height - t.hitInset > ghost.bottom
  );
  if (events.crashed) state.phase = 'over';
  return events;
};
