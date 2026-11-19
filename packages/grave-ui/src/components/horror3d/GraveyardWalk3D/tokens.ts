/**
 * GraveyardWalk3D tokens
 *
 * Every distance, speed and colour the walk uses, in scene units (about a
 * metre each) unless a name says otherwise.
 *
 * @module components/horror3d/GraveyardWalk3D/tokens
 */
import { palette } from '../../../tokens/colors';
import type { TombstoneWeathering } from '../../crypt/TombstoneCard/TombstoneCard';

/** How the yard is laid out around the graves it is given. */
export const walkYard = {
  /** The least distance between two graves: room to walk between them. */
  spacing: 3.2,
  /** Ground per grave, as a multiple of `spacing` squared. Above 1, so scattering always finds room. */
  areaFactor: 1.9,
  /** How much wider the yard is than deep. */
  aspect: 1.3,
  minWidth: 9,
  minDepth: 7,
  /** Tries to place one grave before the yard is made bigger and laid out again. */
  attempts: 60,
  /** How much the yard grows when the graves don't fit. */
  grow: 1.15,
  /** Space between the outermost graves and the fence. */
  fenceMargin: 1.8,
  /** How far outside the gate the witch starts. */
  startDistance: 3.4,
  /** Half the width of the gate in the front fence. */
  gateHalfWidth: 1.3,
  /** Gap between fence posts. */
  postGap: 1.3,
  /** Share of graves drawn as arched stones; the rest are flat slabs. */
  archShare: 0.7,
  /** How far the stones turn from facing the gate, in radians either way. */
  turn: 0.35,
  /** Lanterns among the graves, with their own light. Lights are costly, so this stays small. */
  maxLanterns: 4,
  /** Lanterns keep at least this far from any grave. */
  lanternClearance: 1.4,
  /** One tree for every this many units of fence, outside it. */
  treeEvery: 2.4,
  /** Bare trees standing at the yard's edges. */
  bareTrees: 12,
} as const;

/** The witch: how big she is and how she flies. */
export const walkWitch = {
  /** Width of her drawing in the scene. Her height follows the drawing's shape. */
  width: 1.6,
  /** How high the broom rides, about the height of a headstone's middle. */
  broomHeight: 0.5,
  /** Where the broom sits down the drawing (0 top, 1 bottom) and her body across it (0 left, 1 right). */
  broomAt: 0.625,
  bodyAt: 0.575,
  /** Up and down drift while she hovers, and how many times a second. */
  bob: 0.05,
  bobHz: 0.55,
  /** Her giggle at a grave: how long it lasts, how far she rocks (radians) and bounces, and how fast. */
  giggle: { seconds: 1.2, shake: 0.12, shakeSpeed: 24, bounce: 0.04, bounceSpeed: 19 },
  /** Top speed, and how quickly she reaches it, per second. */
  speed: 2.8,
  accel: 5,
  /** She slows down over the last stretch, this many times her distance per second. */
  brake: 2.2,
  /** She stops this far short of the grave she flies to... */
  stopDistance: 1.6,
  /** ...and this far to the left of her way in, so from behind her shoulder the grave stands beside her, not behind her. */
  stopSide: 0.7,
  /** Closer than this counts as there. */
  arriveDistance: 0.06,
  /** Graves closer than this push her aside, so she flies around them. */
  avoidRadius: 1.35,
  avoidStrength: 1.4,
  /** How sideways her flight must be, on screen, before she turns to face the other way. */
  flipThreshold: 0.15,
  /** A flight taking this many times longer than it should, plus `stallGraceS`, ends at the grave. */
  stallFactor: 3,
  stallGraceS: 3,
  /** Resolution of her drawing, in pixels across. */
  textureWidth: 1024,
  /** Her shadow on the ground. */
  shadowRadius: 0.42,
  shadowOpacity: 0.35,
  /** The small light she carries, so nearby stones catch it. */
  lampIntensity: 0.7,
  lampDistance: 4.5,
  lampHeight: 1.1,
} as const;

