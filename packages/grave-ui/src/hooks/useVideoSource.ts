/**
 * useVideoSource - Connect a live stream to a video element
 * @module hooks/useVideoSource
 */

import { useEffect, type RefObject } from 'react';

/**
 * Plays a `MediaStream` in a video element and disconnects it on cleanup.
 *
 * It does not stop the stream's tracks. Whoever asked for the camera or
 * microphone (for example `useMediaStream`) is responsible for that.
 *
 * @param videoRef - Ref to the `<video>` element.
 * @param stream - The stream to show, or `null` for none.
 *
 * @example
 * ```tsx
 * const video = useRef<HTMLVideoElement>(null);
 * const { stream } = useMediaStream({ video: true });
 * useVideoSource(video, stream);
 *
 * return <video ref={video} muted playsInline />;
 * ```
 */
export const useVideoSource = (videoRef: RefObject<HTMLVideoElement | null>, stream: MediaStream | null): void => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return undefined;

    video.srcObject = stream;
    // Older browsers return nothing from play(); autoplay rules may also reject it.
    Promise.resolve(video.play()).catch(() => undefined);

    return () => {
      video.srcObject = null;
    };
  }, [videoRef, stream]);
};
