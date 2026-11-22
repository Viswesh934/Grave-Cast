import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useSpookyAudio } from '../../../audio';
import {
  hauntedScrollbarThemes,
  hauntedScrollbarTokens as t,
  type HauntedScrollbarVariant,
} from './tokens';

export interface HauntedScrollbarProps {
  /**
   * Color and atmospheric vibe of the sticky blob.
   * @default 'ectoplasm'
   */
  variant?: HauntedScrollbarVariant;
  /**
   * Target scrollable container. If omitted, watches the whole window.
   */
  targetRef?: RefObject<HTMLElement | null>;
  /**
   * Whether the sticky eye inside the blob watches the mouse pointer.
   * @default true
   */
  hasEye?: boolean;
  /**
   * Auto-fade to low opacity when scrolling has stopped.
   * @default true
   */
  autoHide?: boolean;
  /**
   * Play procedural wet squelch/drip sound effects when stretching or snapping.
   * @default true
   */
  soundEnabled?: boolean;
  /**
   * Custom inline styles for the track container.
   */
  style?: CSSProperties;
  className?: string;
}

export function HauntedScrollbar({
  variant = 'ectoplasm',
  targetRef,
  hasEye = true,
  autoHide = true,
  soundEnabled = true,
  style,
  className = '',
}: HauntedScrollbarProps) {
  const theme = hauntedScrollbarThemes[variant] ?? hauntedScrollbarThemes.ectoplasm;
  const reduced = useReducedMotion();
  const { playSound } = useSpookyAudio();

  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  // Physics refs
  const currentY = useRef(0);
  const targetY = useRef(0);
  const velocityY = useRef(0);
  const stretchY = useRef(1);
  const stretchX = useRef(1);
  const wobblePhase = useRef(0);
  const wobbleAmplitude = useRef(0);
  const stickyAnchorY = useRef<number | null>(null);
  const isSnapping = useRef(false);
  const lastScrollTime = useRef(0);
  const lastScrollTop = useRef(0);
  const animFrame = useRef<number | null>(null);
  const idleTimer = useRef<number | null>(null);

  // SVG blob element reference for direct DOM styling in RAF
  const blobRef = useRef<SVGGElement>(null);
  const stickyPathRef = useRef<SVGPathElement>(null);

  // Get scroll metrics
  const getMetrics = useCallback(() => {
    if (targetRef?.current) {
      const el = targetRef.current;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const scrollTop = el.scrollTop;
      const maxScroll = Math.max(1, scrollHeight - clientHeight);
      return { scrollTop, maxScroll, trackHeight: clientHeight };
    }
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    return { scrollTop, maxScroll, trackHeight: clientHeight };
  }, [targetRef]);

  // Blink interval
  useEffect(() => {
    if (!hasEye) return;
    const interval = window.setInterval(() => {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 160);
    }, 4500 + Math.random() * 3000);
    return () => window.clearInterval(interval);
  }, [hasEye]);

  // Track pointer for the eye
  useEffect(() => {
    if (!hasEye || reduced) return;
    const onPointerMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const trackRect = trackRef.current.getBoundingClientRect();
      const blobAbsY = trackRect.top + currentY.current + t.blobBaseHeight / 2;
      const blobAbsX = trackRect.left + t.blobWidth / 2;
      const dx = e.clientX - blobAbsX;
      const dy = e.clientY - blobAbsY;
      const dist = Math.hypot(dx, dy) || 1;
      const maxLook = 3;
      setEyeOffset({
        x: (dx / dist) * Math.min(maxLook, Math.abs(dx) * 0.05),
        y: (dy / dist) * Math.min(maxLook, Math.abs(dy) * 0.05),
      });
    };
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', onPointerMove);
  }, [hasEye, reduced]);

  // Physics animation loop
  useEffect(() => {
    const loop = () => {
      const diff = targetY.current - currentY.current;
      velocityY.current = diff * (reduced ? 0.4 : t.springTension);
      currentY.current += velocityY.current;

      const speed = Math.abs(velocityY.current);

      if (!reduced) {
        // Calculate organic stretch & volume preservation
        if (speed > 0.4) {
          const targetStretch = 1 + Math.min(speed * t.stretchVelocityFactor, t.maxStretch - 1);
          stretchY.current += (targetStretch - stretchY.current) * 0.25;
          stretchX.current = 1 / Math.sqrt(stretchY.current);
          wobbleAmplitude.current = Math.min(speed * 0.15, 0.5);
          wobblePhase.current = 0;
        } else {
          // Recover with a squishy jiggle wobble
          if (wobbleAmplitude.current > 0.02) {
            wobblePhase.current += 0.35;
            wobbleAmplitude.current *= t.springDamping;
            const wobble = Math.sin(wobblePhase.current) * wobbleAmplitude.current;
            stretchY.current = 1 + wobble;
            stretchX.current = 1 - wobble * 0.6;
          } else {
            stretchY.current += (1 - stretchY.current) * 0.2;
            stretchX.current += (1 - stretchX.current) * 0.2;
          }
        }

        // Sticky gum trail calculation
        if (stickyAnchorY.current !== null && stickyPathRef.current) {
          const dist = Math.abs(currentY.current - stickyAnchorY.current);
          if (dist > t.snapDistance && !isSnapping.current) {
            isSnapping.current = true;
            stickyAnchorY.current = null;
            if (soundEnabled) playSound('cauldronBubble', 0.2);
          } else {
            // Draw gum neck path connecting anchor bead to moving blob
            const startY = stickyAnchorY.current;
            const endY = currentY.current + (currentY.current > startY ? 0 : t.blobBaseHeight);
            const midY = (startY + endY) / 2;
            const neckWidth = Math.max(1.5, 6 * (1 - dist / t.snapDistance));
            const pathData = `
              M ${t.blobWidth / 2 - neckWidth} ${startY}
              Q ${t.blobWidth / 2} ${midY}, ${t.blobWidth / 2 - 3} ${endY}
              L ${t.blobWidth / 2 + 3} ${endY}
              Q ${t.blobWidth / 2} ${midY}, ${t.blobWidth / 2 + neckWidth} ${startY}
              Z
            `;
            stickyPathRef.current.setAttribute('d', pathData);
          }
        } else if (stickyPathRef.current) {
          stickyPathRef.current.setAttribute('d', '');
        }
      } else {
        stretchY.current = 1;
        stretchX.current = 1;
      }

      // Update DOM transform
      if (blobRef.current) {
        const sy = stretchY.current;
        const sx = stretchX.current;
        blobRef.current.setAttribute(
          'transform',
          `translate(0, ${currentY.current}) scale(${sx}, ${sy}) translate(0, ${-(t.blobBaseHeight * (sy - 1)) / (2 * sy)})`
        );
      }

      animFrame.current = requestAnimationFrame(loop);
    };

    animFrame.current = requestAnimationFrame(loop);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [reduced, soundEnabled, playSound]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      const { scrollTop, maxScroll, trackHeight } = getMetrics();
      const ratio = Math.max(0, Math.min(1, scrollTop / maxScroll));
      const usableHeight = trackHeight - t.blobBaseHeight;
      const nextTargetY = ratio * usableHeight;

      // Start sticky anchor if moving from rest
      if (stickyAnchorY.current === null && Math.abs(scrollTop - lastScrollTop.current) > 2) {
        stickyAnchorY.current = currentY.current + t.blobBaseHeight / 2;
        isSnapping.current = false;
      }

      targetY.current = nextTargetY;
      lastScrollTop.current = scrollTop;
      lastScrollTime.current = now;

      setActive(true);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      if (autoHide && !dragging) {
        idleTimer.current = window.setTimeout(() => {
          setActive(false);
          stickyAnchorY.current = null;
        }, t.idleFadeMs);
      }
    };

    const target = targetRef?.current ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [getMetrics, targetRef, autoHide, dragging]);

  // Dragging logic
  const onMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setActive(true);
    if (soundEnabled) playSound('wispBlip', 0.25);

    const startClientY = e.clientY;
    const startScrollTop = getMetrics().scrollTop;
    const { maxScroll, trackHeight } = getMetrics();
    const usableHeight = trackHeight - t.blobBaseHeight;

    const onMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const deltaY = moveEvent.clientY - startClientY;
      const scrollDelta = (deltaY / usableHeight) * maxScroll;
      const nextScroll = Math.max(0, Math.min(maxScroll, startScrollTop + scrollDelta));

      if (targetRef?.current) {
        targetRef.current.scrollTop = nextScroll;
      } else {
        window.scrollTo({ top: nextScroll, behavior: 'instant' });
      }
    };

    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (soundEnabled) playSound('wispBlip', 0.15);
      if (autoHide) {
        idleTimer.current = window.setTimeout(() => setActive(false), t.idleFadeMs);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Click on track to jump
  const onTrackClick = (e: ReactMouseEvent) => {
    if (!trackRef.current || e.target === blobRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const { maxScroll, trackHeight } = getMetrics();
    const usableHeight = trackHeight - t.blobBaseHeight;
    const ratio = Math.max(0, Math.min(1, (clickY - t.blobBaseHeight / 2) / usableHeight));
    const nextScroll = ratio * maxScroll;

    if (soundEnabled) playSound('lockClick', 0.2);

    if (targetRef?.current) {
      targetRef.current.scrollTo({ top: nextScroll, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: nextScroll, behavior: 'smooth' });
    }
  };

  const isVisible = active || dragging || !autoHide;

  return (
    <div
      ref={trackRef}
      role="scrollbar"
      aria-label="Cursed living scrollbar"
      aria-orientation="vertical"
      aria-valuenow={Math.round((getMetrics().scrollTop / getMetrics().maxScroll) * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      onClick={onTrackClick}
      className={`haunted-scrollbar-track fixed right-1.5 top-0 bottom-0 select-none cursor-pointer transition-opacity duration-500 ${className}`}
      style={{
        width: t.blobWidth + 8,
        zIndex: t.zIndex,
        opacity: isVisible ? 1 : 0.22,
        pointerEvents: 'auto',
        ...style,
      }}
    >
      <svg
        className="w-full h-full overflow-visible"
        viewBox={`0 0 ${t.blobWidth + 8} 100`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gooey filter for organic liquid blending */}
          <filter id="haunted-goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>

          {/* Radial gradient for the living blob */}
          <radialGradient id={`blob-grad-${variant}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={theme.core} />
            <stop offset="55%" stopColor={theme.primary} />
            <stop offset="100%" stopColor={theme.dark} />
          </radialGradient>
        </defs>

        {/* Faint ancient crypt rail line */}
        <line
          x1={(t.blobWidth + 8) / 2}
          y1="8"
          x2={(t.blobWidth + 8) / 2}
          y2="92%"
          stroke="rgba(24, 52, 37, 0.45)"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />

        {/* Sticky gooey trail string that stretches when pulled */}
        <g filter="url(#haunted-goo)">
          <path
            ref={stickyPathRef}
            fill={theme.primary}
            opacity="0.75"
            style={{ filter: `drop-shadow(${theme.glow})` }}
          />

          {/* Living blob thumb */}
          <g
            ref={blobRef}
            onMouseDown={onMouseDown}
            className="cursor-grab active:cursor-grabbing"
            style={{
              filter: `drop-shadow(${theme.glow})`,
              transformOrigin: `${(t.blobWidth + 8) / 2}px 0px`,
            }}
          >
            {/* Organic Capsule Body */}
            <rect
              x="4"
              y="0"
              width={t.blobWidth}
              height={t.blobBaseHeight}
              rx={t.blobWidth / 2}
              fill={`url(#blob-grad-${variant})`}
              stroke={theme.core}
              strokeWidth="0.8"
              strokeOpacity="0.8"
            />

            {/* Living Watcher Eyeball */}
            {hasEye && (
              <g
                transform={`translate(${(t.blobWidth + 8) / 2}, ${t.blobBaseHeight / 2})`}
                style={{
                  transition: 'transform 0.08s ease-out',
                }}
              >
                {/* Sclera / eye background */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx={t.eyeSize / 2}
                  ry={blinking ? 0.4 : t.eyeSize / 2}
                  fill="#ffffff"
                  stroke={theme.dark}
                  strokeWidth="0.5"
                />

                {/* Iris & Pupil tracking cursor */}
                {!blinking && (
                  <circle
                    cx={eyeOffset.x}
                    cy={eyeOffset.y}
                    r={t.eyeSize / 3.2}
                    fill={theme.eyePupil}
                  />
                )}
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}

