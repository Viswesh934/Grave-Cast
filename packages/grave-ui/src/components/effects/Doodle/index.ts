/**
 * Doodle: hand-drawn stick-figure drawings and comic strips, generated from data.
 * @module components/effects/Doodle
 */
export { Doodle, DOODLE_CLASS, type DoodleProps } from './Doodle';
export { DoodleStrip, type DoodleStripProps } from './DoodleStrip';
export {
  renderDoodle,
  placeFigure,
  doodleSeed,
  doodleRegistry,
  extendDoodleRegistry,
  type RenderedDoodle,
  type DoodleGroup,
  type DoodleMark,
  type DoodlePathMark,
  type DoodleTextMark,
  type PlacedFigure,
} from './render';
export {
  validateDoodle,
  validateDoodleStrip,
  assertDoodleStrip,
  missingDoodleAssets,
  type DoodleIssue,
  type ValidateStripOptions,
} from './validate';
export { DOODLE_POSES } from './poses';
export { DOODLE_PROPS } from './props';
export { doodleInk, doodleStroke, doodleCanvas, doodleFigure, doodleText, doodleHighlight, doodleMotion, doodleChrome, doodleComic } from './tokens';
export {
  DOODLE_JOINTS,
  type DoodleJoint,
  type DoodlePoint,
  type DoodlePose,
  type DoodleFigure,
  type DoodleFigureSize,
  type DoodlePropPlacement,
  type DoodleHighlight,
  type DoodleSpec,
  type DoodlePanel,
  type DoodleSource,
  type DoodleStripSpec,
  type DoodleGenerator,
  type DoodleDrawable,
  type DoodleLabel,
  type DoodlePropContext,
  type DoodlePropDraw,
  type DoodleRegistry,
} from './types';