/** The camera, behind and a little to the right of her shoulder. */
export const walkCamera = {
  fov: 55,
  near: 0.1,
  far: 140,
  distance: 3.4,
  height: 1.45,
  shoulder: 0.55,
  /** Where it aims: this high, and this far ahead of her. */
  lookHeight: 0.75,
  lookAhead: 3,
  /** How quickly the camera settles, per second. */
  ease: 8,
  /** How quickly it swings round behind her while she flies, per second. */
  follow: 2.2,
  /** Following stops once the camera is this close to behind her, in radians. */
  followDone: 0.02,
  /** Turning by dragging: radians per pixel. */
  yawPerPx: 0.005,
  pitchPerPx: 0.003,
  pitchMin: -0.2,
  pitchMax: 0.5,
  /** How much one press of an arrow key turns the view, in radians. */
  keyYaw: 0.12,
  /** A press that moves further than this is a drag, not a click, in pixels. */
  clickSlopPx: 6,
} as const;

/** The graves that stand for findings. */
export const walkStone = {
  scale: 1.05,
  /** The carved words: sizes, the width they wrap at, and how high they sit. */
  titleSize: 0.13,
  subtitleSize: 0.068,
  textWidth: 0.58,
  titleY: 0.62,
  subtitleY: 0.47,
  /** Just in front of the stone's face. */
  faceZ: 0.125,
  /** Where the card above a grave is pinned, above the ground. */
  cardHeight: 1.6,
  /** The ring on the ground round a grave you point at, or the one she is at. */
  ring: { inner: 0.78, outer: 0.9, segments: 40, lift: 0.015, hover: 0.35, current: 0.85 },
  /** Cracks: thin dark cuts in the face, a little wider on a crumbling stone. */
  crack: { width: 0.02, crumblingWidth: 0.03, depth: 0.012 },
  /** The face of each kind of stone: half its width and its height, so cracks stay on the stone. */
  face: { arch: { halfWidth: 0.38, height: 1.08 }, slab: { halfWidth: 0.35, height: 0.84 } },
} as const;

/** How each weathering looks on a grave in the walk: its stone, how far it leans and sinks, and its cracks. */
export const walkWeathering: Record<TombstoneWeathering, { tint: string; lean: number; sink: number; cracks: number }> = {
  pristine: { tint: palette.grove.mist300, lean: 0, sink: 0, cracks: 0 },
  aged: { tint: palette.grove.mist400, lean: 0.05, sink: 0.01, cracks: 1 },
  cracked: { tint: palette.grove.mist500, lean: 0.12, sink: 0.04, cracks: 3 },
  crumbling: { tint: palette.grove[600], lean: 0.22, sink: 0.09, cracks: 5 },
};

/** Colours the walk adds to the yard's theme. */
export const walkColors = {
  text: palette.grove.bone100,
  textOutline: palette.grove[950],
  crack: palette.grove[950],
  ring: palette.grove.glow,
  shadow: palette.grove[950],
  path: palette.grove[750],
} as const;

/** Fog: how near it starts and how far it hides everything. Haunted, it closes in. */
export const walkFog = { near: 8, far: 32, haunted: { near: 4, far: 24 } } as const;

/** The haunted yard's extras: where the eyes watch from, and where the clouds hang in front of the moon. */
export const walkHaunt = {
  /** The eyes watch from this far beyond the fence, among the trees. */
  eyesBeyond: 3.5,
  /** The clouds hang this much nearer than the moon, so they pass in front of it. */
  cloudsBefore: 3,
} as const;

