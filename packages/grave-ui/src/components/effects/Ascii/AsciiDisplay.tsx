/**
 * AsciiDisplay - A themed, glowing block of monospaced text.
 * @module components/effects/Ascii/AsciiDisplay
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { useMediaQuery, breakpoints } from '../../../hooks/useMediaQuery';
import { backgroundKeyframes, bgAnimation } from '../HorrorBackground/styles';
import {
  asciiSizes,
  asciiTokens,
  glowShadow,
  phosphorThemes,
  type AsciiSize,
  type PhosphorTheme,
} from './tokens';

/**
 * Props for {@link AsciiDisplay}.
 */
export interface AsciiDisplayProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
  /** The text, one string per row. */
  lines: readonly string[];
  /** Phosphor color theme. @default 'amber' */
  theme?: PhosphorTheme;
  /** Text size. @default 'md' */
  size?: AsciiSize;
  /** Glow around the text. @default true */
  glow?: boolean;
  /** Flicker like an old monitor. Off for reduced motion. @default false */
  flicker?: boolean;
  /** Accessible description of the picture. @default 'ASCII art' */
  label?: string;
  /**
   * Hide this from screen readers, for art that only decorates the page.
   * @default false
   */
  decorative?: boolean;
}

/**
 * The shared building block for all ASCII components: a `<pre>` with phosphor
 * colors, glow, and the right font settings so rows of text join into a
 * picture.
 *
 * It is exposed to assistive technology as a single image with a label, not
 * as hundreds of punctuation marks. Pass `decorative` to hide it entirely.
 *
 * @example
 * ```tsx
 * <AsciiDisplay lines={['/\\_/\\', '( o.o )']} theme="matrix" label="A cat" />
 * ```
 */
export const AsciiDisplay = forwardRef<HTMLPreElement, AsciiDisplayProps>(
  (
    {
      lines,
      theme = 'amber',
      size = 'md',
      glow = true,
      flicker = false,
      label = 'ASCII art',
      decorative = false,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const prefersReducedMotion = useMediaQuery(breakpoints.reducedMotion);
    const tone = phosphorThemes[theme];
    const flickering = flicker && !prefersReducedMotion;

    return (
      <>
        {flickering && <style>{backgroundKeyframes}</style>}
        <pre
          ref={ref}
          role={decorative ? undefined : 'img'}
          aria-label={decorative ? undefined : label}
          aria-hidden={decorative || undefined}
          className={`grave-ascii grave-ascii--${theme} ${className}`.trim()}
          style={{
            margin: 0,
            padding: 0,
            whiteSpace: 'pre',
            overflow: 'hidden',
            letterSpacing: 0,
            fontVariantLigatures: 'none',
            fontFamily: asciiTokens.font,
            fontSize: asciiSizes[size],
            lineHeight: asciiTokens.lineHeight,
            color: tone.color,
            textShadow: glow ? glowShadow(tone.glow) : 'none',
            animation: flickering
              ? `${bgAnimation.flicker} ${asciiTokens.flickerSeconds}s ease-in-out infinite`
              : undefined,
            ...style,
          }}
          {...rest}
        >
          {lines.join('\n')}
        </pre>
      </>
    );
  }
);

AsciiDisplay.displayName = 'AsciiDisplay';
