/**
 * Where everything in the walk stands, and how the witch finds her way. Pure:
 * no three.js and no React, the same answer for the same graves every time.
 *
 * The ground is the x–z plane. The gate is at the front (z = 0) and the yard
 * runs back into negative z, so the witch starts outside it, looking in.
 *
 * @module components/horror3d/GraveyardWalk3D/layout
 */
import { walkWitch, walkYard } from './tokens';

/** A point on the ground. */
export interface WalkPoint {
  x: number;
  z: number;
}

/** One grave's place in the yard. */
export interface WalkGraveSpot extends WalkPoint {
  /** Turn from facing the gate, in radians. */
  turn: number;
  kind: 'arch' | 'slab';
}

/** The whole yard, worked out from how many graves it holds. */
export interface WalkYardLayout {
  /** In the order the graves were given. The first stands nearest the gate. */
  graves: WalkGraveSpot[];
  /** The fence's inside edges. */
  fence: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Just inside the gate, where every first flight goes through. */
  gate: WalkPoint;
  /** Where the witch waits, outside the gate. */
  start: WalkPoint;
  /** Lantern posts among the graves. */
  lanterns: WalkPoint[];
}

/** A repeatable seed from text (32-bit FNV-1a), so one scan always gives the same yard. */
export const walkSeed = (text: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash || 1;
};

/** A small seeded random number source, 0 up to 1. */
const randomFrom = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const distance = (a: WalkPoint, b: WalkPoint): number => Math.hypot(a.x - b.x, a.z - b.z);

/** Scatters `count` points in a width × depth area so no two are closer than `spacing`, or returns null if they don't fit. */
const scatter = (count: number, width: number, depth: number, random: () => number): WalkPoint[] | null => {
  const points: WalkPoint[] = [];
  for (let i = 0; i < count; i += 1) {
    let placed = false;
    for (let attempt = 0; attempt < walkYard.attempts && !placed; attempt += 1) {
      const candidate = { x: (random() - 0.5) * width, z: -random() * depth };
      if (points.every((p) => distance(p, candidate) >= walkYard.spacing)) {
        points.push(candidate);
        placed = true;
      }
    }
    if (!placed) return null;
  }
  return points;
};

/**
 * Lays out a yard for `count` graves: scattered, never closer than
 * `walkYard.spacing`, inside a fence with a gate at the front. The yard grows
 * with the number of graves, so any count fits.
 *
 * @param count - How many graves. One stands for each finding.
 * @param seed - Picks the scatter. Use {@link walkSeed} on the graves' ids.
 */
export const layoutWalkYard = (count: number, seed: number): WalkYardLayout => {
  const random = randomFrom(seed);
  const area = Math.max(1, count) * walkYard.spacing * walkYard.spacing * walkYard.areaFactor;
  let depth = Math.max(walkYard.minDepth, Math.sqrt(area / walkYard.aspect));
  let width = Math.max(walkYard.minWidth, depth * walkYard.aspect);
  let points = scatter(count, width, depth, random);
  while (points === null) {
    width *= walkYard.grow;
    depth *= walkYard.grow;
    points = scatter(count, width, depth, random);
  }
  const gate = { x: 0, z: walkYard.fenceMargin * 0.5 };
  // The nearest grave to the gate comes first, so the most serious finding is the first one met.
  const ordered = [...points].sort((a, b) => distance(a, gate) - distance(b, gate));
  const graves = ordered.map(
    (p): WalkGraveSpot => ({ ...p, turn: (random() - 0.5) * 2 * walkYard.turn, kind: random() < walkYard.archShare ? 'arch' : 'slab' })
  );
  const fence = {
    minX: -width / 2 - walkYard.fenceMargin,
    maxX: width / 2 + walkYard.fenceMargin,
    minZ: -depth - walkYard.fenceMargin,
    maxZ: walkYard.fenceMargin,
  };
  const lanterns: WalkPoint[] = [];
  for (let attempt = 0; attempt < walkYard.attempts && lanterns.length < walkYard.maxLanterns; attempt += 1) {
    const spot = { x: (random() - 0.5) * width, z: -random() * depth };
    if (graves.every((g) => distance(g, spot) >= walkYard.lanternClearance) && lanterns.every((l) => distance(l, spot) >= walkYard.spacing)) {
      lanterns.push(spot);
    }
  }
  return {
    graves,
    fence,
    gate: { x: 0, z: fence.maxZ - walkYard.fenceMargin * 0.5 },
    start: { x: 0, z: fence.maxZ + walkYard.startDistance },
    lanterns,
  };
};

