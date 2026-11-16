/**
 * Scenes and close-ups for doodles: a face, an arm, a leg, a phone screen, a
 * clearing seen from above. They stand in for a figure in panels that show a
 * detail instead of a whole person, and are drawn around (0, 0) at about
 * 140 units across. Each card places the matching props (a bandage, a tap, a
 * splint) on top. Ids match the "poses" named in docs/KIT_SCRIPTS.md; here they
 * are props, because a close-up has no joints to pose.
 * @module components/effects/Doodle/propsScenes
 */
import { A, AR, C, D, E, L, P, Q, R, S, T, limb, move, rays, type Shape } from './shapes';

const EN_DASH = '\u2013';
const DEGREE = '\u00b0';

/** Where the forearm's centre line sits at `x`, from the elbow (-58, 10) to the wrist (12, 0). */
export const forearmCentre = (x: number): number => 10 - (x + 58) * (10 / 70);

/** A forearm and open hand, lying across the picture with the elbow on the left. */
const FOREARM = S(limb(-58, 10, 12, 0, 10), E(26, -2, 26, 20), L(37, -8, 47, -10), L(39, -2, 49, -2), L(37, 4, 47, 7));
/** A lower leg and foot, lying across the picture. */
const LEG = S(limb(-62, 8, 18, 12, 11), E(32, 14, 22, 12));
/** A wound: a small accent cross. */
const wound = (x: number, y: number): Shape[] => S(L(x - 4, y - 4, x + 4, y + 4, { accent: true }), L(x + 4, y - 4, x - 4, y + 4, { accent: true }));
/** A jagged break in a limb: a zigzag in the accent. */
const breakMark = (x: number, y: number): Shape =>
  P([[x - 3, y - 12], [x + 3, y - 5], [x - 4, y], [x + 3, y + 6], [x - 3, y + 12]], { accent: true });

/** A small stick figure for the stop, drop and roll steps. */
const standing = (x: number): Shape[] =>
  S(C(x, -28, 12, { fill: 'ink' }), L(x, -22, x, 2, { width: 5 }), L(x, -18, x - 9, -8), L(x, -18, x + 9, -8), L(x, 2, x - 6, 24), L(x, 2, x + 6, 24));
const lyingDown = (x: number): Shape[] =>
  S(C(x - 26, 10, 12, { fill: 'ink' }), L(x - 20, 12, x + 10, 12, { width: 5 }), L(x - 14, 8, x - 24, 4), L(x + 10, 12, x + 34, 15));
const rolling = (x: number): Shape[] =>
  S(C(x, 10, 26), C(x - 8, 4, 10, { fill: 'ink' }), A(x, 10, 40, 40, 200, 340), P([[x + 14, -6], [x + 19, -3], [x + 15, 2]]));

/** Bandage wraps across the forearm between two x positions. */
const wraps = (from: number, to: number, step: number): Shape[] => {
  const lines: Shape[] = [];
  for (let x = from; x <= to; x += step) {
    const cy = forearmCentre(x);
    lines.push(L(x - 4, cy - 11, x + 4, cy + 11));
  }
  return lines;
};

/** An app card with a cross, for "close the background apps". */
const app = (y: number): Shape[] => S(R(-14, y, 28, 9), L(8, y + 2, 12, y + 7), L(12, y + 2, 8, y + 7));

