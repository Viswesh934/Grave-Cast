/**
 * ScribbleCannon - A pen fired across the screen like a cannonball. Catch it to draw.
 * @module components/effects/Scribble/ScribbleCannon
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
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

/** The corner where the ball rests. */
export type ScribbleCannonDock = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** Firing, resting in its corner and asking whether to keep firing, or turned off. */
type CannonMode = 'flying' | 'asking' | 'off';

const OFF_VALUE = 'off';
const DEG = Math.PI / 180;
const between = (range: { min: number; max: number }) => range.min + Math.random() * (range.max - range.min);

const readOff = (key: string | undefined): boolean => {
  if (!key || typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(key) === OFF_VALUE;
  } catch {
    return false;
  }
};

const writeOff = (key: string | undefined, off: boolean) => {
  if (!key || typeof localStorage === 'undefined') return;
  try {
    if (off) localStorage.setItem(key, OFF_VALUE);
    else localStorage.removeItem(key);
  } catch {
    // Storage blocked: the choice lasts until the page closes.
  }
};

const isEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement);

export interface ScribbleCannonProps {
  /** What the flying ball asks, shown beside it and read by screen readers. @default 'Catch me to draw' */
  label?: string;
  /** Passed to the {@link Scribble} that opens when the ball is caught. */
  scribbleProps?: Omit<ScribbleProps, 'open' | 'onOpenChange' | 'showLauncher'>;
  /** Called when the ball is caught. */
  onCatch?: () => void;
  /** Hide the ball and stop firing, for example while a dialog is open. @default false */
  paused?: boolean;
  /** Shots before it rests in its corner and asks whether to keep firing. @default 3 */
  shots?: number;
  /** The corner it rests in. @default 'bottom-right' */
  dock?: ScribbleCannonDock;
  /** Extra distance from the corner, in px, for example to clear a fixed header. */
  dockInset?: { x?: number; y?: number };
  /** Remember "Turn it off" in localStorage under this key, so it stays off on the next visit. */
  storageKey?: string;
}

interface Flight {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  /** Ms left before the next shot, 0 while flying. */
  wait: number;
  /** Shots since it last rested in its corner. */
  fired: number;
  /** The wall it fires from next: 1 is the left, -1 the right. */
  side: 1 | -1;
}

/**
 * A launcher for {@link Scribble} that won't sit still, and steps aside when
 * asked. A pen in a ball is fired from a bottom corner, bounces off the edges
 * of the screen, and rolls to a stop. After a few shots it rests in its
 * corner and glows, asking whether to keep firing or turn it off. It also
 * rests the moment someone starts typing in a field, so it never gets in the
 * way. Catch it at any time (click, tap, or Enter) to draw.
 *
 * Turned off, it waits quietly in its corner: still a way to draw, with a
 * "Fire again" button on hover or focus. For people who ask for less motion
 * it never flies.
 *
 * @example
 * ```tsx
 * <ScribbleCannon dock="top-right" storageKey="my-page-cannon" scribbleProps={{ storageKey: 'my-page-drawing' }} />
 * ```
 */
