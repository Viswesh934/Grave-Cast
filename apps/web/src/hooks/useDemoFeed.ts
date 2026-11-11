import { useEffect, useState } from 'react';

/** Size of the generated picture, in pixels. */
const WIDTH = 320;
const HEIGHT = 240;

/** Frames per second captured from the canvas. */
const CAPTURE_FPS = 15;

/** Seconds a figure takes to cross the hallway, and the pause before the next one. */
const CROSS_SECONDS = 5;
const PAUSE_SECONDS = 6;

/**
 * Generates an animated hallway as a real MediaStream, so camera components
 * can be tried without a webcam. A dim corridor, a flickering lamp, and a tall
 * figure that walks across now and then (so motion detection has something to see).
 *
 * Returns `null` while inactive or where `canvas.captureStream` is missing.
 */
export function useDemoFeed(active: boolean): MediaStream | null {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!active) return undefined;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof canvas.captureStream !== 'function') return undefined;

    const media = canvas.captureStream(CAPTURE_FPS);
    setStream(media);

    const started = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const t = (now - started) / 1000;

      // Walls, floor, and ceiling in perspective.
      const wall = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      wall.addColorStop(0, '#10131a');
      wall.addColorStop(0.5, '#2a2f3a');
      wall.addColorStop(1, '#0b0d12');
      ctx.fillStyle = wall;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = '#05060a';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(WIDTH * 0.32, HEIGHT * 0.38);
      ctx.lineTo(WIDTH * 0.32, HEIGHT * 0.66);
      ctx.lineTo(0, HEIGHT);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(WIDTH, 0);
      ctx.lineTo(WIDTH * 0.68, HEIGHT * 0.38);
      ctx.lineTo(WIDTH * 0.68, HEIGHT * 0.66);
      ctx.lineTo(WIDTH, HEIGHT);
      ctx.closePath();
      ctx.fill();

      // A far door with a flickering lamp above it.
      const flicker = 0.65 + 0.35 * Math.sin(t * 17) * Math.sin(t * 5.3);
      const lamp = ctx.createRadialGradient(WIDTH / 2, HEIGHT * 0.3, 2, WIDTH / 2, HEIGHT * 0.3, 90);
      lamp.addColorStop(0, `rgba(255, 220, 150, ${0.75 * flicker})`);
      lamp.addColorStop(1, 'rgba(255, 220, 150, 0)');
      ctx.fillStyle = lamp;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#0a0b10';
      ctx.fillRect(WIDTH * 0.43, HEIGHT * 0.4, WIDTH * 0.14, HEIGHT * 0.26);

      // A figure that crosses every so often.
      const cycle = CROSS_SECONDS + PAUSE_SECONDS;
      const phase = t % cycle;
      if (phase < CROSS_SECONDS) {
        const x = -30 + (phase / CROSS_SECONDS) * (WIDTH + 60);
        const sway = Math.sin(t * 6) * 3;
        ctx.fillStyle = '#020204';
        ctx.beginPath();
        ctx.ellipse(x + sway, HEIGHT * 0.62, 18, 64, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + sway, HEIGHT * 0.34, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      // Film grain.
      for (let i = 0; i < 90; i += 1) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08})`;
        ctx.fillRect(Math.random() * WIDTH, Math.random() * HEIGHT, 1.5, 1.5);
      }
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      media.getTracks().forEach((track) => track.stop());
      setStream(null);
    };
  }, [active]);

  return active ? stream : null;
}
