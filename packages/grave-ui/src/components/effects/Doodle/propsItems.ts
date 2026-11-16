/**
 * Objects for doodles: first-aid supplies, survival gear, household things and
 * scenery. Each is a list of shapes (see `shapes.ts`); ids match the doodle
 * scripts in docs/KIT_SCRIPTS.md. Objects that stand on the ground have their
 * base at y = 0; the rest are centred on (0, 0). Words on a prop restate what
 * the step's caption already says, such as a quantity, and never add to it.
 * @module components/effects/Doodle/propsItems
 */
import { A, AR, C, D, E, G, L, P, Q, R, S, T, move, rays, type Shape } from './shapes';

const EN_DASH = '\u2013';

const jug = S(D('M -8 -10 L -4 -14 L 4 -14 L 8 -10 L 8 8 L -8 8 Z'), P([[8, -6], [13, -6], [13, 2], [8, 2]]));
const house = S(G([[-30, 0], [-30, -24], [0, -44], [30, -24], [30, 0]]), R(-5, -16, 10, 16));
/** A pad of gauze: a square with a weave. */
const pad = S(R(-9, -9, 18, 18), L(-9, -3, 9, -3), L(-9, 3, 9, 3), L(-3, -9, -3, 9), L(3, -9, 3, 9));
/** A wavy layer of leaves, `depth` units down. */
const layer = (depth: number): [number, number][] =>
  [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map((x, index) => [x, depth + (index % 2 === 0 ? 0 : -3)]);

/** The object props, as shape lists, by id. `props.ts` turns each into a drawable prop. */
export const ITEM_SHAPES: Readonly<Record<string, Shape[]>> = {
  // First aid and care
  blanket: S(G([[-26, -6], [-20, -9], [-8, -6], [4, -9], [16, -6], [26, -8], [26, 6], [-26, 6]]), L(-20, -2, 20, -2, { dash: true })),
  support_bag: S(R(-12, -6, 24, 12), L(-12, 0, 12, 0), AR(20, -14, 20, 6, true), T(24, -4, '30 cm', 8, 'start')),
  folded_jacket: S(R(-12, -5, 24, 10), L(-12, 0, 12, 0), L(-4, -5, -4, 5)),
  cleared_chair: S(L(-6, -14, -6, 0), L(-6, -4, 6, -4), L(6, -4, 6, 2), L(-6, 0, -6, 6), AR(10, -2, 20, -2, false, { dash: true })),
  chemical_bottle: S(R(-5, -6, 10, 16), R(-3, -10, 6, 4), L(-3, 1, 3, 7), L(3, 1, -3, 7)),
  wall_support: S(L(0, -30, 0, 6, { width: 2.5 }), L(0, -24, 6, -30), L(0, -14, 6, -20), L(0, -4, 6, -10), L(0, 6, 6, 0)),
  aspirin_tablet: S(C(0, 0, 12), L(-4, 0, 4, 0), T(0, 14, 'aspirin', 8)),
  epipen_simple: S(R(-18, -4, 24, 8), R(6, -5, 10, 10), L(-18, 0, -24, 0, { width: 3 }), L(-24, -2, -24, 2)),
  gauze_pad: pad,
  gauze_double: S(R(-9, -8, 18, 18), R(-6, -13, 18, 18), L(-6, -7, 12, -7)),
  roller_bandage: S(C(0, 0, 16), C(0, 0, 7), L(0, -8, 18, -8), L(18, -8, 18, -3)),
  tourniquet_simple: S(R(-12, -5, 24, 10), L(-3, -13, 3, 13, { width: 3 }), C(0, 0, 5)),
  ring_watch: S(C(-10, 2, 11), C(-10, -5, 3, { fill: 'ink' }), R(5, -5, 12, 10), L(8, -10, 8, -5), L(14, -10, 14, -5), L(8, 5, 8, 10), L(14, 5, 14, 10), T(-10, 17, 'ring', 7.5), T(11, 17, 'watch', 7.5)),
  cling_wrap_sheet: S(R(-14, -9, 28, 18, { dash: true }), L(-10, 5, 4, -9), L(-4, 9, 12, -7)),
  splint_boards: S(R(-34, -17, 68, 7), R(-34, 10, 68, 7)),
  tie_strips: S(L(-16, -18, -16, 18, { width: 2.5 }), L(16, -18, 16, 18, { width: 2.5 })),
  wrapped_ice_pack: S(R(-10, -8, 20, 16), L(-10, -2, 10, -2), L(-10, 3, 10, 3), T(0, -12, 'cold', 8)),
  flat_splint: S(R(-30, -3, 60, 6)),
  ice_packs_core: S(R(-9, -7, 18, 14), L(-9, -1, 9, -1), T(0, -11, 'cold packs', 8), T(0, 19, 'neck, armpits, groin', 8)),
  beanie_hat: S(D('M -12 0 Q -12 -16 0 -16 Q 12 -16 12 0 Z'), R(-13, -1, 26, 5), C(0, -19, 5)),
  warm_mug: S(R(-8, -8, 16, 16), P([[8, -4], [13, -4], [13, 3], [8, 3]]), Q([[-3, -12], [-1, -15], [-3, -18]]), Q([[3, -12], [5, -15], [3, -18]])),
  core_heat_packs: S(R(-15, -8, 12, 16), R(3, -8, 12, 16), Q([[-12, -12], [-9, -15], [-12, -18]]), Q([[9, -12], [12, -15], [9, -18]]), T(0, 20, 'armpits, chest, groin', 8)),
  snake_retreating: S(Q([[-18, 4], [-10, -4], [-2, 4], [6, -4], [14, 2]]), C(17, 1, 6), L(20, 1, 24, -1), L(20, 1, 24, 3)),

  // Electricity
  breaker_box: S(R(-9, -12, 18, 24), R(-3, -8, 6, 10), L(0, -8, 0, -2, { width: 3 }), T(0, 9, 'OFF', 7.5)),
  frayed_wire: S(Q([[-24, 0], [-12, -6], [0, 0], [10, 2]]), L(12, -4, 16, -8), L(13, 1, 19, 1), L(12, 5, 16, 9)),
  dry_wood_board: S(R(-20, -3, 40, 6), L(-14, 0, -4, 0), L(6, 0, 14, 0)),
  wooden_pole: S(L(-30, 0, 30, 0, { width: 3 })),

  // Water, heat and cold
  water_tap: S(L(-14, -10, 2, -10, { width: 3 }), L(2, -10, 2, -4), L(-1, -4, 5, -4), L(2, 0, 2, 3), L(2, 7, 2, 10), L(2, 14, 2, 17)),
  shade_tree: S(L(0, 0, 0, -24, { width: 3 }), C(0, -32, 30), L(-6, -26, 0, -20), L(6, -24, 0, -18)),
  tent_outline: S(G([[-22, 0], [0, -26], [22, 0]]), L(0, -26, 0, 0, { dash: true })),
  water_bottle: S(D('M -4 -14 L 4 -14 L 4 -10 L 7 -6 L 7 10 L -7 10 L -7 -6 L -4 -10 Z'), L(-7, 2, 7, 2, { dash: true })),
  closed_blinds: S(R(-14, -16, 28, 32), L(-14, -10, 14, -10), L(-14, -4, 14, -4), L(-14, 2, 14, 2), L(-14, 8, 14, 8)),

  // Making water safe
  water_jug: jug,
  cloth_filter: S(Q([[-16, 0], [-8, 4], [0, 0], [8, 4], [16, 0]]), L(-16, -3, -16, 4), L(16, -3, 16, 4)),
  clean_pot: S(D('M -14 -10 L 14 -10 L 12 10 L -12 10 Z'), L(-18, -6, -14, -6), L(14, -6, 18, -6)),
  clear_pet_bottle: S(
    D('M -5 -12 L 5 -12 L 5 -8 L 8 -4 L 8 12 L -8 12 L -8 -4 L -5 -8 Z'),
    L(-8, 2, 8, 2, { dash: true }),
    move(S(C(0, 0, 7), rays(6, 5, 8)), 16, -12),
    T(0, 22, '6 hours in sun', 7.5)
  ),
  camp_fire: S(
    L(-10, 0, 10, -4),
    L(-10, -4, 10, 0),
    D('M -5 -3 Q -9 -12 -2 -17 Q -2 -10 2 -12 Q 7 -8 5 -3 Z'),
    D('M -1 -3 Q -3 -8 0 -10 Q 2 -7 1 -3 Z')
  ),

  // Being found
  helicopter_simple: S(E(0, 0, 22, 12), L(10, 0, 26, -4), L(-14, -9, 14, -9), L(0, -6, 0, -9), L(-8, 8, 8, 8)),
  signal_v_and_x: S(
    P([[-24, -10], [-16, 10], [-8, -10]], { width: 3 }),
    L(8, -10, 24, 10, { width: 3 }),
    L(24, -10, 8, 10, { width: 3 }),
    T(-16, 22, 'V help', 8),
    T(16, 22, 'X medical', 8),
    T(0, -16, '3 m or longer', 7.5)
  ),
  whistle_3x_waves: S(C(0, 0, 12), R(2, -4, 12, 6), A(16, -1, 10, 10, -60, 60), A(16, -1, 18, 18, -60, 60), A(16, -1, 26, 26, -60, 60), T(-14, -12, '3x', 9)),
  mirror_beam: S(R(-8, -10, 16, 12), L(0, 2, 0, 8), L(8, -10, 30, -26, { dash: true }), P([[24, -26], [30, -26], [28, -20]])),
  rescue_pole: S(L(-30, 0, 30, 0, { width: 2.5 }), P([[-30, 0], [-34, -4], [-30, -8]])),
  rock_cairn: S(E(0, 4, 26, 10), E(0, -4, 19, 8), E(0, -10, 12, 6)),
  bright_tarp_marker: S(R(-16, -10, 32, 20), L(-16, -10, 16, 10), L(16, -10, -16, 10), T(0, 20, 'bright tarp', 7.5)),
  trail_marker: S(L(0, 0, 0, -30, { width: 2.5 }), G([[0, -30], [18, -30], [24, -24], [18, -18], [0, -18]])),
  map_and_compass: S(R(-26, -14, 30, 24), L(-16, -14, -16, 10), L(-6, -14, -6, 10), C(20, 8, 16), L(20, 8, 23, 2), L(20, 8, 17, 14)),

  // Shelter
  leaf_mattress_layer: S(Q(layer(0)), Q(layer(5)), Q(layer(10)), AR(58, -4, 58, 12, true), T(62, 6, `10${EN_DASH}15 cm`, 8, 'start')),
  tarp_a_frame: S(G([[-26, 0], [0, -30], [26, 0]]), L(-26, 0, 26, 0)),

  // The phone
  phone_simple: S(R(-12, -22, 24, 44), R(-9, -17, 18, 32), C(0, 18, 3)),
  phone_in_jacket: S(R(-18, -20, 36, 40), P([[-12, -4], [-12, 8], [4, 8], [4, -4]]), R(-10, -12, 10, 16), T(0, 28, 'inner pocket', 8)),

  // Floods, storms and homes
  hill_path: S(Q([[-40, 0], [-16, -6], [0, -18], [16, -30], [40, -34]]), Q([[-30, -2], [-8, -14], [10, -22], [34, -38]], { dash: true })),
  box_car: S(R(-24, -12, 48, 14), P([[-14, -12], [-9, -24], [9, -24], [14, -12]]), C(-14, 2, 10), C(14, 2, 10)),
  water_depth_ruler_15_30cm: S(L(0, -40, 0, 0), L(0, -14, 8, -14), L(0, -28, 8, -28), T(11, -11, '15 cm', 8, 'start'), T(11, -25, '30 cm', 8, 'start')),
  house_outline: house,
  house_outline_cutaway: S(house, R(-12, -24, 24, 24, { dash: true })),
  window_boards: S(R(-10, -10, 20, 20), L(-12, -6, 12, -6, { width: 3 }), L(-12, 6, 12, 6, { width: 3 })),
  water_jugs_4l: S(jug, move(jug, 16, 0), T(8, 20, '4 L per person per day', 7.5)),
  flashlight: S(R(-14, -4, 18, 8), G([[4, -6], [10, -8], [10, 8], [4, 6]]), L(12, -4, 24, -8), L(12, 0, 26, 0), L(12, 4, 24, 8)),
  radio_simple: S(R(-14, -8, 28, 18), L(8, -8, 16, -20), C(-5, 1, 10), L(4, -3, 10, -3), L(4, 3, 10, 3)),
  cyclone_spiral_simple: S(D('M 0 -17 Q 18 -17 18 0 Q 18 22 -4 22 Q -28 22 -28 -2 Q -28 -30 4 -30 Q 38 -30 38 2 Q 38 38 -6 38')),

  // Fire and doors
  exit_door: S(R(-9, -20, 18, 20), C(5, -10, 2.5), T(0, -26, 'EXIT', 8)),
  closed_door_heat: S(R(-12, -30, 24, 30), C(7, -15, 3), Q([[-18, -24], [-15, -20], [-18, -16]]), Q([[18, -24], [21, -20], [18, -16]])),
  stairs_simple: S(P([[-24, 0], [-24, -8], [-12, -8], [-12, -16], [0, -16], [0, -24], [12, -24], [12, -32], [24, -32]])),

  // Seats and tables
  /** A plain seat, a log or a chair. Poses that sit \on a seat\ have their hips 26 units above the ground; this puts something under them. */
  seat_simple: S(R(-15, -24, 30, 4), L(-12, -20, -12, 0), L(12, -20, 12, 0)),
  sturdy_table: S(R(-30, -38, 60, 5), L(-26, -33, -26, 0), L(26, -33, 26, 0)),
};
