/**
 * The pose library. Each pose is joint positions for an adult 100 units tall,
 * on the ground at y = 0 (up is negative y), facing left. Ids match the doodle
 * scripts in docs/KIT_SCRIPTS.md.
 *
 * Most poses are assembled from shared parts (a body, a pair of arms, a pair of
 * legs) so the whole library stays consistent: the same kneel, the same
 * relaxed arm, the same lying body everywhere.
 * @module components/effects/Doodle/poses
 */
import type { DoodleJoint, DoodlePoint, DoodlePose } from './types';

type Joints = Record<DoodleJoint, DoodlePoint>;
type XY = readonly [number, number];

const p = (x: number, y: number): DoodlePoint => ({ x, y });
const at = ([x, y]: XY): DoodlePoint => p(x, y);
const offset = (from: DoodlePoint, [dx, dy]: XY): DoodlePoint => p(from.x + dx, from.y + dy);

const definePose = (face: number, joints: Joints): DoodlePose => Object.freeze({ face, joints: Object.freeze(joints) });

/** Faces: 0 right, 90 down, 180 left, 270 up. */
const FACE = { left: 180, downLeft: 145, down: 110, up: 270, upLeft: 240 } as const;

/** Where the hips and shoulders sit, and which way the head lies from the shoulders. */
interface Body {
  hip: XY;
  shoulder: XY;
  /** The head's direction from the shoulders. Only the direction matters; the renderer sets the distance. */
  head: XY;
}

/** Elbow and hand, near then far, measured from the shoulder. Works on any body. */
type Arms = readonly [elbowNear: XY, handNear: XY, elbowFar: XY, handFar: XY];

/** Knee and foot, near then far, measured from the pose's ground origin. */
type Legs = readonly [kneeNear: XY, footNear: XY, kneeFar: XY, footFar: XY];

const BODY = {
  stand: { hip: [0, -48], shoulder: [0, -78], head: [0, -13] },
  standLean: { hip: [0, -48], shoulder: [-12, -75], head: [-6, -12] },
  standBent: { hip: [0, -48], shoulder: [-22, -68], head: [-11, -6] },
  standHunched: { hip: [0, -48], shoulder: [-4, -76], head: [-4, -12] },
  kneel: { hip: [0, -27], shoulder: [-1, -57], head: [-1, -13] },
  kneelMid: { hip: [0, -27], shoulder: [-14, -52], head: [-7, -11] },
  kneelLean: { hip: [0, -27], shoulder: [-24, -40], head: [-10, -7] },
  kneelLow: { hip: [0, -27], shoulder: [-24, -34], head: [-12, 3] },
  sit: { hip: [0, -4], shoulder: [2, -33], head: [-1, -13] },
  sitForward: { hip: [0, -4], shoulder: [-8, -31], head: [-5, -12] },
  sitReclined: { hip: [0, -4], shoulder: [10, -30], head: [1, -13] },
  sitSlumped: { hip: [0, -4], shoulder: [6, -30], head: [-6, -11] },
  seat: { hip: [0, -26], shoulder: [1, -55], head: [-1, -13] },
  seatForward: { hip: [0, -26], shoulder: [-10, -52], head: [-6, -12] },
  /** Kneeling and folded forward, head tucked low: the drop-and-cover shape. */
  crouch: { hip: [0, -26], shoulder: [-24, -18], head: [-12, 6] },
  allFours: { hip: [0, -26], shoulder: [-30, -28], head: [-12, -3] },
  crawl: { hip: [0, -22], shoulder: [-30, -18], head: [-12, -2] },
  lie: { hip: [0, -6], shoulder: [-29, -6], head: [-12, -3] },
  lieLevel: { hip: [0, -6], shoulder: [-29, -6], head: [-12, -1] },
} as const satisfies Record<string, Body>;

