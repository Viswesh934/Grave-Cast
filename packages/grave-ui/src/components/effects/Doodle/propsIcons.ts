/**
 * Small icons for doodles: "do not" signs, arrows, speech bubbles, weather and
 * water marks. Each is a list of shapes (see `shapes.ts`); ids match the doodle
 * scripts in docs/KIT_SCRIPTS.md. Signs carry a short label that a placement's
 * `label` can replace, so one sign can say "no drinks" or "no ice".
 * @module components/effects/Doodle/propsIcons
 */
import { A, AR, C, D, E, G, L, P, Q, R, S, T, move, noSign, rays, type Shape } from './shapes';

/** A cup with a handle. */
const cup = S(R(-4, -4, 8, 9), P([[4, -2], [7, -2], [7, 2], [4, 2]]));
const iceCube = S(R(-5, -5, 10, 10), L(-3, -3, 0, -3));
const mouthDown = S(A(0, -1, 12, 8, 0, 180), L(-3, 4, -3, 7), L(0, 5, 0, 8), L(3, 4, 3, 7));
const pressDown = S(L(-7, 5, 7, 5), AR(-3, -6, -3, 3), AR(3, -6, 3, 3));
const mouthWithStick = S(E(0, 1, 14, 7), L(-8, -6, 3, 0, { width: 2.5 }));
const knife = S(L(-6, 6, 1, -1, { width: 2.5 }), G([[1, -1], [6, -7], [4, 0]]));
const band = S(L(-7, -4, 7, -4), L(-7, 4, 7, 4), R(-3, -6, 6, 12));
const deadTree = S(L(0, 7, 0, -4), L(0, 0, -5, -5), L(0, -2, 5, -7), L(0, 3, 4, 0));
const wireOnGround = S(Q([[-8, 3], [-4, -2], [0, 3], [4, -2], [8, 3]]), L(5, -5, 7, -8), L(9, -3, 12, -4));
const elevator = S(R(-5, -7, 10, 14), P([[-3, -1], [0, -4], [3, -1]]), P([[-3, 2], [0, 5], [3, 2]]));
const smallCar = S(R(-8, -2, 16, 6), P([[-5, -2], [-3, -6], [3, -6], [5, -2]]), C(-4, 5, 3.5), C(4, 5, 3.5));
const doorWithArrow = S(R(-4, -7, 7, 14), AR(2, 0, 10, 0));
const dryStream = S(Q([[-9, -3], [-4, 0], [0, -3], [4, 0], [9, -3]]), Q([[-9, 3], [-4, 6], [0, 3], [4, 6], [9, 3]]));

const drop = D('M 0 -6 Q 4 0 0 3 Q -4 0 0 -6 Z');
const flame = D('M 0 0 Q -5 -8 0 -15 Q 1 -9 5 -11 Q 9 -4 5 0 Z');
const bubble = D('M -14 -8 L 14 -8 L 14 6 L 2 6 L -4 12 L -4 6 L -14 6 Z');
/** A row of wave crests, shifted sideways and down for a second row. */
const wave = (shift: number, depth = 0): [number, number][] =>
  [-34, -26, -18, -10, -2, 6, 14, 22, 30].map((x, index) => [x + shift, depth + (index % 2 === 0 ? 0 : -4)]);
const DEGREE = '\u00b0';
const EN_DASH = '\u2013';

const toggleRows = ['Wi-Fi', 'Bluetooth', 'GPS location', 'Vibration'].flatMap((label, index) => {
  const y = -22 + index * 12;
  return [R(-30, y - 4, 14, 8), C(-26, y, 6), T(-12, y + 3, label, 8, 'start')];
});

