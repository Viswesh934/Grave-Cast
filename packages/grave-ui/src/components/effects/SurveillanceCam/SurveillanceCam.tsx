/**
 * SurveillanceCam - Found-footage camera view with CRT and VHS styling.
 * @module components/effects/SurveillanceCam/SurveillanceCam
 */

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { breakpoints, useMediaQuery } from '../../../hooks/useMediaQuery';
import type { FrameSource } from '../../../hooks/useFrameSampler';
import { useMotionDetector } from '../../../hooks/useMotionDetector';
import { useNow } from '../../../hooks/useNow';
import { useVideoSource } from '../../../hooks/useVideoSource';
import type { HorrorIntensity } from '../../../tokens/types';
import { gradeMatrix, type CamGrade } from '../../../video/grades';
import type { MotionSensitivity } from '../../../video/motion';
import { formatCamTimestamp, formatElapsed } from '../../../video/timecode';
import { Badge } from '../../primitives/Badge';
import { withAlpha } from '../HorrorBackground/tokens';
import { CamFilter } from './CamFilter';
import {
  camKeyframes,
  glitchStyle,
  grainStyle,
  overlayBase,
  scanlineStyle,
  vignetteStyle,
} from './styles';
import {
  CAM_CLASS,
  CAM_DEFAULT_ASPECT,
  CAM_DEFAULT_LABEL,
  CAM_PREFIX,
  camAnimations,
  camGradeTokens,
  camIntensity,
  camTokens,
} from './tokens';

/** Characters the browser does not allow in an element id reference. */
const ID_UNSAFE = /[^a-zA-Z0-9_-]/g;

/** Selects the picture the motion detector should watch. */
const PICTURE_SELECTOR = 'video, canvas, img';

/**
 * Props for {@link SurveillanceCam}.
 */
export interface SurveillanceCamProps {
  /** A live stream, for example from `useMediaStream({ video: true })`. */
  stream?: MediaStream | null;
  /** A video file address. Ignored when `stream` is set. */
  src?: string;
  /**
   * Your own picture, such as a canvas or an `AsciiVideo`. Shown above the
   * video if there is one. Motion detection reads the first video, canvas, or
   * image inside.
   */
  children?: ReactNode;
  /** Loop a video file. @default true */
  loop?: boolean;
  /** Camera name shown top left, and used to describe the picture to screen readers. @default 'CAM 01' */
  label?: string;
  /**
   * The color look. `vhs` is washed and warm, `night` is green, `infrared`
   * is cold and contrasty, `mono` is black and white, `none` leaves color alone.
   * @default 'vhs'
   */
  grade?: CamGrade;
  /** How rough the picture looks: lens fringing, scanlines, grain, and glitches. @default 'cursed' */
  intensity?: HorrorIntensity;
  /**
   * The on-screen clock. `true` shows the current time, a `Date` shows that
   * fixed moment, `false` hides it.
   * @default true
   */
  timestamp?: boolean | Date;
  /** Show the blinking REC dot and a running counter. @default true */
  rec?: boolean;
  /** Watch the picture for movement and show a MOTION badge. @default false */
  motion?: boolean;
  /** How easily movement is noticed. @default 'medium' */
  motionSensitivity?: MotionSensitivity;
  /** Called once each time movement begins. */
  onMotion?: () => void;
  /** Flip the video left to right, like a mirror. Good for webcams. @default false */
  mirror?: boolean;
  /** Shape of the picture, width over height. @default '4 / 3' */
  aspectRatio?: CSSProperties['aspectRatio'];
  /** Allow grain, glitches, and the blinking dot. Reduced-motion users never get them. @default true */
  animated?: boolean;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the camera frame. */
  style?: CSSProperties;
}

const { hud, colors, rec: recToken } = camTokens;

const hudText: CSSProperties = {
  fontFamily: hud.font,
  fontSize: hud.size,
  letterSpacing: hud.letterSpacing,
  color: colors.hud,
  textShadow: `0 0 ${hud.shadowBlur}px ${colors.base}`,
  textTransform: 'uppercase',
};

const hudRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: hud.gap,
};

/**
 * A camera frame that makes any picture look like found footage: lens
 * fringing, scanlines, film grain, dark corners, an occasional glitch, a
 * recording dot, and a running clock. It can also watch for movement.
 *
 * The picture can be a live `stream`, a video `src`, or your own `children`
 * (a canvas, an `AsciiVideo`, an image). Everything happens on the device;
 * nothing is recorded or sent anywhere, and the camera is only used if you
 * pass in a stream you started yourself.
 *
 * Grain, glitches, and the blinking dot stop for users who prefer reduced
 * motion. The clock and counter are hidden from screen readers so they do not
 * announce every second; the motion badge is a polite live status.
 *
 * @example Webcam
 * ```tsx
 * const { stream, start } = useMediaStream({ video: true });
 *
 * <button onClick={start}>Open the camera</button>
 * <SurveillanceCam stream={stream} grade="night" mirror motion label="CELLAR" />
 * ```
 *
 * @example Video file
 * ```tsx
 * <SurveillanceCam src="/hallway.mp4" grade="vhs" intensity="abyssal" />
 * ```
 *
 * @example Text camera
 * ```tsx
 * <SurveillanceCam grade="night">
 *   <AsciiVideo stream={stream} theme="matrix" />
 * </SurveillanceCam>
 * ```
 */