/** The yard's surroundings: the iron fence and gate, the trees, the path, mist and moon. */
export const walkScenery = {
  fence: {
    postHeight: 1.15,
    postSize: 0.05,
    /** The spike on each post. */
    spikeHeight: 0.12,
    spikeRadius: 0.045,
    /** Heights of the two rails. */
    rails: [0.35, 0.95],
    railSize: 0.04,
  },
  gate: {
    pillarHeight: 1.9,
    pillarSize: 0.32,
    /** The iron arch over the gate. */
    archTube: 0.04,
    archLift: 1.55,
  },
  /**
   * The wrought-iron sign in the arch over the gate: a winged hourglass in a
   * ring, the old gravestone sign that time flies, with a spike on the arch's top.
   */
  emblem: {
    /** How far up the arch's curve the ring hangs, as a share of the arch's radius. */
    at: 0.5,
    ring: { radius: 0.3, tube: 0.025 },
    /** The bar from the ring up to the top of the arch. */
    bar: 0.02,
    hourglass: { bulb: 0.12, half: 0.17, plate: 0.15, plateThickness: 0.025, post: 0.012 },
    /** Feathers fanned out each side: how long each is, and its angle up from level, in radians. */
    feathers: [
      { length: 0.62, angle: 0.12 },
      { length: 0.54, angle: 0.36 },
      { length: 0.44, angle: 0.6 },
      { length: 0.32, angle: 0.84 },
    ],
    featherWidth: 0.07,
    featherDepth: 0.02,
    /** Feathers start just inside the ring. */
    featherFrom: 0.9,
    finial: { radius: 0.06, height: 0.28 },
  },
  trees: {
    /** How far outside the fence they start, and how deep the band of them is. */
    offset: 2.5,
    band: 9,
    minHeight: 3.2,
    maxHeight: 7,
    minRadius: 0.9,
    maxRadius: 1.8,
    sides: 6,
  },
  bareTree: {
    height: 4.4,
    trunk: 0.12,
    /** Branches: how long, how far up the trunk they start, and how steeply they rise. */
    branch: 1.3,
    branchRadius: 0.045,
    branchesFrom: 0.45,
    rise: 0.75,
    count: 6,
    /** Stands this far outside the fence. */
    offset: 1.2,
  },
  path: { width: 1.6, lift: 0.004 },
  /** Ground beyond the fence, on every side. */
  groundMargin: 60,
  mist: { layers: 4, height: 0.3, rise: 0.12, opacity: 0.07, drift: 2.5, speed: 0.05, depth: 8 },
  moon: { radius: 2.2, halo: 4.4, haloOpacity: 0.12, height: 11, behind: 34, right: 0.4 },
  light: {
    ambient: 0.5,
    sky: 0.35,
    moon: 1.3,
    fill: 0.35,
  },
  /** Darker, for the haunted yard: the graves' own glow and the lanterns do more of the lighting. */
  hauntedLight: {
    ambient: 0.28,
    sky: 0.2,
    moon: 0.85,
    fill: 0.18,
  },
} as const;

/** How the yard's materials catch the light, and how finely round shapes are cut. */
export const walkMaterial = {
  iron: { roughness: 0.6, metalness: 0.4 },
  stone: { roughness: 0.95 },
  bark: { roughness: 1 },
  ground: { roughness: 1 },
  segments: { moon: [32, 16] as const, halo: 40, arch: [6, 32] as const, spike: 4, trunk: 6, branch: 5 },
  /** Trunks and branches narrow toward their tips: the top's share of the base. */
  taper: { trunk: 0.6, branch: 0.4 },
  /** Branches spread over this share of the trunk above where they start. */
  branchSpread: 0.8,
  /** Mixed into the yard's seed for the bare trees, so they don't stand where the pines do. */
  bareTreeSeed: 0x9e3779b9,
} as const;

/**
 * Where cracks run across a grave's face, each a jagged line of points. A
 * point is [across, up]: across as a share of half the face's width from the
 * middle, up as a share of its height. Worse weathering uses more of them,
 * in this order.
 */
export const walkCracks: readonly (readonly (readonly [number, number])[])[] = [
  [[0.55, 0.8], [0.4, 0.72], [0.5, 0.64], [0.28, 0.56]],
  [[-0.95, 0.36], [-0.65, 0.31], [-0.72, 0.21], [-0.4, 0.12], [-0.46, 0.04]],
  [[0.95, 0.26], [0.7, 0.21], [0.78, 0.1], [0.58, 0.02]],
  [[-0.3, 0.82], [-0.42, 0.74], [-0.2, 0.67], [-0.34, 0.6]],
  [[0.05, 0.38], [-0.12, 0.3], [0.1, 0.2], [-0.04, 0.12], [0.06, 0.03]],
];

/** Broken pieces at the foot of a crumbling grave, in its own space: across, out in front, and size. */
export const walkRubble: readonly (readonly [number, number, number])[] = [
  [-0.32, 0.18, 0.07],
  [0.28, 0.24, 0.05],
  [0.42, 0.06, 0.06],
  [-0.12, 0.34, 0.04],
];

/** The flight's timing. */
export const walkMotion = {
  /** Longest step one frame may take, in seconds, so a slow frame never throws her through a stone. */
  maxStepS: 0.1,
  /** Below this speed she keeps the way she was facing. */
  turnSpeed: 0.05,
} as const;

/** Small rendering details. */
export const walkRender = {
  /** The dark edge round carved letters, as a share of their size, so they read against any stone. */
  outlineShare: 0.1,
  /** Pixels of her drawing fainter than this are left out, so the clear parts never hide what is behind her. */
  alphaTest: 0.05,
  /** How quickly her lamp fades with distance (2 is how real light fades). */
  lampDecay: 2,
} as const;
