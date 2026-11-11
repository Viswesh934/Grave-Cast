/**
 * ContrastBadge - A contrast ratio and the WCAG level it meets
 * @module components/grimoire/ContrastBadge
 */

import type { CSSProperties } from 'react';
import { formatContrastRatio, type ContrastRating } from '../../grimoire/color/contrast';
import { contrastVerdictColors } from '../../grimoire/tokens';
import { srOnlyStyle } from '../../tokens/accessibility';
import { withAlpha } from '../../tokens/colors';
import { ACCENT_STRENGTH, riteTokens } from './tokens';

/**
 * Props for {@link ContrastBadge}.
 */
export interface ContrastBadgeProps {
  /** The contrast ratio, from `contrastRatio` or `textContrast`. */
  ratio: number;
  /** The level it meets, from `rateContrast` or `textContrast`. */
  rating: ContrastRating;
  /** The text is large, so lower thresholds apply. @default false */
  large?: boolean;
  /** `false` when the background had to be estimated. Shows "≈". @default true */
  certain?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the badge. */
  style?: CSSProperties;
}

const { space, radius, font, line } = riteTokens;

/** What the rating means, in words. */
const VERDICT: Record<ContrastRating, string> = { AAA: 'AAA', AA: 'AA', fail: 'Fails' };

/**
 * Shows a contrast ratio and its WCAG 2 level, colored green, pale green, or
 * red. Estimates are marked with "≈", and screen readers hear the whole
 * verdict in words. The ratio is never rounded up into a pass.
 *
 * @example
 * ```tsx
 * const result = textContrast(paragraph);
 * <ContrastBadge {...result} />
 * ```
 */
export const ContrastBadge = ({ ratio, rating, large = false, certain = true, className, style }: ContrastBadgeProps) => {
  const color = contrastVerdictColors[rating];
  const ratioText = formatContrastRatio(ratio);
  const spoken = `Contrast ${ratioText.replace(':1', ' to 1')}${certain ? '' : ', estimated'}. ${
    rating === 'fail' ? 'Below WCAG AA' : `Meets WCAG ${rating}`
  }${large ? ' for large text' : ''}.`;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: space.sm,
        padding: `${space.xs} ${space.sm}`,
        borderRadius: radius.pill,
        border: `${line.hairline} solid ${withAlpha(color, ACCENT_STRENGTH.ring)}`,
        background: withAlpha(color, ACCENT_STRENGTH.soft),
        color,
        fontFamily: font.mono,
        fontSize: font.small,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span style={srOnlyStyle}>{spoken}</span>
      <span aria-hidden="true">
        {certain ? '' : '≈ '}
        {ratioText}
      </span>
      <span aria-hidden="true" style={{ fontWeight: font.weight.bold }}>
        {VERDICT[rating]}
        {large ? ' · large' : ''}
      </span>
    </span>
  );
};
