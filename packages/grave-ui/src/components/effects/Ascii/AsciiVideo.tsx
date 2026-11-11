/**
 * AsciiVideo - A live camera or video drawn as text.
 * @module components/effects/Ascii/AsciiVideo
 */

import { useRef } from 'react';
import { useAsciiVideo, type AsciiVideoOptions } from '../../../hooks/useAsciiVideo';
import { useVideoSource } from '../../../hooks/useVideoSource';
import { AsciiDisplay, type AsciiDisplayProps } from './AsciiDisplay';
import { asciiTokens, visuallyHidden } from './tokens';

/**
 * Props for {@link AsciiVideo}. Includes every prop of {@link AsciiDisplay}
 * and the conversion options of {@link useAsciiVideo}.
 */
export interface AsciiVideoProps
  extends Omit<AsciiDisplayProps, 'lines'>,
    Omit<AsciiVideoOptions, 'enabled'> {
  /** A live stream, for example from `useMediaStream({ video: true })`. */
  stream?: MediaStream | null;
  /** A video file address. Ignored when `stream` is set. */
  src?: string;
  /** Loop a video file. @default true */
  loop?: boolean;
  /** Freeze the picture. @default false */
  paused?: boolean;
  /** Text shown until the first frame arrives. @default 'NO SIGNAL' */
  placeholder?: string;
}

/**
 * Plays a camera stream or a video file as moving text.
 *
 * The video plays muted and out of sight, and is sampled at a low resolution
 * a few times a second. Nothing is recorded or sent anywhere. Videos from
 * another website need to allow cross-origin reading, or the picture is blank
 * and a readable error is shown.
 *
 * @example Webcam
 * ```tsx
 * const { stream, start } = useMediaStream({ video: true });
 *
 * <button onClick={start}>Show me</button>
 * <AsciiVideo stream={stream} cols={100} ramp="blocks" mirror theme="matrix" />
 * ```
 */
export const AsciiVideo = ({
  stream = null,
  src,
  loop = true,
  paused = false,
  placeholder = asciiTokens.noSignal,
  cols,
  fps,
  mirror,
  ramp,
  invert,
  contrast,
  brightness,
  label = 'Live picture drawn as text',
  ...display
}: AsciiVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useVideoSource(videoRef, stream);

  const { lines, error } = useAsciiVideo(videoRef, {
    cols,
    fps,
    mirror,
    ramp,
    invert,
    contrast,
    brightness,
    enabled: !paused,
  });

  return (
    <>
      <video
        ref={videoRef}
        src={stream ? undefined : src}
        muted
        playsInline
        autoPlay
        loop={loop}
        aria-hidden="true"
        tabIndex={-1}
        style={visuallyHidden}
      />
      {error ? (
        <p role="alert" style={{ margin: 0, fontFamily: asciiTokens.font }}>
          {error}
        </p>
      ) : (
        <AsciiDisplay {...display} label={label} lines={lines.length > 0 ? lines : [placeholder]} />
      )}
    </>
  );
};
