/**
 * ScribbleCannon - A pen fired across the screen into the top corner. Click it to draw.
 * @module components/effects/Scribble/ScribbleCannon
 */
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpookyAudio } from '../../../audio';
import { useRafLoop } from '../../../hooks/useRafLoop';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { zLayers } from '../../../tokens/layers';
import { Scribble, SCRIBBLE_TOOL_INFO, type ScribbleProps } from './Scribble';

/** How the shot flies and where it lands. Distances in px, times in ms. */
export const SCRIBBLE_CANNON = {
  /** Width of the ball in flight. */
  ball: 56,
  /** Width of the ball once landed, small enough to sit in a top bar. */
  dockBall: 40,
  /** Gap kept from the edges of the screen. */
  margin: 16,
  /** Wait before the shot after the page opens. */
  firstShotMs: 2500,
  /** How long the flight takes. */
  flightMs: 1500,
  /** How high the arc rises above a straight line, as a share of the screen height. */
  arc: 0.22,
  /** Whole turns the ball spins in flight. */
  spinTurns: 2,
  /** Line width of the pen drawn on the ball, in icon units. */
  iconStroke: 2,
  /** Line width of the close mark, in icon units. */
  closeStroke: 2,
} as const;

type CannonMode = 'waiting' | 'flying' | 'landed' | 'off';

const OFF_VALUE = 'off';
const TURN = 360;

const readOff = (key: string | undefined): boolean => {
  if (!key || typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(key) === OFF_VALUE;
  } catch {
    return false;
  }
};

const writeOff = (key: string | undefined) => {
  if (!key || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, OFF_VALUE);
  } catch {
    // Storage blocked: it stays off until the page closes.
  }
};

/** Fast out of the barrel, slowing as it reaches the corner. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export interface ScribbleCannonProps {
  /** What the landed ball does, read by screen readers. @default 'Draw on the page' */
  label?: string;
  /** Passed to the {@link Scribble} that opens when the ball is clicked. */
  scribbleProps?: Omit<ScribbleProps, 'open' | 'onOpenChange' | 'showLauncher'>;
  /** Called when the ball is clicked. */
  onCatch?: () => void;
  /** Hide the ball, for example while a dialog is open. The shot waits too. @default false */
  paused?: boolean;
  /** Distance of the landed ball from the top-right corner, in px. @default SCRIBBLE_CANNON.margin on both sides */
  dockInset?: { x?: number; y?: number };
  /** Remember "turn off" in localStorage under this key, so it stays off on the next visit. */
  storageKey?: string;
  /**
   * Show the small × that turns the cannon off. Set it to `false` to fire it
   * on every visit and leave it there for everyone to find; `storageKey` is
   * then ignored. @default true
   */
  dismissible?: boolean;
  /**
   * Keep the landed ball on screen all the time: while drawing (clicking it
   * then stops drawing) and while `paused`, which then only holds back the
   * shot. @default false
   */
  stayVisible?: boolean;
}

/**
 * A launcher for {@link Scribble} with an entrance. Once, after the page
 * opens, a pen in a ball is fired from the bottom-left corner and arcs into
 * the top-right corner, where it stays with a soft red glow. Click it to draw.
 * The small × beside it turns it off, and that is remembered, unless
 * `dismissible` is `false`: then it is fired on every visit and always stays.
 *
 * For people who ask for less motion it skips the shot and is simply there.
 *
 * @example
 * ```tsx
 * <ScribbleCannon dockInset={{ x: 24, y: 8 }} storageKey="my-page-cannon" />
 * ```
 */
