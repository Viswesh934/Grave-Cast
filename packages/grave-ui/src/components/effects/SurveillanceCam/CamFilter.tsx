/**
 * CamFilter - An SVG filter that splits color channels and regrades color.
 * @module components/effects/SurveillanceCam/CamFilter
 */

import type { ColorMatrix } from '../../../video/grades';

/** Pulls one channel (and the alpha) out of the picture. */
const channelMatrix = (channel: 0 | 1 | 2): string => {
  const row = [0, 0, 0, 0, 0];
  row[channel] = 1;
  const zeros = '0 0 0 0 0';
  const rows = [zeros, zeros, zeros];
  rows[channel] = row.join(' ');
  return `${rows.join(' ')} 0 0 0 1 0`;
};

/**
 * Props for {@link CamFilter}.
 */
export interface CamFilterProps {
  /** The id to point a CSS `filter: url(#id)` at. Must be unique on the page. */
  id: string;
  /** How far red and blue slide apart, in px. 0 skips the split. @default 0 */
  aberration?: number;
  /** A color matrix applied after the split, for example from `gradeMatrix()`. */
  matrix?: ColorMatrix;
}

/**
 * Renders a zero-size, hidden SVG holding one filter. Apply it to any element
 * with `style={{ filter: 'url(#id)' }}`.
 *
 * The split pulls out red and blue, slides them in opposite directions, and
 * screens them back over green, which gives the colored fringes of a cheap lens.
 *
 * @example
 * ```tsx
 * <CamFilter id="my-cam" aberration={2} matrix={gradeMatrix('night')} />
 * <video style={{ filter: 'url(#my-cam)' }} />
 * ```
 */
export const CamFilter = ({ id, aberration = 0, matrix }: CamFilterProps) => (
  <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <filter id={id} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        {aberration > 0 && (
          <>
            <feColorMatrix in="SourceGraphic" type="matrix" values={channelMatrix(0)} result="red" />
            <feColorMatrix in="SourceGraphic" type="matrix" values={channelMatrix(1)} result="green" />
            <feColorMatrix in="SourceGraphic" type="matrix" values={channelMatrix(2)} result="blue" />
            <feOffset in="red" dx={-aberration} dy="0" result="redShifted" />
            <feOffset in="blue" dx={aberration} dy="0" result="blueShifted" />
            <feBlend in="redShifted" in2="green" mode="screen" result="redGreen" />
            <feBlend in="redGreen" in2="blueShifted" mode="screen" result="split" />
          </>
        )}
        {matrix && (
          <feColorMatrix
            in={aberration > 0 ? 'split' : 'SourceGraphic'}
            type="matrix"
            values={matrix.join(' ')}
          />
        )}
      </filter>
    </defs>
  </svg>
);
