/**
 * Checks doodle data before it is drawn: every pose and prop must exist, every
 * highlight must point at something real, and every panel needs its caption
 * and description. Each problem says where it is and what is wrong.
 * @module components/effects/Doodle/validate
 */
import { doodleRegistry } from './render';
import { DOODLE_JOINTS, type DoodleRegistry, type DoodleSpec, type DoodleStripSpec } from './types';

/** One problem in doodle data. */
export interface DoodleIssue {
  /** Where it is, such as `panels[1].doodle.figures[0].pose`. */
  path: string;
  message: string;
}

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isBlank = (value: unknown) => typeof value !== 'string' || value.trim() === '';

/** Problems in one doodle. An empty list means it is ready to draw. */
export const validateDoodle = (spec: DoodleSpec, registry: DoodleRegistry = doodleRegistry, at = 'doodle'): DoodleIssue[] => {
  const issues: DoodleIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path: `${at}.${path}`, message });

  if (isBlank(spec.id)) add('id', 'Every doodle needs an id.');
  if (spec.seed !== undefined && !(Number.isInteger(spec.seed) && spec.seed > 0)) add('seed', 'The seed must be a whole number above 0.');

  (spec.figures ?? []).forEach((figure, index) => {
    if (!registry.poses[figure.pose]) add(`figures[${index}].pose`, `No pose called "${figure.pose}". Add it to the pose library first.`);
    if (!isFiniteNumber(figure.x) || (figure.y !== undefined && !isFiniteNumber(figure.y))) {
      add(`figures[${index}]`, 'The position must be numbers.');
    }
    if (isBlank(figure.role)) add(`figures[${index}].role`, 'Every figure needs a role, such as "helper".');
  });

  (spec.props ?? []).forEach((placement, index) => {
    if (!registry.props[placement.prop]) add(`props[${index}].prop`, `No prop called "${placement.prop}". Add it to the prop library first.`);
    if (!isFiniteNumber(placement.x) || !isFiniteNumber(placement.y)) add(`props[${index}]`, 'The position must be numbers.');
  });

  const highlight = spec.highlight;
  if (highlight) {
    if ('figure' in highlight) {
      if (!spec.figures?.[highlight.figure]) add('highlight.figure', `There is no figure ${highlight.figure} to highlight.`);
      if (!DOODLE_JOINTS.includes(highlight.joint)) add('highlight.joint', `"${highlight.joint}" is not a joint.`);
    } else if (!spec.props?.[highlight.prop]) {
      add('highlight.prop', `There is no prop ${highlight.prop} to highlight.`);
    }
  }

  return issues;
};

/** Options for checking a strip. */
export interface ValidateStripOptions {
  /** Require a source with a name. On by default, because kit cards must name where their steps come from. */
  requireSource?: boolean;
}

/** Problems in a strip and all its panels. An empty list means it is ready to show. */
export const validateDoodleStrip = (
  strip: DoodleStripSpec,
  registry: DoodleRegistry = doodleRegistry,
  { requireSource = true }: ValidateStripOptions = {}
): DoodleIssue[] => {
  const issues: DoodleIssue[] = [];
  const add = (path: string, message: string) => issues.push({ path, message });

  if (isBlank(strip.id)) add('id', 'Every strip needs an id.');
  if (isBlank(strip.title)) add('title', 'Every strip needs a title.');
  if (requireSource && isBlank(strip.source?.name)) add('source', 'Name the source these steps come from.');
  if (strip.panels.length === 0) add('panels', 'A strip needs at least one panel.');

  const seen = new Set<string>();
  strip.panels.forEach((panel, index) => {
    const at = `panels[${index}]`;
    if (isBlank(panel.id)) add(`${at}.id`, 'Every panel needs an id.');
    else if (seen.has(panel.id)) add(`${at}.id`, `The id "${panel.id}" is used twice.`);
    seen.add(panel.id);
    if (isBlank(panel.caption)) add(`${at}.caption`, 'Every panel needs its step as a caption.');
    if (isBlank(panel.description)) add(`${at}.description`, 'Every panel needs a one-sentence description for screen readers.');
    issues.push(...validateDoodle(panel.doodle, registry, `${at}.doodle`));
  });

  return issues;
};

/** Throws one clear error listing every problem, or returns the strip unchanged. */
export const assertDoodleStrip = (
  strip: DoodleStripSpec,
  registry: DoodleRegistry = doodleRegistry,
  options?: ValidateStripOptions
): DoodleStripSpec => {
  const issues = validateDoodleStrip(strip, registry, options);
  if (issues.length > 0) {
    const list = issues.map((issue) => `  ${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Doodle strip "${strip.id}" has ${issues.length} problem(s):\n${list}`);
  }
  return strip;
};

/** Which of these pose and prop ids the registry doesn't have yet. Handy for planning a batch. */
export const missingDoodleAssets = (
  wanted: { poses?: readonly string[]; props?: readonly string[] },
  registry: DoodleRegistry = doodleRegistry
): { poses: string[]; props: string[] } => ({
  poses: [...new Set(wanted.poses ?? [])].filter((id) => !registry.poses[id]),
  props: [...new Set(wanted.props ?? [])].filter((id) => !registry.props[id]),
});