export function ScribbleCannon({ label = 'Draw on the page', scribbleProps, onCatch, paused = false, dockInset, storageKey, dismissible = true, stayVisible = false }: ScribbleCannonProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CannonMode>(() => (dismissible && readOff(storageKey) ? 'off' : 'waiting'));
  const { playSound } = useSpookyAudio();
  const holder = useRef<HTMLDivElement>(null);
  const ball = useRef<HTMLSpanElement>(null);
  const clock = useRef(0);

  const { ball: flightSize, dockBall, margin } = SCRIBBLE_CANNON;
  const insetX = dockInset?.x ?? margin;
  const insetY = dockInset?.y ?? margin;
  const current: CannonMode = reduced && (mode === 'waiting' || mode === 'flying') ? 'landed' : mode;

  useRafLoop(
    ({ delta }) => {
      clock.current += delta;
      if (current === 'waiting') {
        if (clock.current >= SCRIBBLE_CANNON.firstShotMs) {
          clock.current = 0;
          playSound('thud', 0.25);
          setMode('flying');
        }
        return;
      }
      const t = Math.min(1, clock.current / SCRIBBLE_CANNON.flightMs);
      const e = easeOut(t);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const x0 = margin;
      const y0 = height - flightSize - margin;
      const x1 = width - insetX - dockBall;
      const y1 = insetY;
      const x = x0 + (x1 - x0) * e;
      const y = y0 + (y1 - y0) * e - Math.sin(Math.PI * e) * height * SCRIBBLE_CANNON.arc;
      const scale = 1 + (dockBall / flightSize - 1) * e;
      if (holder.current) holder.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      if (ball.current) ball.current.style.transform = `rotate(${e * SCRIBBLE_CANNON.spinTurns * TURN}deg)`;
      if (t >= 1) {
        playSound('stoneDrop', 0.3);
        setMode('landed');
      }
    },
    { enabled: !paused && (current === 'waiting' || current === 'flying') }
  );

  const draw = () => {
    playSound('spellCast', 0.35);
    setOpen(true);
    onCatch?.();
  };

  const turnOff = () => {
    writeOff(storageKey);
    playSound('lockClick', 0.25);
    setMode('off');
  };

  const landed = current === 'landed';
  const visible = current === 'flying' ? !paused && !open : landed && (stayVisible || (!open && !paused));
  // Kept on screen, it sits with the drawing layer; rendered after it, it stays clickable above the drawing.
  const dockLayer = stayVisible ? zLayers.annotation : zLayers.overlay;
  const cannon =
    visible ? (
      <div
        ref={holder}
        className="fixed"
        style={
          landed
            ? { right: insetX, top: insetY, width: dockBall, height: dockBall, zIndex: dockLayer }
            : // Placed by the first frame of the flight.
              {
                left: 0,
                top: 0,
                width: flightSize,
                height: flightSize,
                zIndex: zLayers.overlay,
                transformOrigin: '0 0',
                transform: `translate3d(${-flightSize * 2}px, 0, 0)`,
                willChange: 'transform',
              }
        }
      >
        {landed && (
          <span aria-hidden="true" className="pointer-events-none absolute -inset-1.5 rounded-full bg-grave-sanguine-crimson/45 blur-md motion-safe:animate-pulse" />
        )}
        <button
          type="button"
          aria-label={stayVisible && open ? 'Stop drawing' : label}
          aria-pressed={stayVisible ? open : undefined}
          title={stayVisible && open ? 'Stop drawing' : label}
          onClick={stayVisible && open ? () => setOpen(false) : draw}
          disabled={!landed}
          className="group relative block size-full cursor-pointer border-0 bg-transparent p-0 disabled:cursor-default"
        >
          <span
            ref={ball}
            className="grid size-full place-items-center rounded-full border-2 border-grave-sanguine-plasma bg-grave-dark-800 text-grave-bone-100 shadow-lg transition-colors group-hover:bg-grave-dark-700 group-focus-visible:outline-2 group-focus-visible:outline-grave-bone-100"
          >
            <svg
              viewBox="0 0 24 24"
              width="50%"
              height="50%"
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
        {landed && dismissible && (
          <button
            type="button"
            onClick={turnOff}
            aria-label="Turn off the Scribble cannon"
            title="Turn off"
            className="absolute -top-1 -left-1 grid size-4 cursor-pointer place-items-center rounded-full border border-grave-dark-600 bg-grave-dark-900 p-0 text-grave-mist-300 hover:text-grave-bone-100"
          >
            <svg viewBox="0 0 16 16" width="60%" height="60%" fill="none" stroke="currentColor" strokeWidth={SCRIBBLE_CANNON.closeStroke} strokeLinecap="round" aria-hidden="true">
              <path d="M4 4 12 12 M12 4 4 12" />
            </svg>
          </button>
        )}
      </div>
    ) : null;

  return (
    <>
      {/* Rendered at the end of the page, so it can land on a top bar instead of under it. */}
      {cannon && typeof document !== 'undefined' ? createPortal(cannon, document.body) : cannon}
      <Scribble {...scribbleProps} open={open} onOpenChange={setOpen} showLauncher={false} />
    </>
  );
}