const ARMS = {
  relaxed: [[-3, 16], [-4, 32], [4, 16], [5, 32]],
  reachDown: [[-4, 15], [-8, 30], [0, 14], [-4, 30]],
  reachFar: [[-12, 14], [-22, 26], [-10, 14], [-20, 28]],
  hold: [[-6, 15], [-16, 19], [-3, 15], [-13, 21]],
  lap: [[-6, 14], [-14, 20], [-4, 14], [-12, 22]],
  onKnees: [[-8, 12], [-14, 22], [-6, 12], [-12, 23]],
  phone: [[-7, 13], [-4, -3], [4, 16], [5, 32]],
  point: [[-14, -4], [-29, -10], [4, 16], [5, 32]],
  wave: [[-8, -13], [-7, -29], [6, -12], [8, -28]],
  throat: [[-8, 12], [-4, -2], [-6, 12], [-2, -1]],
  chest: [[-6, 13], [-5, 4], [3, 15], [4, 30]],
  hug: [[-8, 12], [0, 6], [-6, 12], [2, 8]],
  drink: [[-9, 11], [-8, -6], [4, 16], [5, 32]],
  shadeEyes: [[-12, -2], [-6, -14], [3, 16], [4, 30]],
  hatBrim: [[-10, -4], [-6, -16], [3, 16], [4, 30]],
  pocket: [[-6, 14], [0, 5], [4, 16], [5, 32]],
  reachUp: [[-13, -2], [-26, -6], [4, 16], [5, 32]],
  pole: [[-14, 8], [-28, 14], [-11, 9], [-24, 15]],
  board: [[-12, -4], [-24, -10], [-10, -2], [-22, -6]],
  tend: [[-10, 14], [-18, 28], [-6, 15], [-12, 28]],
  whistleMirror: [[-8, 11], [-6, -4], [-12, -6], [-24, -14]],
  backBlows: [[-10, 4], [-20, 10], [-14, 8], [-28, 10]],
  thrust: [[-14, 14], [-24, 20], [-12, 15], [-22, 21]],
  thrustLow: [[-14, 10], [-24, 14], [-12, 11], [-22, 15]],
  assist: [[-12, 6], [-18, 12], [-6, 12], [-10, 24]],
  alert: [[-8, 14], [-14, 26], [-4, 15], [-8, 28]],
  testDoor: [[-14, 2], [-27, 0], [4, 16], [5, 32]],
  armDrift: [[-15, 0], [-30, 0], [-14, 6], [-28, 12]],
  gesture: [[-8, 12], [-15, 6], [3, 15], [4, 30]],
  handsOff: [[-8, 8], [-10, -6], [-4, 8], [-6, -6]],
  handOver: [[-12, 6], [-24, 8], [3, 15], [4, 30]],
  headHand: [[-10, 0], [-8, -12], [3, 15], [4, 30]],
  chin: [[-10, 10], [-8, -5], [-6, 14], [-10, 24]],
  hugKnees: [[-10, 12], [-14, 18], [-8, 12], [-12, 19]],
  coverHead: [[-6, -8], [-12, -4], [-4, -7], [-10, -3]],
  gripLeg: [[-16, -10], [-24, -20], [-4, -7], [-10, -3]],
  crawl: [[-6, 10], [-14, 18], [-2, 10], [-10, 18]],
  fours: [[0, 14], [0, 27], [3, 14], [3, 27]],
  tapFoot: [[-8, 14], [-14, 28], [0, 14], [-4, 30]],
  thumbs: [[-6, 12], [-12, 24], [-4, 13], [-10, 25]],
  infantBackBlows: [[-6, 18], [-22, 20], [-10, -4], [-20, 0]],
  infantThrusts: [[-6, 18], [-22, 20], [-10, 10], [-18, 14]],
  // Arms for lying bodies, measured from a shoulder that lies flat.
  lieAlong: [[13, 3], [26, 4], [13, -3], [26, -4]],
  lieArmUp: [[0, -14], [0, -28], [13, -3], [26, -4]],
  lieCheek: [[13, 3], [26, 4], [-2, -8], [-8, -3]],
  lieRecovery: [[-8, -11], [-18, -16], [-2, -8], [-8, -3]],
  lieChest: [[9, -6], [17, -6], [8, -8], [15, -8]],
  lieSeizure: [[-6, -12], [4, -18], [8, -10], [14, -4]],
  lieOverhead: [[-14, -4], [-28, -2], [13, -3], [26, -4]],
  lieSpread: [[10, 6], [22, 8], [10, -8], [22, -10]],
} as const satisfies Record<string, Arms>;