/** The icon props, as shape lists, by id. `props.ts` turns each into a drawable prop. */
export const ICON_SHAPES: Readonly<Record<string, Shape[]>> = {
  // "Do not" signs
  no_drink_icon: noSign(cup, 'no drinks'),
  no_ice_icon: noSign(iceCube, 'no ice'),
  no_restrain_icon: noSign(pressDown, "don't hold down"),
  no_mouth_object_icon: noSign(mouthWithStick, 'nothing in mouth'),
  no_vomit_icon: noSign(mouthDown, 'no vomiting'),
  no_cut_icon: noSign(knife, 'no cutting'),
  no_tourniquet_icon: noSign(band, 'no tourniquet'),
  dead_tree_no_icon: noSign(deadTree, 'no dead trees'),
  downed_wire_no_icon: noSign(wireOnGround, 'stay away'),
  no_elevator_icon: noSign(elevator, 'no elevator'),
  no_coffee_soda_icon: noSign(S(cup, C(5, -6, 2.5), C(7, -2, 2)), 'avoid these'),
  box_car_no_icon: noSign(smallCar, 'not in parked cars'),
  no_exit_icon: noSign(doorWithArrow, 'stay inside'),
  dry_creek_bed: noSign(dryStream, 'dry riverbeds'),

  // Arrows
  impact_arrow_5x: S(AR(12, -12, 0, 0), T(14, -14, '5x', 9, 'start')),
  j_thrust_arrow_5x: S(Q([[-10, 8], [0, 10], [8, 4], [10, -8]]), P([[6, -4], [10, -10], [14, -4]]), T(14, -8, '5x', 9, 'start')),
  thrust_arrow_5x: S(AR(0, -12, 0, 2), T(5, -6, '5x', 9, 'start')),
  angle_arrow: S(L(0, 0, 0, -18), L(0, 0, 18, 0), P([[0, -6], [6, -6], [6, 0]]), T(9, -9, `90${DEGREE}`, 8, 'start')),
  motion_arc: S(Q([[-14, 6], [-6, -10], [12, -6]]), P([[6, -12], [12, -6], [5, -2]])),
  airway_arrow: S(A(0, 0, 24, 24, 200, 340), P([[6, -6], [10.5, -3.5], [7, 1]])),
  droop_arrow: S(AR(0, -9, 0, 9), T(5, 2, 'droops', 8, 'start')),
  drift_arrow: S(AR(0, -9, 0, 9), T(5, 2, 'drifts down', 8, 'start')),
  pressure_arrows: S(AR(-5, -16, -5, -6), AR(5, -16, 5, -6)),
  support_arrows: S(AR(-20, 10, -20, -2), AR(20, 10, 20, -2)),
  circulation_arrow: S(A(0, 0, 18, 18, 30, 330), P([[3, -6], [7.8, -4.5], [6, 0]]), T(0, 17, 'check fingers', 8)),
  wind_deflect_arrows: S(AR(-14, -12, 0, -12), AR(-14, 0, 0, 0), AR(-14, 12, 0, 12)),
  wind_arrows: S(AR(-10, -10, 10, -10), AR(-14, 0, 10, 0), AR(-10, 10, 10, 10)),

  // Motion, heat and sound marks
  shake_lines: S(Q([[-16, -8], [-19, -4], [-16, 0], [-19, 4], [-16, 8]]), Q([[16, -8], [19, -4], [16, 0], [19, 4], [16, 8]])),
  wind_lines: S(L(-20, -6, 20, -6), L(-26, 0, 14, 0), L(-20, 6, 20, 6)),
  fan_lines: S(Q([[-12, -8], [0, -12], [12, -8]]), Q([[-12, 0], [0, -4], [12, 0]]), Q([[-12, 8], [0, 4], [12, 8]])),
  wheeze_lines: S(
    Q([[-8, -6], [-4, -8], [0, -6], [4, -8], [8, -6]]),
    Q([[-8, 0], [-4, -2], [0, 0], [4, -2], [8, 0]]),
    Q([[-8, 6], [-4, 4], [0, 6], [4, 4], [8, 6]])
  ),
  pain_radiate_lines: S(L(0, 0, 12, -9), L(0, 0, 14, 0), L(0, 0, 12, 9), L(0, 0, 0, -12)),
  sweat_drops: S(drop, move([drop], 9, 5), move([drop], -9, 6)),
  hot_sun: S(C(0, 0, 14), rays(8, 10, 15)),
  flame_wisps: S(flame, move([flame], 12, 2, 0.8), move([flame], -11, 3, 0.7)),
  boiling_bubbles: S(C(-7, 0, 5), C(2, -5, 4), C(8, 2, 3), C(-1, 6, 3)),
  smoke_column: S(Q([[0, 0], [-6, -10], [3, -20], [-5, -32], [3, -44], [-3, -56]]), Q([[8, -2], [2, -12], [11, -22], [3, -34], [11, -46]])),
  smoke_ceiling: S(
    Q([[-72, 0], [-56, -5], [-40, 0], [-24, -5], [-8, 0], [8, -5], [24, 0], [40, -5], [56, 0], [72, -5]]),
    Q([[-72, 8], [-56, 3], [-40, 8], [-24, 3], [-8, 8], [8, 3], [24, 8], [40, 3], [56, 8], [72, 3]]),
    T(0, -10, 'smoke', 8)
  ),

  // Water
  water_waves: S(Q(wave(0)), Q(wave(4, 7))),
  rising_water_waves: S(Q(wave(0)), Q(wave(4, 7)), AR(38, 4, 38, -14)),
  water_stream: S(L(-6, -10, -6, -2), L(0, -12, 0, -4), L(6, -10, 6, -2), C(-6, 2, 2), C(0, 0, 2), C(6, 2, 2), T(0, 14, 'cool water', 8, 'middle', true)),

  // Speech, thought and time
  speech_bubble_check: S(bubble, T(0, 3, '?', 12)),
  wavy_speech_bubble: S(bubble, Q([[-9, -1], [-5, -4], [-1, 0], [3, -4], [7, -1]])),
  sms_bubble: S(D('M -12 -8 L 12 -8 L 12 6 L 0 6 L -6 12 L -6 6 L -12 6 Z'), T(0, 2, 'SMS', 8)),
  thought_bubble: S(
    D('M -14 4 Q -18 -6 -8 -10 Q -4 -18 6 -12 Q 16 -12 14 -2 Q 18 8 6 8 Q 0 12 -8 8 Q -12 10 -14 4 Z'),
    C(-6, 15, 4),
    C(-10, 20, 2.5),
    T(0, 0, '?', 12)
  ),
  clock_exact_time: S(C(0, 0, 20), L(0, 0, 0, -7), L(0, 0, 5, 3), T(0, 17, 'note the time', 8)),
  sun_clock_10_16: S(C(0, 0, 22), L(0, 0, 0, -8), L(0, 0, 5, 3), move(S(C(0, 0, 6), rays(6, 5, 8)), 15, -15), T(0, 19, `10:00${EN_DASH}16:00`, 8)),
  stopwatch: S(C(0, 2, 16), L(0, -6, 0, -9), L(-3, -9, 3, -9), L(0, 2, 0, -4), L(0, 2, 4, 2)),
  time_tag: S(G([[-12, -6], [8, -6], [14, 0], [8, 6], [-12, 6]]), C(9, 0, 2.5), T(-3, 3, 'time', 7.5)),

  // Phone settings
  airplane_icon: S(L(-12, 0, 12, 0, { width: 2.5 }), L(-2, 0, -8, -9), L(-2, 0, -8, 9), L(10, 0, 13, -5), T(0, 17, 'airplane mode', 7.5)),
  battery_saver_icon: S(R(-10, -6, 18, 12), R(8, -3, 3, 6), L(-6, 0, 2, 0), L(-2, -4, -2, 4), T(0, 17, 'battery saver', 7.5)),
  toggles_off_list: S(toggleRows, T(-30, 29, `Auto-lock 15${EN_DASH}30 s`, 8, 'start')),

  // A small mark
  fang_marks: S(C(-2.5, 0, 3, { fill: 'ink' }), C(2.5, 0, 3, { fill: 'ink' })),
};
