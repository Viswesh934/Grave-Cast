/**
 * AsciiArt - Hand-drawn ASCII art with typing and hover runes.
 * @module components/effects/Ascii/AsciiArt
 */

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { asciiWidth, countTypeable, getAsciiArt, revealLines, scrambleAround } from '../../../ascii';
import type { AsciiArtName } from '../../../ascii';
import { useMediaQuery, breakpoints } from '../../../hooks/useMediaQuery';
import { DEFAULT_TYPING_SPEED, useTypewriter } from '../../../hooks/useTypewriter';
import { AsciiDisplay, type AsciiDisplayProps } from './AsciiDisplay';
import { asciiTokens } from './tokens';

/** A spot in the art, in rows and columns. */
interface Spot {
  row: number;
  col: number;
}

/**
 * Props for {@link AsciiArt}. Includes every prop of {@link AsciiDisplay}.
 */
export interface AsciiArtProps extends Omit<AsciiDisplayProps, 'lines'> {
  /** A built-in name such as `skull` or `coffin`, or your own multi-line art. */
  art: AsciiArtName | string;
  /** Type the art out, one character at a time. @default false */
  typing?: boolean;
  /** Characters per second while typing. @default 240 */
  typeSpeed?: number;
  /** Show a block cursor while typing. @default true */
  cursor?: boolean;
  /** Called once when typing finishes. */
  onTyped?: () => void;
  /** Turn characters near the pointer into runes as it passes over. @default false */
  reveal?: boolean;
  /** How far the runes reach, in characters across. @default 5 */
  revealRadius?: number;
}

/**
 * ASCII art in a phosphor glow. Choose a built-in piece by name or pass your
 * own text.
 *
 * - **typing**: the art is typed out in reading order. Spaces are free, so
 *   padding never causes a pause.
 * - **reveal**: moving the pointer over the art turns nearby characters into
 *   runes that shimmer and settle back when it leaves.
 *
 * Reduced-motion users get the finished art at once, and runes without
 * shimmer. The art is exposed as one image with a label, not as individual
 * characters.
 *
 * @example
 * ```tsx
 * <AsciiArt art="skull" theme="blood" glow typing reveal label="A skull" />
 * ```
 *
 * @example Your own art
 * ```tsx
 * <AsciiArt art={`  /\\_/\\\n ( o.o )\n  > ^ <`} theme="matrix" label="A cat" />
 * ```
 */
export const AsciiArt = ({
  art,
  typing = false,
  typeSpeed = DEFAULT_TYPING_SPEED,
  cursor = true,
  onTyped,
  reveal = false,
  revealRadius = asciiTokens.runeRadius,
  onPointerMove,
  onPointerLeave,
  ...display
}: AsciiArtProps) => {
  const prefersReducedMotion = useMediaQuery(breakpoints.reducedMotion);
  const lines = useMemo(() => getAsciiArt(art), [art]);
  const columns = useMemo(() => asciiWidth(lines), [lines]);

  const ref = useRef<HTMLPreElement>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [shimmer, setShimmer] = useState(0);

  const { count, done } = useTypewriter(countTypeable(lines), {
    charsPerSecond: typeSpeed,
    enabled: typing && !prefersReducedMotion,
    restartKey: lines.join('\n'),
    onDone: onTyped,
  });

  const hovering = spot !== null;
  useEffect(() => {
    if (!hovering || prefersReducedMotion) return undefined;
    const timer = window.setInterval(() => setShimmer((value) => value + 1), asciiTokens.runeShimmerMs);
    return () => window.clearInterval(timer);
  }, [hovering, prefersReducedMotion]);

  const handleMove = (event: PointerEvent<HTMLPreElement>) => {
    onPointerMove?.(event);
    const element = ref.current;
    if (!reveal || !element || columns === 0) return;

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    setSpot({
      col: Math.floor(((event.clientX - rect.left) / rect.width) * columns),
      row: Math.floor(((event.clientY - rect.top) / rect.height) * lines.length),
    });
  };

  const handleLeave = (event: PointerEvent<HTMLPreElement>) => {
    onPointerLeave?.(event);
    setSpot(null);
  };

  const shown = useMemo(() => {
    if (typing && !done) return revealLines(lines, count, cursor);
    // `shimmer` changes the random runes every few frames while hovering.
    return reveal && spot ? scrambleAround(lines, spot.row, spot.col, revealRadius) : lines;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, typing, done, count, cursor, reveal, spot, revealRadius, shimmer]);

  return (
    <AsciiDisplay
      {...display}
      ref={ref}
      lines={shown}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    />
  );
};