const LEGS = {
  stand: [[-3, -24], [-6, 0], [3, -24], [4, 0]],
  wide: [[-8, -24], [-16, 0], [8, -24], [14, 0]],
  walk: [[-7, -24], [-15, 0], [5, -23], [12, -1]],
  climb: [[-10, -28], [-14, -6], [4, -22], [10, 0]],
  kick: [[-6, -26], [2, -10], [6, -26], [10, -12]],
  kneel: [[-5, -2], [17, -1], [-1, -2], [20, -1]],
  sit: [[-14, -14], [-28, -1], [-12, -12], [-26, -1]],
  sitKnees: [[-12, -18], [-22, -1], [-10, -16], [-20, -1]],
  seat: [[-16, -26], [-18, 0], [-14, -25], [-15, 0]],
  crouch: [[-6, -2], [16, -1], [-2, -2], [19, -1]],
  allFours: [[0, -1], [18, -1], [4, -1], [22, -1]],
  lie: [[22, -5], [46, -3], [22, -7], [46, -6]],
  lieKneeUp: [[22, -5], [46, -3], [14, -20], [26, -1]],
  lieRaised: [[22, -12], [44, -18], [22, -14], [44, -20]],
  lieRecovery: [[22, -4], [44, -2], [16, -14], [28, -2]],
  lieBent: [[18, -14], [36, -3], [24, -10], [44, -8]],
} as const satisfies Record<string, Legs>;

/** Puts a body, arms, and legs together into a pose. */
const build = (face: number, body: Body, arms: Arms, legs: Legs): DoodlePose => {
  const shoulder = at(body.shoulder);
  const [hx, hy] = body.head;
  return definePose(face, {
    head: offset(shoulder, body.head),
    neck: offset(shoulder, [hx * 0.3, hy * 0.3]),
    shoulder,
    hip: at(body.hip),
    elbowNear: offset(shoulder, arms[0]),
    handNear: offset(shoulder, arms[1]),
    elbowFar: offset(shoulder, arms[2]),
    handFar: offset(shoulder, arms[3]),
    kneeNear: at(legs[0]),
    footNear: at(legs[1]),
    kneeFar: at(legs[2]),
    footFar: at(legs[3]),
  });
};

const DEGREES = Math.PI / 180;

/** Turns a whole pose around its hip. Negative degrees lower the head end, as when held head-down. */
const tilt = (pose: DoodlePose, degrees: number, face = pose.face ?? FACE.left): DoodlePose => {
  const { x: cx, y: cy } = pose.joints.hip;
  const cos = Math.cos(degrees * DEGREES);
  const sin = Math.sin(degrees * DEGREES);
  const joints = {} as Joints;
  (Object.keys(pose.joints) as DoodleJoint[]).forEach((joint) => {
    const { x, y } = pose.joints[joint];
    joints[joint] = p(cx + (x - cx) * cos - (y - cy) * sin, cy + (x - cx) * sin + (y - cy) * cos);
  });
  return definePose(face, joints);
};

/** Knees on the ground under the hips, shins lying flat behind. */
const KNEELING_LEGS = {
  hip: p(0, -27),
  kneeNear: p(-5, -2),
  footNear: p(17, -1),
  kneeFar: p(-1, -2),
  footFar: p(20, -1),
} as const;

/** Lying on the back, head to the left. */
const LYING_BODY = {
  neck: p(-32, -6),
  shoulder: p(-29, -6),
  elbowNear: p(-16, -3),
  handNear: p(-3, -2),
  elbowFar: p(-16, -9),
  handFar: p(-3, -10),
  hip: p(0, -6),
  kneeNear: p(22, -5),
  footNear: p(46, -3),
  kneeFar: p(22, -7),
  footFar: p(46, -6),
} as const;

