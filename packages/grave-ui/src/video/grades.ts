/**
 * Camera color grades as color matrices.
 *
 * A matrix here is the 20 numbers an SVG `feColorMatrix` takes: four rows
 * (red, green, blue, alpha) of five values (red, green, blue, alpha, offset).
 *
 * Pure TypeScript with no DOM dependency.
 *
 * @module video/grades
 */

/** The looks a camera feed can be given. */
export type CamGrade = 'none' | 'vhs' | 'night' | 'infrared' | 'mono';

/** Every grade, for pickers. */
export const CAM_GRADES: readonly CamGrade[] = ['none', 'vhs', 'night', 'infrared', 'mono'];

/** Twenty numbers: four rows of five. Row-major, as `feColorMatrix` expects. */
export type ColorMatrix = readonly number[];

/** Values per row and number of rows in a color matrix. */
const MATRIX_COLUMNS = 5;
const MATRIX_ROWS = 4;

/** A matrix that leaves color unchanged. */
export const IDENTITY_MATRIX: ColorMatrix = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

/** Rec. 709 weights used to find a pixel's brightness. */
const LUMA = { r: 0.2126, g: 0.7152, b: 0.0722 } as const;

/** Where contrast pivots: middle grey. */
const CONTRAST_PIVOT = 0.5;

/** Describes one grade in plain terms. */
export interface GradeSettings {
  /** 1 keeps color, 0 is grey. */
  saturation: number;
  /** Multiplies red, green, and blue. */
  gain: readonly [number, number, number];
  /** Adds to red, green, and blue after gain (0-1). */
  lift: readonly [number, number, number];
  /** 1 leaves contrast alone, higher is harsher. */
  contrast: number;
}

/** The look of each grade. */
export const GRADE_SETTINGS: Record<CamGrade, GradeSettings> = {
  none: { saturation: 1, gain: [1, 1, 1], lift: [0, 0, 0], contrast: 1 },
  vhs: { saturation: 0.7, gain: [1.06, 1, 0.9], lift: [0.01, 0.01, 0.02], contrast: 1.08 },
  night: { saturation: 0, gain: [0.15, 1.35, 0.25], lift: [0, 0.04, 0], contrast: 1.25 },
  infrared: { saturation: 0.35, gain: [0.95, 0.95, 1.1], lift: [0, 0, 0.03], contrast: 1.35 },
  mono: { saturation: 0, gain: [1, 1, 1], lift: [0, 0, 0], contrast: 1.1 },
};

/** Expands a matrix to 5x5 by adding the fixed bottom row, so matrices can be multiplied. */
const expand = (matrix: ColorMatrix): number[][] => {
  const rows: number[][] = [];
  for (let r = 0; r < MATRIX_ROWS; r += 1) {
    rows.push(matrix.slice(r * MATRIX_COLUMNS, (r + 1) * MATRIX_COLUMNS) as number[]);
  }
  rows.push([0, 0, 0, 0, 1]);
  return rows;
};

/**
 * Combines two matrices. The result does `first`, then `second`.
 */
export const composeMatrices = (first: ColorMatrix, second: ColorMatrix): ColorMatrix => {
  const a = expand(first);
  const b = expand(second);
  const out: number[] = [];
  for (let r = 0; r < MATRIX_ROWS; r += 1) {
    for (let c = 0; c < MATRIX_COLUMNS; c += 1) {
      let sum = 0;
      for (let k = 0; k < MATRIX_COLUMNS; k += 1) sum += b[r][k] * a[k][c];
      out.push(sum);
    }
  }
  return out;
};

/** A matrix that sets saturation (1 keeps color, 0 is grey). */
const saturationMatrix = (s: number): ColorMatrix => {
  const { r, g, b } = LUMA;
  const inv = 1 - s;
  return [
    r * inv + s, g * inv, b * inv, 0, 0,
    r * inv, g * inv + s, b * inv, 0, 0,
    r * inv, g * inv, b * inv + s, 0, 0,
    0, 0, 0, 1, 0,
  ];
};

/** A matrix that applies gain, then contrast about middle grey, then lift. */
const toneMatrix = ({ gain, lift, contrast }: GradeSettings): ColorMatrix => {
  const offset = (index: number) => CONTRAST_PIVOT * (1 - contrast) + lift[index];
  return [
    gain[0] * contrast, 0, 0, 0, offset(0),
    0, gain[1] * contrast, 0, 0, offset(1),
    0, 0, gain[2] * contrast, 0, offset(2),
    0, 0, 0, 1, 0,
  ];
};

/**
 * The color matrix for a grade. `'none'` gives the identity matrix.
 *
 * @example
 * ```tsx
 * <feColorMatrix type="matrix" values={gradeMatrix('night').join(' ')} />
 * ```
 */
export const gradeMatrix = (grade: CamGrade): ColorMatrix => {
  if (grade === 'none') return IDENTITY_MATRIX;
  const settings = GRADE_SETTINGS[grade];
  return composeMatrices(saturationMatrix(settings.saturation), toneMatrix(settings));
};

/**
 * Applies a matrix to one color, all values 0-1. Useful for previews and checks.
 */
export const applyColorMatrix = (
  matrix: ColorMatrix,
  color: readonly [number, number, number, number]
): [number, number, number, number] => {
  const out: number[] = [];
  for (let r = 0; r < MATRIX_ROWS; r += 1) {
    const row = r * MATRIX_COLUMNS;
    const value =
      matrix[row] * color[0] +
      matrix[row + 1] * color[1] +
      matrix[row + 2] * color[2] +
      matrix[row + 3] * color[3] +
      matrix[row + 4];
    out.push(Math.min(1, Math.max(0, value)));
  }
  return out as [number, number, number, number];
};