/**
 * Where she stops by a grave: `walkWitch.stopDistance` short of it on the way
 * she comes in, and `walkWitch.stopSide` to the left of that way, so the camera
 * behind her right shoulder sees the grave beside her instead of hidden behind her.
 */
export const stopBeside = (grave: WalkPoint, from: WalkPoint): WalkPoint => {
  const dx = grave.x - from.x;
  const dz = grave.z - from.z;
  const length = Math.hypot(dx, dz);
  // Coming from right on top of it: treat it as coming in from the gate's side.
  const way = length < 1e-6 ? { x: 0, z: -1 } : { x: dx / length, z: dz / length };
  const left = { x: way.z, z: -way.x };
  return {
    x: grave.x - way.x * walkWitch.stopDistance + left.x * walkWitch.stopSide,
    z: grave.z - way.z * walkWitch.stopDistance + left.z * walkWitch.stopSide,
  };
};

/** The way to a grave: through the gate first if she is still outside the fence, then to the grave's side. */
export const routeTo = (from: WalkPoint, grave: WalkPoint, layout: WalkYardLayout): WalkPoint[] => {
  const outside = from.z > layout.fence.maxZ;
  const via = outside ? layout.gate : from;
  return outside ? [layout.gate, stopBeside(grave, via)] : [stopBeside(grave, from)];
};

/**
 * Which way to fly this moment: toward `goal`, bent around any grave closer
 * than `walkWitch.avoidRadius`. Each near grave pushes her away and also
 * slides her round it on the side nearer the goal, so she never stops dead
 * in front of one. Returns a unit direction, or zero when she is at the goal.
 */
export const steer = (position: WalkPoint, goal: WalkPoint, obstacles: readonly WalkPoint[]): WalkPoint => {
  let dx = goal.x - position.x;
  let dz = goal.z - position.z;
  const toGoal = Math.hypot(dx, dz);
  if (toGoal < 1e-6) return { x: 0, z: 0 };
  dx /= toGoal;
  dz /= toGoal;
  const forward = { x: dx, z: dz };
  for (const obstacle of obstacles) {
    const ox = position.x - obstacle.x;
    const oz = position.z - obstacle.z;
    const gap = Math.hypot(ox, oz);
    if (gap >= walkWitch.avoidRadius || gap < 1e-6) continue;
    const weight = (walkWitch.avoidStrength * (walkWitch.avoidRadius - gap)) / walkWitch.avoidRadius;
    const away = { x: ox / gap, z: oz / gap };
    // Of the two ways round, the one closer to where she is going.
    let side = { x: -away.z, z: away.x };
    if (side.x * forward.x + side.z * forward.z < 0) side = { x: -side.x, z: -side.z };
    dx += (away.x + side.x) * weight;
    dz += (away.z + side.z) * weight;
  }
  const length = Math.hypot(dx, dz);
  return length < 1e-6 ? forward : { x: dx / length, z: dz / length };
};

/**
 * The yaw that points along a direction on the ground. Yaw 0 looks into the
 * yard (negative z), and grows turning left.
 */
export const yawOf = (direction: WalkPoint): number => Math.atan2(-direction.x, -direction.z);

/** Moves angle `from` toward `to` the short way round, by share `t` (0 to 1). */
export const turnToward = (from: number, to: number, t: number): number => {
  const full = Math.PI * 2;
  const difference = ((((to - from) % full) + full * 1.5) % full) - Math.PI;
  return from + difference * t;
};
