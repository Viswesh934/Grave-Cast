/**
 * BroomProgress - Story-style segment bars with a witch riding the current one
 * @module components/effects/BroomProgress
 */
import { WitchOnBroom } from '../../coven/WitchOnBroom';
import { WITCH_VIEWBOX } from '../../coven/WitchOnBroom/tokens';
import { palette } from '../../../tokens/colors';

/** Where her broom tip sits in the drawing, as a share of its width and height. */
const BROOM_TIP = { x: 0.78, y: 0.72 } as const;

export interface BroomProgressProps {
  /** How many segments, one per story. */
  count: number;
  /** The segment playing now, from 0. Earlier ones show full. */
  index: number;
  /** How far through the current segment, 0 to 1. */
  progress: number;
  /** Accessible name for the bar. @default 'Story progress' */
  label?: string;
  /** Hide the witch, leaving plain bars. @default false */
  plain?: boolean;
  /** Width of the witch drawing in pixels. @default 96 */
  witchSize?: number;
  className?: string;
}

/**
 * A row of thin segments like a status viewer, one per story. Finished
 * segments are full, the current one fills with `progress`, and the
 * {@link WitchOnBroom} rides its tip.
 *
 * It only draws; the parent owns the timer and passes `index` and `progress`.
 *
 * @example
 * ```tsx
 * <BroomProgress count={graves.length} index={current} progress={elapsed / duration} />
 * ```
 */
export function BroomProgress({
  count,
  index,
  progress,
  label = 'Story progress',
  plain = false,
  witchSize = 96,
  className = '',
}: BroomProgressProps) {
  const safeCount = Math.max(1, count);
  const current = Math.min(Math.max(0, index), safeCount - 1);
  const fill = Math.min(1, Math.max(0, progress));
  // Where the tip of the bar is, across the whole row, 0 to 1.
  const tip = (current + fill) / safeCount;
  const witchHeight = (witchSize * WITCH_VIEWBOX.height) / WITCH_VIEWBOX.width;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={safeCount}
      aria-valuenow={current + 1}
      aria-valuetext={`${current + 1} of ${safeCount}`}
      className={`relative ${className}`}
      style={plain ? undefined : { paddingTop: witchHeight * BROOM_TIP.y }}
    >
      <div className="flex gap-1">
        {Array.from({ length: safeCount }, (_, i) => (
          <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-grave-mist-500/40">
            <div
              className="h-full origin-left bg-grave-bone-200"
              style={{ transform: `scaleX(${i < current ? 1 : i === current ? fill : 0})` }}
            />
          </div>
        ))}
      </div>
      {!plain && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0"
          style={{ left: `${tip * 100}%`, transform: `translateX(-${BROOM_TIP.x * 100}%)` }}
        >
          <WitchOnBroom
            size={witchSize}
            scenery={false}
            followPointer={false}
            soundOnCast={false}
            flightSpeed="glide"
            spellColor={palette.mist[300]}
            tabIndex={-1}
            label=""
          />
        </div>
      )}
    </div>
  );
}
