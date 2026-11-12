/**
 * Color space conversions to sRGB, following CSS Color Module Level 4.
 *
 * Browsers report computed colors in the space they were written in, so a
 * page styled with `oklch()` or `color(display-p3 …)` returns those. These
 * conversions bring every one of them to sRGB so they can be compared,
 * grouped, and checked for contrast.
 *
 * The matrices are the published CSS Color 4 values.
 *
 * @module grimoire/color/spaces
 */

/** Three numbers: a color in some space, or a matrix row. */
export type Triple = readonly [number, number, number];
type Matrix = readonly [Triple, Triple, Triple];

const multiply = (m: Matrix, [a, b, c]: Triple): Triple => [
  m[0][0] * a + m[0][1] * b + m[0][2] * c,
  m[1][0] * a + m[1][1] * b + m[1][2] * c,
  m[2][0] * a + m[2][1] * b + m[2][2] * c,
];

/** sRGB transfer curve: where the curve switches from linear to a power law. */
const SRGB_DECODE_KNEE = 0.04045;
const SRGB_ENCODE_KNEE = 0.0031308;
const SRGB_LINEAR_SLOPE = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_GAMMA = 2.4;

/** sRGB (0-1) to linear light. Keeps the sign, so out-of-range values survive. */
export const srgbToLinear = (value: number): number => {
  const abs = Math.abs(value);
  const linear = abs <= SRGB_DECODE_KNEE ? abs / SRGB_LINEAR_SLOPE : ((abs + SRGB_OFFSET) / (1 + SRGB_OFFSET)) ** SRGB_GAMMA;
  return Math.sign(value) * linear;
};

/** Linear light to sRGB (0-1). Keeps the sign. */
export const linearToSrgb = (value: number): number => {
  const abs = Math.abs(value);
  const encoded = abs <= SRGB_ENCODE_KNEE ? abs * SRGB_LINEAR_SLOPE : (1 + SRGB_OFFSET) * abs ** (1 / SRGB_GAMMA) - SRGB_OFFSET;
  return Math.sign(value) * encoded;
};

/** Rec. 2020 transfer curve constants. */
const REC2020_ALPHA = 1.09929682680944;
const REC2020_BETA = 0.018053968510807;
const REC2020_LINEAR_SLOPE = 4.5;
const REC2020_EXPONENT = 0.45;

const rec2020ToLinear = (value: number): number => {
  const abs = Math.abs(value);
  const linear =
    abs < REC2020_BETA * REC2020_LINEAR_SLOPE
      ? abs / REC2020_LINEAR_SLOPE
      : ((abs + REC2020_ALPHA - 1) / REC2020_ALPHA) ** (1 / REC2020_EXPONENT);
  return Math.sign(value) * linear;
};

/** XYZ (D65) to linear sRGB. */
const XYZ_D65_TO_LINEAR_SRGB: Matrix = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
];

/** Bradford adaptation from the D50 white point to D65. */
const D50_TO_D65: Matrix = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
];

/** Linear Display P3 to XYZ (D65). */
const LINEAR_P3_TO_XYZ_D65: Matrix = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976],
];