export function ScribbleCannon({
  label = 'Catch me to draw',
  scribbleProps,
  onCatch,
  paused = false,
  shots = 3,
  dock = 'bottom-right',
  dockInset,
  storageKey,
}: ScribbleCannonProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CannonMode>(() => (readOff(storageKey) ? 'off' : 'flying'));
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const { playSound } = useSpookyAudio();
  const holder = useRef<HTMLDivElement>(null);
  const ball = useRef<HTMLSpanElement>(null);
  const flight = useRef<Flight>({ x: 0, y: 0, vx: 0, vy: 0, spin: 0, wait: SCRIBBLE_CANNON.firstShotMs, fired: 0, side: 1 });
  const flying = mode === 'flying' && !reduced;

  const fire = (f: Flight, width: number, height: number) => {
    const { margin, ball: size } = SCRIBBLE_CANNON;
    const speed = between(SCRIBBLE_CANNON.speed);
    const angle = between(SCRIBBLE_CANNON.angle) * DEG;
    f.x = f.side === 1 ? margin : width - size - margin;
    f.y = height - size - margin;
    f.vx = Math.cos(angle) * speed * f.side;
    f.vy = -Math.sin(angle) * speed;
    f.side = f.side === 1 ? -1 : 1;
    f.fired += 1;
    playSound('thud', 0.2);
  };

  const rest = () => {
    flight.current.wait = SCRIBBLE_CANNON.firstShotMs;
    flight.current.fired = 0;
    setMode('asking');
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
          if (f.vy === 0 && Math.abs(f.vx) < restSpeed) {
            if (f.fired >= shots) {
              rest();
              return;
            }
            f.wait = SCRIBBLE_CANNON.restMs;
          }
        }
      }

      if (holder.current) holder.current.style.transform = `translate3d(${f.x}px, ${f.y}px, 0)`;
      if (ball.current) ball.current.style.transform = `rotate(${f.spin}deg)`;
    },
    { enabled: flying && !open && !paused && visible }
  );

  // Starting to type anywhere sends it to its corner, so it never covers a field.
  useEffect(() => {
    if (!flying) return;
    const onFocus = (event: FocusEvent) => {
      if (isEditable(event.target) && !holder.current?.contains(event.target as Node)) rest();
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, [flying]);

  const catchIt = () => {
    playSound('spellCast', 0.35);
    setOpen(true);
    onCatch?.();
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) flight.current.wait = SCRIBBLE_CANNON.reloadMs;
  };

  const keepFiring = () => {
    writeOff(storageKey, false);
    flight.current.wait = SCRIBBLE_CANNON.restMs;
    flight.current.fired = 0;
    setMode('flying');
  };

  const turnOff = () => {
    writeOff(storageKey, true);
    setMode('off');
    playSound('lockClick', 0.25);
  };

  const { ball: size, margin } = SCRIBBLE_CANNON;
  const onRight = dock.endsWith('right');
  const onTop = dock.startsWith('top');
  const dockStyle: CSSProperties = {
    [onRight ? 'right' : 'left']: margin + (dockInset?.x ?? 0),
    [onTop ? 'top' : 'bottom']: margin + (dockInset?.y ?? 0),
  };
  // Questions open toward the middle of the screen, away from the edge.
  const beside = onRight ? 'right-full mr-3' : 'left-full ml-3';
  const asking = mode === 'asking' && !reduced;
  const ballLabel = flying ? label : 'Draw on the page';

  return (
    <>
      {!open && !paused && (
        <div
          ref={holder}
          className="group/cannon fixed"
          style={
            flying
              ? // Off screen until the first frame places it.
                { left: 0, top: 0, width: size, height: size, zIndex: zLayers.raised, transform: `translate3d(${-size * 2}px, 0, 0)`, willChange: 'transform' }
              : { ...dockStyle, width: size, height: size, zIndex: zLayers.raised }
          }
        >
          {asking && (
            <span aria-hidden="true" className="pointer-events-none absolute -inset-2 rounded-full bg-grave-bone-200/25 blur-md motion-safe:animate-pulse" />
          )}
          <button
            type="button"
            aria-label={ballLabel}
            title={ballLabel}
            onClick={catchIt}
            className={`group relative block size-full cursor-pointer border-0 bg-transparent p-0 transition-opacity ${
              mode === 'off' ? 'opacity-60 hover:opacity-100 focus-visible:opacity-100' : ''
            }`}
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
          </button>

          {flying && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md border border-grave-dark-600 bg-grave-dark-900 px-2 py-1 text-xs whitespace-nowrap text-grave-bone-200"
            >
              {label}
            </span>
          )}

          {asking && (
            <div
              role="group"
              aria-label="The Scribble cannon"
              className={`absolute top-1/2 ${beside} flex -translate-y-1/2 items-center gap-2 rounded-lg border border-grave-dark-600 bg-grave-dark-900 px-3 py-2 text-xs whitespace-nowrap text-grave-bone-200 shadow-lg`}
            >
              <span>Keep the cannon firing?</span>
              <button
                type="button"
                onClick={keepFiring}
                className="cursor-pointer rounded-md border border-grave-mist-500 bg-transparent px-2 py-1 text-grave-bone-100 hover:border-grave-bone-200"
              >
                Keep firing
              </button>
              <button
                type="button"
                onClick={turnOff}
                className="cursor-pointer rounded-md border border-grave-bone-200 bg-grave-bone-200 px-2 py-1 text-grave-dark-950 hover:bg-grave-bone-100"
              >
                Turn it off
              </button>
            </div>
          )}

          {mode === 'off' && !reduced && (
            <button
              type="button"
              onClick={keepFiring}
              aria-label="Fire the Scribble cannon again"
              className={`absolute top-1/2 ${beside} -translate-y-1/2 cursor-pointer rounded-md border border-grave-dark-600 bg-grave-dark-900/90 px-2 py-1 text-xs whitespace-nowrap text-grave-mist-300 opacity-0 transition-opacity group-hover/cannon:opacity-100 hover:text-grave-bone-100 focus-visible:opacity-100`}
            >
              Fire again
            </button>
          )}
        </div>
      )}
      <Scribble {...scribbleProps} open={open} onOpenChange={onOpenChange} showLauncher={false} />
    </>
  );
}
