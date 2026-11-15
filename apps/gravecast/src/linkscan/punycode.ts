/**
 * Decodes one punycode label (the part after "xn--") back into the letters a
 * person sees, following RFC 3492. Throws on input that isn't valid punycode.
 */
const BASE = 36;
const T_MIN = 1;
const T_MAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const MAX_INT = 0x7fffffff;

const digitOf = (code: number): number => {
  if (code >= 0x30 && code < 0x3a) return code - 0x30 + 26;
  if (code >= 0x41 && code < 0x5b) return code - 0x41;
  if (code >= 0x61 && code < 0x7b) return code - 0x61;
  return BASE;
};

const adapt = (delta: number, points: number, first: boolean): number => {
  let d = first ? Math.floor(delta / DAMP) : delta >> 1;
  d += Math.floor(d / points);
  let k = 0;
  while (d > ((BASE - T_MIN) * T_MAX) >> 1) {
    d = Math.floor(d / (BASE - T_MIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - T_MIN + 1) * d) / (d + SKEW));
};

export const decodePunycode = (input: string): string => {
  const output: number[] = [];
  const basicEnd = Math.max(input.lastIndexOf('-'), 0);
  for (let j = 0; j < basicEnd; j += 1) {
    const code = input.charCodeAt(j);
    if (code >= 0x80) throw new RangeError('Not valid punycode');
    output.push(code);
  }

  let n = INITIAL_N;
  let i = 0;
  let bias = INITIAL_BIAS;
  for (let index = basicEnd > 0 ? basicEnd + 1 : 0; index < input.length; ) {
    const oldI = i;
    let w = 1;
    for (let k = BASE; ; k += BASE) {
      if (index >= input.length) throw new RangeError('Not valid punycode');
      const digit = digitOf(input.charCodeAt(index));
      index += 1;
      if (digit >= BASE || digit > Math.floor((MAX_INT - i) / w)) throw new RangeError('Not valid punycode');
      i += digit * w;
      const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
      if (digit < t) break;
      if (w > Math.floor(MAX_INT / (BASE - t))) throw new RangeError('Not valid punycode');
      w *= BASE - t;
    }
    const length = output.length + 1;
    bias = adapt(i - oldI, length, oldI === 0);
    if (Math.floor(i / length) > MAX_INT - n) throw new RangeError('Not valid punycode');
    n += Math.floor(i / length);
    i %= length;
    output.splice(i, 0, n);
    i += 1;
  }
  return String.fromCodePoint(...output);
};