/** The scenes, as shape lists, by id. `props.ts` turns each into a drawable prop. */
export const SCENE_SHAPES: Readonly<Record<string, Shape[]>> = {
  // Faces and hands
  asymmetric_smile: S(C(0, 0, 76), C(-13, -8, 5, { fill: 'ink' }), C(13, -8, 5, { fill: 'ink' }), Q([[-16, 16], [-6, 20], [6, 16], [16, 6]])),
  hand_under_tap: S(limb(70, 22, 20, 12, 9), E(8, 10, 26, 20), L(-4, 6, -18, 2), L(-4, 11, -19, 11), L(-4, 15, -17, 19)),
  wrist_removing_ring: S(FOREARM, C(31, -2, 6, { accent: true }), R(-12, -4, 8, 19)),
  pouring_cloth_filter: S(E(-14, -28, 18, 12), E(14, -30, 18, 12), Q([[8, -16], [10, -4], [10, 10]])),

  // Arms
  forearm_rinse: FOREARM,
  forearm_direct_pressure: S(FOREARM, wound(-20, 5)),
  forearm_bandaged: S(FOREARM, wraps(-34, -6, 7)),
  forearm_loose_wrap: S(FOREARM, E(-20, 5, 30, 16, { accent: true, dash: true })),
  forearm_supported_hands: S(FOREARM, breakMark(-22, 6), E(-40, 26, 20, 12), E(2, 24, 20, 12)),
  forearm_splinted: S(FOREARM, breakMark(-24, 4)),
  forearm_splint_ice: S(FOREARM, R(-58, -9, 68, 5), R(-58, 15, 68, 5)),
  upper_arm_tourniquet: S(limb(-4, -46, 6, 34, 12), wound(5, 24), AR(28, -2, 28, 22, true), T(32, 12, `5${EN_DASH}8 cm`, 8, 'start')),

  // Legs and thighs
  leg_immobilized_low: S(LEG, L(-72, -18, 72, -18, { dash: true }), T(-72, -22, 'heart level', 8, 'start')),
  leg_clean_dressing: S(LEG, R(-24, -2, 26, 26, { dash: true }), L(-24, 4, 2, 18), L(-24, 12, 2, 24)),
  thigh_epipen: S(limb(-56, 14, 52, 10, 16), A(56, 10, 32, 32, -90, 90), T(0, 46, 'outer mid-thigh', 8), T(14, -16, `90${DEGREE}`, 8, 'start'), T(36, -30, `hold 3${EN_DASH}10 s`, 8, 'start')),

  // Steps in a row
  stop_drop_roll_3step: S(
    standing(-62),
    T(-62, 40, 'STOP', 9),
    lyingDown(0),
    T(0, 40, 'DROP', 9),
    rolling(62),
    T(62, 40, 'ROLL', 9),
    AR(-42, 0, -26, 0),
    AR(26, 0, 42, 0)
  ),

  // Things on a table or in the hand
  boiling_pot_fire: S(
    D('M -26 -12 L 26 -12 L 22 14 L -22 14 Z'),
    R(-28, -16, 56, 4),
    L(-32, -6, -26, -6),
    L(26, -6, 32, -6),
    Q([[-8, -22], [-5, -28], [-8, -34]]),
    Q([[2, -22], [5, -28], [2, -34]]),
    Q([[12, -22], [15, -28], [12, -34]])
  ),
  dropper_bottle: S(
    R(-30, 0, 18, 24),
    R(-25, -8, 8, 8),
    D('M -24 -8 Q -21 -22 -18 -8 Z'),
    AR(-8, -6, 22, -6),
    C(37, -14, 3.5, { fill: 'ink' }),
    C(37, -4, 3.5, { fill: 'ink' }),
    R(24, 4, 26, 24),
    T(37, -24, '2 drops', 8),
    T(37, 40, 'per litre', 8)
  ),
  emergency_kit_items: S(
    R(-30, -14, 60, 34),
    L(-30, -6, 30, -6),
    L(-6, 6, 6, 6, { width: 3 }),
    L(0, 0, 0, 12, { width: 3 }),
    R(36, 2, 16, 20),
    L(36, 8, 52, 8),
    T(0, 34, 'first aid kit', 8),
    T(44, 34, 'food', 8)
  ),

  // Seen from above
  hiker_laying_signal: S(
    R(-76, -44, 152, 88, { dash: true }),
    T(0, -50, 'open clearing', 8),
    C(-56, -26, 10, { fill: 'ink' }),
    L(-56, -20, -56, -4, { width: 4 }),
    L(-64, -16, -48, -16, { width: 3 }),
    L(-56, -4, -62, 10),
    L(-56, -4, -50, 10)
  ),

  // A flooded road, and a storm's eye
  car_stopped_flood: S(
    Q([[-70, 0], [-58, -5], [-46, 0], [-34, -5], [-22, 0], [-10, -5], [2, 0], [14, -5], [26, 0], [38, -5], [50, 0], [62, -5], [70, 0]]),
    Q([[-70, 8], [-58, 3], [-46, 8], [-34, 3], [-22, 8], [-10, 3], [2, 8], [14, 3], [26, 8], [38, 3], [50, 8], [62, 3], [70, 8]]),
    AR(-62, 20, -34, 20),
    AR(10, 20, 38, 20),
    T(0, 36, 'moving water', 8)
  ),
  cyclone_eye_diagram: S(C(0, 0, 34, { dash: true }), T(0, 3, 'calm eye', 8)),

  // Phone screens
  phone_settings_a: S(L(-14, 0, 14, 0), C(-14, 0, 6, { fill: 'ink' }), move(S(C(0, 0, 6), rays(6, 5, 8)), -2, -12), T(0, 13, 'dimmest', 7.5)),
  phone_settings_b: S(app(-16), app(-4), app(8), T(0, 26, 'close apps', 7.5)),
};