export const SurveillanceCam = ({
  stream = null,
  src,
  children,
  loop = true,
  label = CAM_DEFAULT_LABEL,
  grade = 'vhs',
  intensity = 'cursed',
  timestamp = true,
  rec = true,
  motion = false,
  motionSensitivity = 'medium',
  onMotion,
  mirror = false,
  aspectRatio = CAM_DEFAULT_ASPECT,
  animated = true,
  className = '',
  style,
}: SurveillanceCamProps) => {
  const prefersReducedMotion = useMediaQuery(breakpoints.reducedMotion);
  const animate = animated && !prefersReducedMotion;
  const tone = camIntensity[intensity];
  const gradeTone = camGradeTokens[grade];

  const filterId = `${CAM_PREFIX}-${useId().replace(ID_UNSAFE, '')}`;
  const matrix = useMemo(() => (grade === 'none' ? undefined : gradeMatrix(grade)), [grade]);
  const filtered = Boolean(matrix) || tone.aberration > 0;

  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceRef = useRef<FrameSource | null>(null);
  useVideoSource(videoRef, stream);

  // Point motion detection at whichever picture is inside right now.
  useEffect(() => {
    sourceRef.current = layerRef.current?.querySelector<FrameSource>(PICTURE_SELECTOR) ?? null;
  });
  const { moving: somethingMoved } = useMotionDetector(sourceRef, {
    enabled: motion,
    sensitivity: motionSensitivity,
    onMotion,
  });

  const [startedAt] = useState(() => Date.now());
  const clockNeeded = rec || timestamp === true;
  const now = useNow(undefined, clockNeeded);
  const stamp = timestamp instanceof Date ? timestamp : now;

  const hasVideo = Boolean(stream) || Boolean(src);

  return (
    <figure
      aria-label={`${label}, ${gradeTone.label} camera`}
      data-grade={grade}
      data-motion-detected={motion ? String(somethingMoved) : undefined}
      className={`${CAM_CLASS} ${CAM_CLASS}--${grade} ${className}`.trim()}
      style={{
        position: 'relative',
        margin: 0,
        overflow: 'hidden',
        aspectRatio,
        background: colors.base,
        ...style,
      }}
    >
      <style>{camKeyframes}</style>
      {filtered && <CamFilter id={filterId} aberration={tone.aberration} matrix={matrix} />}

      <div
        ref={layerRef}
        style={{
          ...overlayBase,
          pointerEvents: 'auto',
          filter: filtered ? `url(#${filterId})` : undefined,
        }}
      >
        {hasVideo && (
          <video
            ref={videoRef}
            src={stream ? undefined : src}
            muted
            playsInline
            autoPlay
            loop={loop}
            aria-hidden="true"
            tabIndex={-1}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: mirror ? 'scaleX(-1)' : undefined,
            }}
          />
        )}
        {children}
      </div>

      <div aria-hidden="true" style={scanlineStyle(tone.scanlines)} />
      <div aria-hidden="true" style={vignetteStyle(tone.vignette)} />
      <div aria-hidden="true" style={grainStyle(tone, animate)} />
      {animate && <div aria-hidden="true" style={glitchStyle(tone)} />}

      <div
        style={{
          ...overlayBase,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: hud.padding,
          ...hudText,
        }}
      >
        <div style={hudRow}>
          <span>{label}</span>
          {motion && (
            <div role="status">
              {somethingMoved && (
                <Badge variant="danger" size="sm" dot>
                  Motion
                </Badge>
              )}
            </div>
          )}
          {rec ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: hud.gap }}>
              <span
                aria-hidden="true"
                style={{
                  width: recToken.dot,
                  height: recToken.dot,
                  borderRadius: recToken.radius,
                  background: colors.rec,
                  boxShadow: `0 0 ${hud.shadowBlur}px ${withAlpha(colors.rec, recToken.glow)}`,
                  animation: animate
                    ? `${camAnimations.blink} ${recToken.blinkSeconds}s steps(1) infinite`
                    : undefined,
                }}
              />
              <span>Rec</span>
              <span aria-hidden="true" suppressHydrationWarning>
                {formatElapsed(now.getTime() - startedAt)}
              </span>
            </span>
          ) : (
            <span />
          )}
        </div>

        <div style={hudRow}>
          {timestamp ? (
            <time aria-hidden="true" suppressHydrationWarning dateTime={stamp.toISOString()}>
              {formatCamTimestamp(stamp)}
            </time>
          ) : (
            <span />
          )}
          <span style={{ color: gradeTone.color }}>{gradeTone.label}</span>
        </div>
      </div>
    </figure>
  );
};