// The first poses, kept exactly as drawn and checked.
const standing = definePose(FACE.left, {
  head: p(0, -91),
  neck: p(0, -82),
  shoulder: p(0, -78),
  elbowNear: p(-4, -62),
  handNear: p(-5, -46),
  elbowFar: p(4, -62),
  handFar: p(5, -46),
  hip: p(0, -48),
  kneeNear: p(-3, -24),
  footNear: p(-6, 0),
  kneeFar: p(3, -24),
  footFar: p(4, 0),
});
const sitting = definePose(FACE.left, {
  head: p(1, -46),
  neck: p(2, -37),
  shoulder: p(2, -33),
  elbowNear: p(-4, -20),
  handNear: p(-13, -16),
  elbowFar: p(-2, -21),
  handFar: p(-11, -15),
  hip: p(0, -4),
  kneeNear: p(-14, -14),
  footNear: p(-28, -1),
  kneeFar: p(-12, -12),
  footFar: p(-26, -1),
});
const kneelingBeside = definePose(FACE.left, {
  ...KNEELING_LEGS,
  head: p(-2, -70),
  neck: p(-1, -61),
  shoulder: p(-1, -57),
  elbowNear: p(-4, -42),
  handNear: p(-6, -28),
  elbowFar: p(1, -42),
  handFar: p(0, -28),
});
const lyingSupine = definePose(FACE.up, { ...LYING_BODY, head: p(-41, -9) });
const recovery = build(FACE.left, BODY.lieLevel, ARMS.lieRecovery, LEGS.lieRecovery);
const crouchingCovered = build(FACE.down, BODY.crouch, ARMS.coverHead, LEGS.crouch);

