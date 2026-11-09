/**
 * useCursorTracker - Smooth, physics-eased pointer tracking for custom cursors
 * @module hooks/useCursorTracker
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Damping presets controlling how tightly the rendered cursor follows the
 * real pointer. Lower values trail further behind (more ghostly), higher
 * values snap closer to the pointer.
 */
export const CURSOR_DAMPING = {
  /** Heavy trailing lag - spectral, floaty */
  spectral: 0.12,
  /** Balanced follow - the default */
  smooth: 0.22,
  /** Snappy, near-instant */
  sharp: 0.4,
} as const;

/**
 * A named damping preset or a raw factor between 0 (no movement) and 1 (instant).
 */
export type CursorDamping = keyof typeof CURSOR_DAMPING | number;

/**
 * Live tracking state for a custom cursor.
 */
export interface CursorState {
  /** Smoothed X position in viewport pixels (trails the real pointer) */
  x: number;
  /** Smoothed Y position in viewport pixels (trails the real pointer) */
  y: number;
  /** Instant X position of the real pointer in viewport pixels */
  rawX: number;
  /** Instant Y position of the real pointer in viewport pixels */
  rawY: number;
  /** Horizontal velocity in pixels/frame (useful for tilt/stretch) */
  velocityX: number;
  /** Vertical velocity in pixels/frame */
  velocityY: number;
  /** Pointer angle in degrees derived from velocity (0 = pointing right) */
  angle: number;
  /** Movement speed magnitude in pixels/frame */
  speed: number;
  /** Whether the primary pointer button is currently pressed */
  isPressed: boolean;
  /** Whether the pointer is currently over the document */
  isActive: boolean;
}

/**
 * Configuration for {@link useCursorTracker}.
 */
export interface CursorTrackerOptions {
  /**
   * How tightly the rendered cursor follows the real pointer.
   * Accepts a named preset or a raw 0-1 factor.
   * @default 'smooth'
   */
  damping?: CursorDamping;
  /**
   * When `true`, tracking is disabled and the loop never runs.
   * @default false
   */
  disabled?: boolean;
  /**
   * When `true`, the smoothed position snaps instantly to the pointer,
   * bypassing easing. Set automatically by consumers honoring
   * `prefers-reduced-motion`.
   * @default false
   */
  reducedMotion?: boolean;
}

const resolveDamping = (damping: CursorDamping): number =>
  typeof damping === 'number' ? damping : CURSOR_DAMPING[damping];

/** Minimum per-frame speed before we treat the pointer as "moving" for angle. */
const MOVEMENT_EPSILON = 0.01;

const INITIAL_STATE: CursorState = {
  x: 0,
  y: 0,
  rawX: 0,
  rawY: 0,
  velocityX: 0,
  velocityY: 0,
  angle: 0,
  speed: 0,
  isPressed: false,
  isActive: false,
};

/**
 * Tracks the pointer and produces a smoothed, eased position suitable for
 * driving a custom cursor overlay. Runs a single `requestAnimationFrame` loop
 * and exposes velocity/angle so consumers can add tilt, stretch, or trails.
 *
 * SSR-safe: returns inert state on the server and only attaches listeners in
 * the browser. Respects `reducedMotion` by snapping instantly to the pointer.
 *
 * @example
 * ```tsx
 * const { x, y, angle, isPressed } = useCursorTracker({ damping: 'spectral' });
 *
 * return (
 *   <div style={{ transform: `translate(${x}px, ${y}px) rotate(${angle}deg)` }}>
 *     🕯️
 *   </div>
 * );
 * ```
 *
 * @param options - Tracking configuration
 * @returns Live {@link CursorState}
 */
export const useCursorTracker = (options: CursorTrackerOptions = {}): CursorState => {
  const { damping = 'smooth', disabled = false, reducedMotion = false } = options;

  const [state, setState] = useState<CursorState>(INITIAL_STATE);

  // Mutable refs for the animation loop (avoid re-renders per frame)
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const pressed = useRef(false);
  const active = useRef(false);
  const rafId = useRef<number | null>(null);
  const dampingRef = useRef(resolveDamping(damping));
  const reducedRef = useRef(reducedMotion);
  const hasMoved = useRef(false);

  dampingRef.current = resolveDamping(damping);
  reducedRef.current = reducedMotion;

  const tick = useCallback(() => {
    const factor = reducedRef.current ? 1 : dampingRef.current;

    const prevX = current.current.x;
    const prevY = current.current.y;

    current.current.x += (target.current.x - current.current.x) * factor;
    current.current.y += (target.current.y - current.current.y) * factor;

    const velocityX = current.current.x - prevX;
    const velocityY = current.current.y - prevY;
    const speed = Math.hypot(velocityX, velocityY);
    const isMoving = speed > MOVEMENT_EPSILON;
    const angle = isMoving ? (Math.atan2(velocityY, velocityX) * 180) / Math.PI : 0;

    setState((prev) => ({
      x: current.current.x,
      y: current.current.y,
      rawX: target.current.x,
      rawY: target.current.y,
      velocityX,
      velocityY,
      angle: isMoving ? angle : prev.angle,
      speed,
      isPressed: pressed.current,
      isActive: active.current,
    }));

    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') {
      return;
    }

    const handleMove = (event: PointerEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
      active.current = true;
      // Snap on the very first movement so the cursor doesn't fly in from 0,0
      if (!hasMoved.current) {
        hasMoved.current = true;
        current.current.x = event.clientX;
        current.current.y = event.clientY;
      }
    };

    const handleDown = () => {
      pressed.current = true;
    };
    const handleUp = () => {
      pressed.current = false;
    };
    const handleEnter = () => {
      active.current = true;
    };
    const handleLeave = () => {
      active.current = false;
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    document.addEventListener('pointerenter', handleEnter);
    document.addEventListener('pointerleave', handleLeave);

    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      document.removeEventListener('pointerenter', handleEnter);
      document.removeEventListener('pointerleave', handleLeave);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [disabled, tick]);

  return state;
};