/** Linear Rec. 2020 to XYZ (D65). */
const LINEAR_REC2020_TO_XYZ_D65: Matrix = [
  [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
  [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
  [0, 0.028072693049087428, 1.060985057710791],
];

/** OKLab to LMS (cube-rooted), then LMS to linear sRGB. */
const OKLAB_TO_LMS: Matrix = [
  [1, 0.3963377774, 0.2158037573],
  [1, -0.1055613458, -0.0638541728],
  [1, -0.0894841775, -1.291485548],
];
const LMS_TO_LINEAR_SRGB: Matrix = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
];

/** CIE Lab constants: the D50 white point and the two thresholds of the curve. */
const D50_WHITE: Triple = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
const LAB_KAPPA = 24389 / 27;
const LAB_EPSILON = 216 / 24389;
const LAB_L_OFFSET = 16;
const LAB_L_SCALE = 116;
const LAB_A_SCALE = 500;
const LAB_B_SCALE = 200;

const DEGREES_TO_RADIANS = Math.PI / 180;

/** Converts all three channels of a linear color to sRGB. */
const encodeSrgb = ([r, g, b]: Triple): Triple => [linearToSrgb(r), linearToSrgb(g), linearToSrgb(b)];

/** XYZ with a D65 white point to sRGB (0-1, unclipped). */
export const xyzD65ToSrgb = (xyz: Triple): Triple => encodeSrgb(multiply(XYZ_D65_TO_LINEAR_SRGB, xyz));

/** XYZ with a D50 white point to sRGB (0-1, unclipped). */
export const xyzD50ToSrgb = (xyz: Triple): Triple => xyzD65ToSrgb(multiply(D50_TO_D65, xyz));

/** CIE Lab (D50; L 0-100) to sRGB (0-1, unclipped). */
export const labToSrgb = ([l, a, b]: Triple): Triple => {
  const fy = (l + LAB_L_OFFSET) / LAB_L_SCALE;
  const fx = fy + a / LAB_A_SCALE;
  const fz = fy - b / LAB_B_SCALE;
  const x = fx ** 3 > LAB_EPSILON ? fx ** 3 : (LAB_L_SCALE * fx - LAB_L_OFFSET) / LAB_KAPPA;
  const y = l > LAB_KAPPA * LAB_EPSILON ? fy ** 3 : l / LAB_KAPPA;
  const z = fz ** 3 > LAB_EPSILON ? fz ** 3 : (LAB_L_SCALE * fz - LAB_L_OFFSET) / LAB_KAPPA;
  return xyzD50ToSrgb([x * D50_WHITE[0], y * D50_WHITE[1], z * D50_WHITE[2]]);
};

/** Polar to rectangular: chroma and hue (degrees) to the two axes. */
export const polarToAxes = (chroma: number, hueDegrees: number): [number, number] => {
  const radians = hueDegrees * DEGREES_TO_RADIANS;
  return [chroma * Math.cos(radians), chroma * Math.sin(radians)];
};

/** CIE LCH (D50) to sRGB (0-1, unclipped). */
export const lchToSrgb = ([l, c, h]: Triple): Triple => labToSrgb([l, ...polarToAxes(c, h)]);

/** OKLab (L 0-1) to sRGB (0-1, unclipped). */
export const oklabToSrgb = (lab: Triple): Triple => {
  const [l, m, s] = multiply(OKLAB_TO_LMS, lab);
  return encodeSrgb(multiply(LMS_TO_LINEAR_SRGB, [l ** 3, m ** 3, s ** 3]));
};

/** OKLCH to sRGB (0-1, unclipped). */
export const oklchToSrgb = ([l, c, h]: Triple): Triple => oklabToSrgb([l, ...polarToAxes(c, h)]);

/** Linear sRGB to sRGB (0-1, unclipped). */
export const linearSrgbToSrgb = (rgb: Triple): Triple => encodeSrgb(rgb);

/** Display P3 (0-1) to sRGB (0-1, unclipped). */
export const displayP3ToSrgb = ([r, g, b]: Triple): Triple =>
  xyzD65ToSrgb(multiply(LINEAR_P3_TO_XYZ_D65, [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)]));

/** Rec. 2020 (0-1) to sRGB (0-1, unclipped). */
export const rec2020ToSrgb = ([r, g, b]: Triple): Triple =>
  xyzD65ToSrgb(multiply(LINEAR_REC2020_TO_XYZ_D65, [rec2020ToLinear(r), rec2020ToLinear(g), rec2020ToLinear(b)]));

/**
 * The CSS Color 4 HSL formula works on a 12-step wheel (30° per step). Each
 * channel rises over steps 0-3 and falls after step 9; red, green, and blue
 * start at steps 0, 8, and 4.
 */
const HSL_DEGREES_PER_STEP = 30;
const HSL_WHEEL_STEPS = 12;
const HSL_RISE_END = 3;
const HSL_FALL_START = 9;
const HSL_CHANNEL_OFFSETS: Triple = [0, 8, 4];

/** HSL (hue in degrees, saturation and lightness 0-1) to sRGB (0-1). */
export const hslToSrgb = (hue: number, saturation: number, lightness: number): Triple => {
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channel = (offset: number) => {
    const step = (offset + hue / HSL_DEGREES_PER_STEP) % HSL_WHEEL_STEPS;
    return lightness - chroma * Math.max(-1, Math.min(step - HSL_RISE_END, HSL_FALL_START - step, 1));
  };
  return [channel(HSL_CHANNEL_OFFSETS[0]), channel(HSL_CHANNEL_OFFSETS[1]), channel(HSL_CHANNEL_OFFSETS[2])];
};

/** The pure hue HWB starts from: full saturation, half lightness. */
const HWB_BASE_LIGHTNESS = 0.5;

/** HWB (hue in degrees, whiteness and blackness 0-1) to sRGB (0-1). */
export const hwbToSrgb = (hue: number, whiteness: number, blackness: number): Triple => {
  if (whiteness + blackness >= 1) {
    const gray = whiteness / (whiteness + blackness);
    return [gray, gray, gray];
  }
  const pure = hslToSrgb(hue, 1, HWB_BASE_LIGHTNESS);
  const scale = 1 - whiteness - blackness;
  return [pure[0] * scale + whiteness, pure[1] * scale + whiteness, pure[2] * scale + whiteness];
};