/** Every built-in pose, by id. */
export const DOODLE_POSES: Readonly<Record<string, DoodlePose>> = Object.freeze({
  // Standing
  standing,
  standing_upright: standing,
  standing_beside: standing,
  standing_alert: build(FACE.left, BODY.stand, ARMS.alert, LEGS.stand),
  standing_calling: build(FACE.left, BODY.stand, ARMS.phone, LEGS.stand),
  standing_listening: build(FACE.downLeft, BODY.standLean, ARMS.relaxed, LEGS.stand),
  standing_choking: build(FACE.left, BODY.stand, ARMS.throat, LEGS.stand),
  standing_lean_forward: build(FACE.down, BODY.standBent, ARMS.relaxed, LEGS.stand),
  standing_back_blows: build(FACE.downLeft, BODY.standLean, ARMS.backBlows, LEGS.wide),
  standing_abdominal_thrusts: build(FACE.downLeft, BODY.standLean, ARMS.thrust, LEGS.wide),
  standing_assisting_walk: build(FACE.left, BODY.stand, ARMS.assist, LEGS.walk),
  standing_braced_reach: build(FACE.downLeft, BODY.standLean, ARMS.pole, LEGS.wide),
  standing_pushing_wire_pole: build(FACE.downLeft, BODY.standLean, ARMS.pole, LEGS.wide),
  standing_flipping_breaker: build(FACE.left, BODY.stand, ARMS.reachUp, LEGS.stand),
  standing_boarding_window: build(FACE.left, BODY.stand, ARMS.board, LEGS.stand),
  standing_drinking_water: build(FACE.upLeft, BODY.stand, ARMS.drink, LEGS.stand),
  standing_inner_pocket: build(FACE.left, BODY.stand, ARMS.pocket, LEGS.stand),
  standing_pointing_clearing: build(FACE.left, BODY.stand, ARMS.point, LEGS.stand),
  standing_scanning_horizon: build(FACE.left, BODY.stand, ARMS.shadeEyes, LEGS.stand),
  standing_shivering: build(FACE.down, BODY.standHunched, ARMS.hug, LEGS.stand),
  standing_sun_hat: build(FACE.left, BODY.stand, ARMS.hatBrim, LEGS.stand),
  standing_tending_fire: build(FACE.down, BODY.standBent, ARMS.tend, LEGS.wide),
  standing_testing_door: build(FACE.left, BODY.stand, ARMS.testDoor, LEGS.stand),
  standing_whistle_mirror: build(FACE.left, BODY.stand, ARMS.whistleMirror, LEGS.stand),
  standing_dry_stairs: build(FACE.left, BODY.stand, ARMS.relaxed, LEGS.climb),
  walking_uphill: build(FACE.left, BODY.standLean, ARMS.relaxed, LEGS.climb),
  /** Upright in the water, both arms raised. Place it lower than the ground so the water covers the legs. */
  swimming_distress: build(FACE.left, BODY.stand, ARMS.wave, LEGS.kick),

  // Kneeling
  kneeling_beside: kneelingBeside,
  kneeling_behind: kneelingBeside,
  kneeling_check: definePose(155, {
    ...KNEELING_LEGS,
    head: p(-34, -48),
    neck: p(-27, -43),
    shoulder: p(-24, -40),
    elbowNear: p(-28, -25),
    handNear: p(-32, -10),
    elbowFar: p(-24, -26),
    handFar: p(-28, -10),
  }),
  kneeling_compressions: definePose(FACE.downLeft, {
    ...KNEELING_LEGS,
    head: p(-32, -48),
    neck: p(-25, -43),
    shoulder: p(-22, -40),
    elbowNear: p(-22, -24),
    handNear: p(-22, -8),
    elbowFar: p(-21, -24),
    handFar: p(-21, -8),
  }),
  kneeling_compressions_one_hand: definePose(FACE.downLeft, {
    ...KNEELING_LEGS,
    head: p(-32, -48),
    neck: p(-25, -43),
    shoulder: p(-22, -40),
    elbowNear: p(-22, -24),
    handNear: p(-22, -8),
    elbowFar: p(-14, -30),
    handFar: p(-6, -22),
  }),
  kneeling_breaths: definePose(120, {
    ...KNEELING_LEGS,
    head: p(-36, -31),
    neck: p(-28, -35),
    shoulder: p(-24, -34),
    elbowNear: p(-28, -22),
    handNear: p(-38, -14),
    elbowFar: p(-26, -24),
    handFar: p(-34, -12),
  }),
  kneeling_calling: build(FACE.left, BODY.kneel, ARMS.phone, LEGS.kneel),
  kneeling_monitoring: build(FACE.downLeft, BODY.kneelMid, ARMS.reachDown, LEGS.kneel),
  kneeling_supporting: build(FACE.downLeft, BODY.kneelMid, ARMS.hold, LEGS.kneel),
  kneeling_guiding: build(FACE.down, BODY.kneelLean, ARMS.reachFar, LEGS.kneel),
  kneeling_cushioning: build(FACE.down, BODY.kneelLean, ARMS.reachFar, LEGS.kneel),
  kneeling_covering: build(FACE.down, BODY.kneelLean, ARMS.reachFar, LEGS.kneel),
  kneeling_sponging: build(FACE.down, BODY.kneelLean, ARMS.reachDown, LEGS.kneel),
  kneeling_hands_off: build(FACE.downLeft, BODY.kneel, ARMS.handsOff, LEGS.kneel),
  kneeling_handing_med: build(FACE.left, BODY.kneelMid, ARMS.handOver, LEGS.kneel),
  kneeling_handing_mug: build(FACE.left, BODY.kneelMid, ARMS.handOver, LEGS.kneel),
  kneeling_back_blows: build(FACE.downLeft, BODY.kneel, ARMS.backBlows, LEGS.kneel),
  kneeling_abdominal_thrusts: build(FACE.downLeft, BODY.kneel, ARMS.thrustLow, LEGS.kneel),
  kneeling_tap_foot: build(FACE.down, BODY.kneelLean, ARMS.tapFoot, LEGS.kneel),
  kneeling_infant_compressions_thumbs: build(FACE.down, BODY.kneelLean, ARMS.thumbs, LEGS.kneel),
  kneeling_infant_breaths: build(FACE.down, BODY.kneelLow, ARMS.thumbs, LEGS.kneel),

  // Sitting on the ground
  sitting,
  sitting_upright: build(FACE.left, BODY.sit, ARMS.lap, LEGS.sit),
  sitting_calm: build(FACE.left, BODY.sit, ARMS.lap, LEGS.sit),
  sitting_upright_forward: build(FACE.left, BODY.sitForward, ARMS.onKnees, LEGS.sit),
  sitting_breathing_distress: build(FACE.left, BODY.sitForward, ARMS.chest, LEGS.sit),
  sitting_chest_pain: build(FACE.left, BODY.sit, ARMS.chest, LEGS.sit),
  sitting_half_reclined: build(FACE.left, BODY.sitReclined, ARMS.lap, LEGS.sitKnees),
  sitting_drowsy: build(FACE.down, BODY.sitSlumped, ARMS.relaxed, LEGS.sit),
  sitting_dizzy: build(FACE.down, BODY.sitForward, ARMS.headHand, LEGS.sit),
  sitting_wrapped_blanket: build(FACE.left, BODY.sit, ARMS.hug, LEGS.sitKnees),
  sitting_under_tarp: build(FACE.left, BODY.sit, ARMS.hugKnees, LEGS.sitKnees),
  sitting_visible_clearing: build(FACE.left, BODY.sit, ARMS.lap, LEGS.sitKnees),

  // Sitting on a seat, a log, or a chair
  sitting_cool_room: build(FACE.left, BODY.seat, ARMS.lap, LEGS.seat),
  sitting_speaking: build(FACE.left, BODY.seat, ARMS.gesture, LEGS.seat),
  sitting_one_arm_drift: build(FACE.left, BODY.seat, ARMS.armDrift, LEGS.seat),
  sitting_on_log_thinking: build(FACE.down, BODY.seatForward, ARMS.chin, LEGS.seat),
  sitting_infant_back_blows: build(FACE.down, BODY.seatForward, ARMS.infantBackBlows, LEGS.seat),
  sitting_infant_chest_thrusts: build(FACE.down, BODY.seatForward, ARMS.infantThrusts, LEGS.seat),

  // Low to the ground
  crouching_inner_room: crouchingCovered,
  crouching_under_table: crouchingCovered,
  holding_table_leg: build(FACE.down, BODY.crouch, ARMS.gripLeg, LEGS.crouch),
  dropping_hands_knees: build(FACE.down, BODY.allFours, ARMS.fours, LEGS.allFours),
  crawling_low: build(FACE.left, BODY.crawl, ARMS.crawl, LEGS.allFours),

  // Lying down
  lying_supine: lyingSupine,
  lying_covered: lyingSupine,
  lying_insulated_bed: lyingSupine,
  lying_supine_head_tilt: definePose(FACE.upLeft, { ...LYING_BODY, head: p(-42, -8) }),
  lying_neutral_head: build(FACE.up, BODY.lieLevel, ARMS.lieAlong, LEGS.lie),
  lying_supine_arm_out: build(FACE.up, BODY.lie, ARMS.lieArmUp, LEGS.lie),
  lying_supine_distress: build(FACE.up, BODY.lie, ARMS.lieChest, LEGS.lie),
  lying_knee_bent: build(FACE.up, BODY.lie, ARMS.lieCheek, LEGS.lieKneeUp),
  lying_legs_elevated: build(FACE.up, BODY.lie, ARMS.lieAlong, LEGS.lieRaised),
  lying_recovery: recovery,
  lying_recovery_blanket: recovery,
  lying_seizure: build(FACE.up, BODY.lie, ARMS.lieSeizure, LEGS.lieBent),
  lying_near_wire: build(FACE.up, BODY.lie, ARMS.lieOverhead, LEGS.lie),
  lying_cooling: build(FACE.up, BODY.lie, ARMS.lieSpread, LEGS.lie),

  // Infants held along an arm, head lower than chest
  forearm_facedown: tilt(build(FACE.down, BODY.lieLevel, ARMS.lieAlong, LEGS.lie), -12, 90),
  forearm_faceup: tilt(build(FACE.up, BODY.lieLevel, ARMS.lieAlong, LEGS.lie), -12, 270),
});
