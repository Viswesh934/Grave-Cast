/**
 * ScribbleCannon - A pen fired across the screen like a cannonball. Catch it to draw.
 * @module components/effects/Scribble/ScribbleCannon
 */
import { useRef, useState } from 'react';
import { useSpookyAudio } from '../../../audio';
import { usePageVisible } from '../../../hooks/usePageVisible';
import { useRafLoop } from '../../../hooks/useRafLoop';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { zLayers } from '../../../tokens/layers';
import { Scribble, SCRIBBLE_TOOL_INFO, type ScribbleProps } from './Scribble';

/** How the cannonball flies. Distances in px, times in ms, speeds in px per second. */
export const SCRIBBLE_CANNON = {
  /** Width of the ball. */
  ball: 56,
  /** Gap kept from the edges of the screen. */
  margin: 16,
  /** Pull toward the floor, in px per second squared. */
  gravity: 1500,
  /** Share of speed kept after hitting a wall, the floor or the ceiling. */
  bounce: 0.78,
  /** Share of sideways speed kept on each floor bounce. */
  floorGrip: 0.88,
  /** How quickly air slows it sideways, per second. */
  drag: 0.25,
  /** Launch speed range. */
  speed: { min: 950, max: 1350 },
  /** Launch angle range above the floor, in degrees. */
  angle: { min: 52, max: 72 },
  /** Below this speed it counts as resting. */
  restSpeed: 70,
  /** How long it rests before the next shot. */
  restMs: 2200,
  /** Wait before the first shot after the page opens. */
  firstShotMs: 3500,
  /** Wait before firing again after drawing ends. */
  reloadMs: 4000,
  /** Degrees of spin per px travelled sideways. */
  spin: 0.7,
  /** Line width of the pen drawn on the ball, in icon units. */
  iconStroke: 2,
} as const;

const DEG = Math.PI / 180;
const between = (range: { min: number; max: number }) => range.min + Math.random() * (range.max - range.min);

export interface ScribbleCannonProps {
  /** What the ball asks, shown beside it and read by screen readers. @default 'Catch me to draw' */
  label?: string;
  /** Passed to the {@link Scribble} that opens when the ball is caught. */
  scribbleProps?: Omit<ScribbleProps, 'open' | 'onOpenChange' | 'showLauncher'>;
  /** Called when the ball is caught. */
  onCatch?: () => void;
  /** Hide the ball and stop firing, for example while a dialog is open. @default false */
  paused?: boolean;
}

interface Flight {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  /** Ms left before the next shot, or 0 while flying. */
  wait: number;
  /** The wall it fires from next: 1 is the left, -1 the right. */
  side: 1 | -1;
}

/**
 * A launcher for {@link Scribble} that won't sit still. A pen in a ball is
 * fired from a bottom corner, bounces off the edges of the screen, rolls to a
 * stop, then fires again from the other side. Catch it (click, tap, or focus
 * it and press Enter) and drawing turns on; when drawing ends, it reloads.
 *
 * For people who ask for less motion it waits in the bottom-right corner.
 *
 * @example
 * ```tsx
 * <ScribbleCannon scribbleProps={{ storageKey: 'my-page-drawing' }} />
 * ```
 */
export function ScribbleCannon({ label = 'Catch me to draw', scribbleProps, onCatch, paused = false }: ScribbleCannonProps) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const { playSound } = useSpookyAudio();
  const button = useRef<HTMLButtonElement>(null);
  const ball = useRef<HTMLSpanElement>(null);
  const flight = useRef<Flight>({ x: -SCRIBBLE_CANNON.ball * 2, y: 0, vx: 0, vy: 0, spin: 0, wait: SCRIBBLE_CANNON.firstShotMs, side: 1 });

  const fire = (f: Flight, width: number, height: number) => {
    const { margin, ball: size } = SCRIBBLE_CANNON;
    const speed = between(SCRIBBLE_CANNON.speed);
    const angle = between(SCRIBBLE_CANNON.angle) * DEG;
    f.x = f.side === 1 ? margin : width - size - margin;
    f.y = height - size - margin;
    f.vx = Math.cos(angle) * speed * f.side;
    f.vy = -Math.sin(angle) * speed;
    f.side = f.side === 1 ? -1 : 1;
    playSound('thud', 0.2);
  };

  useRafLoop(
    ({ delta }) => {
      const f = flight.current;
      const { margin, ball: size, gravity, bounce, floorGrip, drag, restSpeed } = SCRIBBLE_CANNON;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const right = width - size - margin;
      const floor = height - size - margin;
      const dt = delta / 1000;

      if (f.wait > 0) {
        f.wait -= delta;
        if (f.wait <= 0) fire(f, width, height);
      } else {
        f.vy += gravity * dt;
        f.vx *= Math.exp(-drag * dt);
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.spin += f.vx * dt * SCRIBBLE_CANNON.spin;
        if (f.x < margin) {
          f.x = margin;
          f.vx = -f.vx * bounce;
        } else if (f.x > right) {
          f.x = right;
          f.vx = -f.vx * bounce;
        }
        if (f.y < margin) {
          f.y = margin;
          f.vy = -f.vy * bounce;
        } else if (f.y > floor) {
          f.y = floor;
          f.vy = Math.abs(f.vy) < restSpeed ? 0 : -f.vy * bounce;
          f.vx *= floorGrip;
          if (f.vy === 0 && Math.abs(f.vx) < restSpeed) f.wait = SCRIBBLE_CANNON.restMs;
        }
      }

      if (button.current) button.current.style.transform = `translate3d(${f.x}px, ${f.y}px, 0)`;
      if (ball.current) ball.current.style.transform = `rotate(${f.spin}deg)`;
    },
    { enabled: !open && !paused && !reduced && visible }
  );

  const catchIt = () => {
    playSound('spellCast', 0.35);
    setOpen(true);
    onCatch?.();
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) flight.current.wait = SCRIBBLE_CANNON.reloadMs;
  };

  const { ball: size, margin } = SCRIBBLE_CANNON;

  return (
    <>
      {!open && !paused && (
        <button
          ref={button}
          type="button"
          aria-label={label}
          title={label}
          onClick={catchIt}
          className="group fixed cursor-pointer border-0 bg-transparent p-0"
          style={
            reduced
              ? { right: margin, bottom: margin, width: size, height: size, zIndex: zLayers.raised }
              : {
                  left: 0,
                  top: 0,
                  width: size,
                  height: size,
                  zIndex: zLayers.raised,
                  // Off screen until the first frame places it.
                  transform: `translate3d(${-size * 2}px, 0, 0)`,
                  willChange: 'transform',
                }
          }
        >
          <span
            ref={ball}
            className="grid size-full place-items-center rounded-full border-2 border-grave-bone-200 bg-grave-dark-800 text-grave-bone-100 shadow-lg transition-colors group-hover:bg-grave-dark-700 group-focus-visible:outline-2 group-focus-visible:outline-grave-bone-100"
          >
            <svg
              viewBox="0 0 24 24"
              width={size / 2}
              height={size / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={SCRIBBLE_CANNON.iconStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={SCRIBBLE_TOOL_INFO.pen.icon} />
            </svg>
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md border border-grave-dark-600 bg-grave-dark-900 px-2 py-1 text-xs whitespace-nowrap text-grave-bone-200"
          >
            {label}
          </span>
        </button>
      )}
      <Scribble {...scribbleProps} open={open} onOpenChange={onOpenChange} showLauncher={false} />
    </>
  );
}
