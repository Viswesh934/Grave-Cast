/**
 * AsciiBanner - Big block-letter text.
 * @module components/effects/Ascii/AsciiBanner
 */

import { useMemo } from 'react';
import { renderBanner, type BannerOptions } from '../../../ascii';
import { AsciiArt, type AsciiArtProps } from './AsciiArt';

/**
 * Props for {@link AsciiBanner}. Includes the typing and hover options of
 * {@link AsciiArt}, and the font options of `renderBanner`.
 */
export interface AsciiBannerProps extends Omit<AsciiArtProps, 'art'>, BannerOptions {
  /** The words to draw. Letters are upper-cased. */
  text: string;
}

/**
 * Draws text as large block letters in a phosphor glow. It supports the same
 * typing and hover-rune effects as {@link AsciiArt}.
 *
 * The accessible label is the text itself, so screen readers read the words
 * and not the shapes.
 *
 * @example
 * ```tsx
 * <AsciiBanner text="Here lies Grave UI" maxCols={60} theme="blood" typing />
 * ```
 */
export const AsciiBanner = ({
  text,
  fill,
  empty,
  gap,
  maxCols,
  label,
  ...art
}: AsciiBannerProps) => {
  const banner = useMemo(
    () => renderBanner(text, { fill, empty, gap, maxCols }).join('\n'),
    [text, fill, empty, gap, maxCols]
  );

  return <AsciiArt {...art} art={banner} label={label ?? text} />;
};
