/**
 * useSnowfall - Falling snow on a canvas
 * @module hooks/useSnowfall
 */

import { useEffect, type RefObject } from 'react';

/** Tuning for the snow simulation. Sizes are px, speeds are px/second. */
export const SNOW = {
  /** Flakes on a 1280x720 canvas at density 1. */
  baseCount: 140,
  /** Canvas area that `baseCount` is measured against, in px squared. */
  referenceArea: 1280 * 720,
  /** Bounds on how far the flake count scales with canvas area. */
  minScale: 0.4,
  maxScale: 1.6,
  sizeMin: 0.8,
  sizeMax: 3.2,
  speedMin: 30,
  speedMax: 120,
  /** Share of full speed that the smallest flakes fall at, so big flakes read as nearer. */
  nearBias: 0.6,
  alphaMin: 0.35,
  alphaMax: 0.9,
  /** Side-to-side sway in px/second, and its speed in radians/second. */
  sway: 18,
  swayRate: 1.3,
  /** Steady wind plus a slow gust that pushes both ways, in px/second. */
  wind: 25,
  gust: 40,
  gustRate: 0.35,
  /** Highest device pixel ratio drawn, to keep large screens cheap. */
  maxDpr: 1.5,
  /** Longest simulated frame in seconds, so a background tab does not cause a jump. */
  maxFrameSeconds: 0.05,
} as const;

const TAU = Math.PI * 2;

/**
 * One snowflake.
 */
export interface Snowflake {
  x: number;
  y: number;
  /** Radius in px. */
  r: number;
  /** Fall speed in px/second. */
  speed: number;
  alpha: number;
  phase: number;
  /** How strongly this flake sways, from 0 to 1. */
  sway: number;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

/**
 * How many flakes to draw for a canvas size. Bigger canvases get more flakes,
 * within limits, so snow looks equally dense on phones and wide monitors.
 */
export const snowflakeCount = (width: number, height: number, density: number = 1): number =>
  Math.round(
    SNOW.baseCount *
      density *
      clamp((width * height) / SNOW.referenceArea, SNOW.minScale, SNOW.maxScale)
  );

/**
 * Creates flakes scattered across the canvas.
 *
 * @param random - A 0-1 random source. Defaults to `Math.random`. Pass a seeded one for repeatable tests.
 */
export const createSnowflakes = (
  count: number,
  width: number,
  height: number,
  speed: number = 1,
  random: () => number = Math.random
): Snowflake[] =>
  Array.from({ length: count }, () => {
    const size = random();
    return {
      x: random() * width,
      y: random() * height,
      r: SNOW.sizeMin + (SNOW.sizeMax - SNOW.sizeMin) * size * size,
      speed:
        (SNOW.speedMin + (SNOW.speedMax - SNOW.speedMin) * random()) *
        speed *
        (SNOW.nearBias + (1 - SNOW.nearBias) * size),
      alpha: SNOW.alphaMin + (SNOW.alphaMax - SNOW.alphaMin) * size,
      phase: random() * TAU,
      sway: random(),
    };
  });

/**
 * Moves every flake forward in time. Flakes that fall off the bottom return
 * to the top at a new spot, and flakes that drift off a side wrap around.
 *
 * @param dt - Seconds since the last step.
 * @param time - Total elapsed seconds, which drives sway and gusts.
 */
export const advanceSnowflakes = (
  flakes: Snowflake[],
  dt: number,
  time: number,
  width: number,
  height: number,
  wind: number = SNOW.wind,
  random: () => number = Math.random
): void => {
  const push = wind + Math.sin(time * SNOW.gustRate) * SNOW.gust;

  for (const flake of flakes) {
    flake.y += flake.speed * dt;
    flake.x += (push + Math.sin(time * SNOW.swayRate + flake.phase) * SNOW.sway * flake.sway) * dt;

    if (flake.y - flake.r > height) {
      flake.y = -flake.r;
      flake.x = random() * width;
    }
    if (flake.x - flake.r > width) flake.x = -flake.r;
    else if (flake.x + flake.r < 0) flake.x = width + flake.r;
  }
};

/**
 * Options for {@link useSnowfall}.
 */
export interface SnowfallOptions {
  /** Flake color, any CSS color. */
  color: string;
  /** Flake count multiplier. @default 1 */
  density?: number;
  /** Fall speed multiplier. @default 1 */
  speed?: number;
  /** Steady sideways push in px/second. @default 25 */
  wind?: number;
  /** When `false`, draws one still frame and stops. Use for reduced motion. @default true */
  animate?: boolean;
}

/**
 * Draws falling snow onto a canvas.
 *
 * One `requestAnimationFrame` loop drives every flake. It pauses while the
 * tab is hidden, resizes with the canvas, caps the pixel ratio, and draws a
 * single still frame when `animate` is `false`.
 *
 * @example
 * ```tsx
 * import { palette } from 'groove-ui/tokens';
 *
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * useSnowfall(canvasRef, { color: palette.bone[100], density: 1.5 });
 *
 * return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
 * ```
 */
export const useSnowfall = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: SnowfallOptions
): void => {
  const { color, density = 1, speed = 1, wind = SNOW.wind, animate = true } = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let flakes: Snowflake[] = [];
    let frame = 0;
    let last = 0;
    let time = 0;
    let running = false;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      for (const flake of flakes) {
        ctx.globalAlpha = flake.alpha;
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, SNOW.maxDpr);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      flakes = createSnowflakes(snowflakeCount(width, height, density), width, height, speed);
      draw();
    };

    const step = (now: number) => {
      if (!running) return;
      const dt = Math.min(SNOW.maxFrameSeconds, (now - last) / 1000);
      last = now;
      time += dt;
      advanceSnowflakes(flakes, dt, time, width, height, wind);
      draw();
      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else if (animate) start();
    };

    resize();
    if (animate) start();

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [canvasRef, color, density, speed, wind, animate]);
};
