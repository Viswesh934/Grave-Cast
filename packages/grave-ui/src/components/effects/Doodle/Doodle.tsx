/**
 * Doodle: one hand-drawn stick-figure drawing, generated from data.
 * @module components/effects/Doodle/Doodle
 */
import { useMemo, type CSSProperties } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { doodleRegistry, renderDoodle } from './render';
import { doodleMotion, doodleText } from './tokens';
import type { DoodleRegistry, DoodleSpec } from './types';

/** Class names used by the doodle's stylesheet. */
export const DOODLE_CLASS = {
  root: 'grave-doodle',
  draw: 'grave-doodle__draw',
  label: 'grave-doodle__label',
  push: 'grave-doodle__push',
} as const;

const doodleStyles = `
@keyframes grave-doodle-draw { to { stroke-dashoffset: 0; } }
@keyframes grave-doodle-appear { to { opacity: 1; } }
@keyframes grave-doodle-push { 50% { transform: translateY(${doodleMotion.pushDistance}px); } }
.${DOODLE_CLASS.draw} { stroke-dasharray: 1; stroke-dashoffset: 1; animation: grave-doodle-draw ${doodleMotion.drawMs}ms ease-out forwards; }
.${DOODLE_CLASS.label} { opacity: 0; animation: grave-doodle-appear ${doodleMotion.drawMs}ms ease-out forwards; }
.${DOODLE_CLASS.push} { animation: grave-doodle-push ${doodleMotion.pushMs}ms ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .${DOODLE_CLASS.draw}, .${DOODLE_CLASS.label}, .${DOODLE_CLASS.push} { animation: none; stroke-dashoffset: 0; opacity: 1; }
}
`;

export interface DoodleProps {
  /** The drawing, as data. */
  doodle: DoodleSpec;
  /** One sentence describing the drawing, read by screen readers. */
  description: string;
  /** Poses and props to draw with. Defaults to the built-in library. */
  registry?: DoodleRegistry;
  /**
   * Draw the lines one after another, as if by hand. Off when the person asks
   * for less motion. @default true
   */
  draw?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Draws a doodle: stick figures in named poses, props, and one highlighted
 * detail, in a hand-drawn line style that looks the same on every device.
 *
 * @example
 * ```tsx
 * <Doodle
 *   description="A helper kneels beside a person lying on their back."
 *   doodle={{
 *     id: 'example',
 *     figures: [
 *       { role: 'victim', pose: 'lying_supine', x: 80 },
 *       { role: 'helper', pose: 'kneeling_beside', x: 120 },
 *     ],
 *   }}
 * />
 * ```
 */
export const Doodle = ({ doodle, description, registry = doodleRegistry, draw = true, className, style }: DoodleProps) => {
  const lessMotion = useReducedMotion();
  const rendered = useMemo(() => renderDoodle(doodle, registry), [doodle, registry]);
  const animate = draw && !lessMotion;
  let order = 0;
  const delay = () => {
    order += 1;
    return animate ? { animationDelay: `${(order - 1) * doodleMotion.staggerMs}ms` } : undefined;
  };

  return (
    <svg
      viewBox={`0 0 ${rendered.width} ${rendered.height}`}
      role="img"
      aria-label={description}
      className={[DOODLE_CLASS.root, className].filter(Boolean).join(' ')}
      style={{ display: 'block', width: '100%', height: 'auto', ...style }}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <style>{doodleStyles}</style>
      {rendered.groups.map((group) => (
        <g
          key={group.key}
          transform={group.transform}
          className={animate && group.motion === 'push' ? DOODLE_CLASS.push : undefined}
        >
          {group.marks.map((mark, index) =>
            mark.kind === 'path' ? (
              <path
                key={index}
                d={mark.d}
                stroke={mark.stroke}
                strokeWidth={mark.strokeWidth}
                fill={mark.fill}
                opacity={mark.opacity}
                pathLength={1}
                vectorEffect={group.keepStrokeWidth ? 'non-scaling-stroke' : undefined}
                // Outlines show at once; solid shapes fade in; strokes draw themselves.
                className={!animate || mark.halo ? undefined : mark.fill !== 'none' ? DOODLE_CLASS.label : DOODLE_CLASS.draw}
                style={mark.halo ? undefined : delay()}
              />
            ) : (
              <text
                key={index}
                x={mark.x}
                y={mark.y}
                fontSize={mark.size}
                fontFamily={doodleText.family}
                fill={mark.color}
                textAnchor={mark.anchor}
                className={animate ? DOODLE_CLASS.label : undefined}
                style={delay()}
              >
                {mark.text}
              </text>
            )
          )}
        </g>
      ))}
    </svg>
  );
};
