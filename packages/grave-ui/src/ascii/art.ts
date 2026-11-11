/**
 * A small library of hand-drawn ASCII art.
 *
 * @module ascii/art
 */

/**
 * Cleans pasted art: drops blank lines at the start and end, and trailing
 * spaces on every line. Leading spaces are kept because they position the art.
 */
export const normalizeArt = (text: string): string[] => {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.replace(/\s+$/, ''));
  while (lines.length > 0 && lines[0] === '') lines.shift();
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines;
};

/** Tag for writing art without escaping backslashes. */
const art = (strings: TemplateStringsArray): string[] => normalizeArt(strings.raw[0]);

/**
 * Built-in art. Each piece is a list of lines.
 */
export const ASCII_ART = {
  skull: art`
      .-----.
    .'  . .  '.
   /   (o|o)   \
  |      ^      |
   \   \___/   /
    '. |_|_| .'
      '-----'
`,
  coffin: art`
        ______
       /      \
      /   ||   \
     /  --||--  \
     \    ||    /
      \   ||   /
       \  ||  /
        \____/
`,
  bat: art`
  /\          /\
 /  \  .--.  /  \
/    \/ oo \/    \
\  /\ \ \/ / /\  /
 \/  \/'--'\/  \/
`,
  candle: art`
      ,
     /|\
    ( | )
     \|/
      |
     .|.
     | |
     | |
   __| |__
  (_______)
`,
  headstone: art`
     .-------.
    /    _    \
   |    _|_    |
   |   - | -   |
   |     |     |
   |   R.I.P   |
   |           |
 __|___________|__
`,
  ghost: art`
     .-----.
    /  o o  \
   |    ^    |
   |  \___/  |
   |         |
   |  /\ /\  |
    \/  v  \/
`,
  cross: art`
        _
       | |
       | |
   ____| |____
  |____   ____|
       | |
       | |
       | |
       | |
       |_|
`,
  spider: art`
        |
        |
    \  .-.  /
     \(o o)/
   ---( ^ )---
     /(   )\
    /  '-'  \
`,
} as const;

/** Name of a built-in piece of art. */
export type AsciiArtName = keyof typeof ASCII_ART;

/** Every built-in art name, handy for building pickers. */
export const ASCII_ART_NAMES = Object.keys(ASCII_ART) as AsciiArtName[];

/**
 * Gets lines of art from a built-in name or from your own text.
 *
 * @param source - An art name such as `skull`, or any multi-line string.
 */
export const getAsciiArt = (source: AsciiArtName | string): string[] =>
  source in ASCII_ART ? [...ASCII_ART[source as AsciiArtName]] : normalizeArt(source);

/** Width of the widest line, counting whole characters rather than UTF-16 units. */
export const asciiWidth = (lines: readonly string[]): number =>
  lines.reduce((widest, line) => Math.max(widest, Array.from(line).length), 0);
