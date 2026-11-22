/**
 * GhostRun - a small endless runner: a ghost drifts left through a night
 * graveyard, jumps the tombstones and collects coins
 * @module components/effects/GhostRun/GhostRun
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { PlayMark } from '../../../assets/svg/base/PlayMark';
import { ReplayMark } from '../../../assets/svg/base/ReplayMark';
import { useSpookyAudio, type SpookySound } from '../../../audio';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useBestScore } from '../../../hooks/useBestScore';
import { useEventListener } from '../../../hooks/useEventListener';
import { useLatest } from '../../../hooks/useLatest';
import { usePageVisible } from '../../../hooks/usePageVisible';
import { useRafLoop } from '../../../hooks/useRafLoop';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { GameDialog, GameMessage } from '../GameDialog/GameDialog';
import { gameDialogTokens as d } from '../GameDialog/tokens';
import {
  createGhostRun,
  ghostRunScore,
  jumpGhost,
  startGhostRun,
  stepGhostRun,
  type GhostRunPhase,
  type GhostRunState,
} from './ghostRunEngine';
import { ghostRunTokens as t } from './tokens';

/** The sounds the game plays. Any sound from the library can stand in. */
export interface GhostRunSounds {
  jump: SpookySound;
  coin: SpookySound;
  crash: SpookySound;
}

const DEFAULT_SOUNDS: GhostRunSounds = { jump: 'wispBlip', coin: 'runeChime', crash: 'boneCrack' };

export interface GhostRunProps {
  /** Shows the game. Closing it ends the run in progress. */
  open: boolean;
  /** Called when the person asks to close it: the close button or Escape. */
  onClose: () => void;
  /** Keep the best score in this browser under this key. Leave out to forget it when the game closes. */
  storageKey?: string;
  /** @default 'Ghost run' */
  title?: string;
  /** The close button's accessible name. It shows as an ×. @default 'Close the game' */
  closeLabel?: string;
  /** Replace any of the game's sounds. Sounds only play once sound is on. */
  sounds?: Partial<GhostRunSounds>;
  className?: string;
  style?: CSSProperties;
}

const JUMP_KEYS = new Set([' ', 'Spacebar', 'ArrowUp', 'w', 'W']);
const PAUSE_KEYS = new Set(['p', 'P']);
const MS_PER_SECOND = 1000;

/** Draws one frame of the field: sky, moon, ground, tombstones, coins and the ghost. */
const drawField = (ctx: CanvasRenderingContext2D, state: GhostRunState, seconds: number, still: boolean): void => {
  const { field, colors } = t;
  const circle = (x: number, y: number, radius: number) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  };

  ctx.fillStyle = colors.sky;
  ctx.fillRect(0, 0, field.width, field.height);
  ctx.fillStyle = colors.moon;
  circle(t.moon.x, t.moon.y, t.moon.radius);
  ctx.fill();

  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, field.groundY, field.width, field.height - field.groundY);
  ctx.strokeStyle = colors.groundLine;
  ctx.lineWidth = t.lineWidth;
  ctx.beginPath();
  ctx.moveTo(0, field.groundY);
  ctx.lineTo(field.width, field.groundY);
  ctx.stroke();

  // Tombstones: a rounded top on a straight body.
  for (const stone of state.tombstones) {
    const top = field.groundY - stone.height;
    const right = stone.x + stone.width;
    const cap = Math.min(t.tombstone.capRadius, stone.width / 2);
    ctx.beginPath();
    ctx.moveTo(stone.x, field.groundY);
    ctx.lineTo(stone.x, top + cap);
    ctx.arcTo(stone.x, top, stone.x + cap, top, cap);
    ctx.lineTo(right - cap, top);
    ctx.arcTo(right, top, right, top + cap, cap);
    ctx.lineTo(right, field.groundY);
    ctx.closePath();
    ctx.fillStyle = colors.stone;
    ctx.fill();
    ctx.strokeStyle = colors.stoneEdge;
    ctx.stroke();
  }

  for (const coin of state.pickups) {
    circle(coin.x, field.groundY - coin.lift, t.coin.radius);
    ctx.fillStyle = colors.coin;
    ctx.fill();
    ctx.strokeStyle = colors.coinEdge;
    ctx.stroke();
  }

  // The ghost. It bobs while it waits on the ground, unless motion is reduced.
  const { ghost, ghostShape: shape } = t;
  const bob = still || state.ghostLift > 0 ? 0 : Math.sin(seconds * t.bob.perSecond * Math.PI * 2) * t.bob.lift;
  const bottom = field.groundY - state.ghostLift - bob;
  const top = bottom - ghost.height;
  const half = ghost.width / 2;

  // It travels left, so its wisps trail off to its right.
  if (state.phase === 'running' && !still) {
    ctx.fillStyle = colors.trail;
    for (let i = 1; i <= t.trail.count; i++) {
      circle(ghost.x + ghost.width + i * t.trail.spacing, top + half, t.trail.radius / i);
      ctx.fill();
    }
  }

  ctx.beginPath();
  ctx.moveTo(ghost.x, bottom);
  ctx.lineTo(ghost.x, top + half);
  ctx.arc(ghost.x + half, top + half, half, Math.PI, 0);
  ctx.lineTo(ghost.x + ghost.width, bottom);
  const wave = ghost.width / shape.waves;
  for (let i = shape.waves; i > 0; i--) {
    const end = ghost.x + (i - 1) * wave;
    ctx.quadraticCurveTo(end + wave / 2, bottom - shape.waveDepth, end, bottom);
  }
  ctx.closePath();
  ctx.fillStyle = colors.ghost;
  ctx.fill();

  ctx.fillStyle = colors.ghostEyes;
  for (const x of [ghost.x + shape.eyeFromLeft, ghost.x + shape.eyeFromLeft + shape.eyeGap]) {
    circle(x, top + shape.eyeFromTop, shape.eyeRadius);
    ctx.fill();
  }
};

const css = {
  field: {
    position: 'relative',
    aspectRatio: `${t.field.width} / ${t.field.height}`,
    overflow: 'hidden',
    border: `${d.borderWidth} solid ${d.panelEdge}`,
    borderRadius: d.radius,
    touchAction: 'none',
    cursor: 'pointer',
  },
  canvas: { display: 'block', width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeContent: 'center',
    padding: d.padding,
    background: d.overlay,
  },
} satisfies Record<string, CSSProperties>;

/** The game itself, mounted only while it is open, so every opening starts fresh. */
const GhostRunGame = ({ onClose, storageKey, title = 'Ghost run', closeLabel, sounds, className, style }: Omit<GhostRunProps, 'open'>) => {
  const dialog = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const action = useRef<HTMLButtonElement>(null);
  const game = useRef<GhostRunState>(createGhostRun());
  const paused = useRef(false);
  const shown = useRef({ score: 0, coins: 0 });
  const [phase, setPhase] = useState<GhostRunPhase>('ready');
  const [isPaused, setIsPaused] = useState(false);
  const [hud, setHud] = useState({ score: 0, coins: 0 });
  const { best, offer } = useBestScore(storageKey);
  const { playSound } = useSpookyAudio();
  const { announce } = useAriaAnnounce();
  const still = useReducedMotion();
  const visible = usePageVisible();
  const chosen = useLatest({ ...DEFAULT_SOUNDS, ...sounds });

  const play = (name: keyof GhostRunSounds) => playSound(chosen.current[name], t.volume[name]);

  const finish = () => {
    const state = game.current;
    const score = ghostRunScore(state);
    const { previous, record } = offer(score);
    setHud({ score, coins: state.coins });
    setPhase('over');
    const coins = `${state.coins} ${state.coins === 1 ? 'coin' : 'coins'}`;
    announce(`The ghost hit a tombstone. Score ${score}, with ${coins}. ${record ? 'A new best.' : `Best ${previous}.`}`);
  };

  const start = () => {
    game.current = startGhostRun();
    paused.current = false;
    shown.current = { score: 0, coins: 0 };
    setHud(shown.current);
    setIsPaused(false);
    setPhase('running');
    // Keys go to the game again, not to the button that started it.
    dialog.current?.focus();
  };

  const pause = useCallback((on: boolean) => {
    if (game.current.phase !== 'running' || paused.current === on) return;
    paused.current = on;
    setIsPaused(on);
    if (!on) dialog.current?.focus();
  }, []);

  /** One press: start a run, carry on after a pause, or jump. */
  const act = () => {
    const state = game.current;
    if (state.phase !== 'running') return start();
    if (paused.current) return pause(false);
    if (jumpGhost(state)) play('jump');
  };

  // The canvas draws at the screen's sharpness, up to a limit.
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ratio = Math.min(window.devicePixelRatio || 1, t.maxPixelRatio);
    element.width = t.field.width * ratio;
    element.height = t.field.height * ratio;
    context.current = element.getContext('2d');
    context.current?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }, []);

  // Each frame: move the game on, draw it, and update the score line when it changes.
  useRafLoop(({ time, delta }) => {
    const state = game.current;
    if (!paused.current) {
      const events = stepGhostRun(state, delta / MS_PER_SECOND);
      if (events.coins > 0) play('coin');
      if (events.crashed) {
        play('crash');
        finish();
      }
    }
    if (context.current) drawField(context.current, state, time / MS_PER_SECOND, still);
    const score = ghostRunScore(state);
    if (state.phase === 'running' && (score !== shown.current.score || state.coins !== shown.current.coins)) {
      shown.current = { score, coins: state.coins };
      setHud(shown.current);
    }
  });

  // Leaving the tab or the window pauses the run.
  useEffect(() => {
    if (!visible) pause(true);
  }, [visible, pause]);
  useEventListener('window', 'blur', () => pause(true));

  // After a crash or a pause, the button that carries on gets the focus.
  useEffect(() => {
    if (phase === 'over' || isPaused) action.current?.focus();
  }, [phase, isPaused]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (PAUSE_KEYS.has(event.key)) {
      pause(!paused.current);
      return;
    }
    if (!JUMP_KEYS.has(event.key)) return;
    // A focused button handles Space and Enter itself.
    if (event.target instanceof HTMLButtonElement && event.key !== 'ArrowUp') return;
    event.preventDefault();
    act();
  };

  const message =
    phase === 'ready'
      ? { text: 'Drift left. Jump the tombstones. Collect the coins.', action: 'Start', icon: <PlayMark size={d.actionIconSize} />, run: start }
      : phase === 'over'
        ? { text: `The ghost hit a tombstone. Score ${hud.score}, best ${Math.max(best, hud.score)}.`, action: 'Play again', icon: <ReplayMark size={d.actionIconSize} />, run: start }
        : isPaused
          ? { text: 'Paused.', action: 'Carry on', icon: <PlayMark size={d.actionIconSize} />, run: () => pause(false) }
          : null;

  return (
    <GameDialog
      ref={dialog}
      title={title}
      closeLabel={closeLabel}
      onClose={onClose}
      onKeyDown={onKeyDown}
      help="Jump: Space, Up arrow or tap. Pause: P. Close: Esc."
      stats={[
        { label: 'Score', value: hud.score },
        { label: 'Coins', value: hud.coins },
        { label: 'Best', value: best },
      ]}
      className={className}
      style={style}
    >
      <div
        style={css.field}
        onPointerDown={(event) => {
          if (event.target instanceof HTMLButtonElement) return;
          event.preventDefault();
          act();
        }}
      >
        <canvas
          ref={canvas}
          style={css.canvas}
          role="img"
          aria-label="A ghost drifts left through a graveyard at night. Tombstones and coins come towards it from the left."
        />
        {message && (
          <div style={css.overlay}>
            <GameMessage ref={action} text={message.text} action={message.action} icon={message.icon} onAction={message.run} />
          </div>
        )}
      </div>
    </GameDialog>
  );
};

/**
 * A small endless runner. A ghost drifts left through a graveyard at night, the
 * other way from most runners: tombstones come at it from the left, to be jumped,
 * and coins hang low (stay down to take them) or high (jump for them). The world
 * speeds up as the run goes on; a run ends at the first tombstone it hits.
 *
 * It opens in a GameDialog over the page. It works from the keyboard, the mouse
 * and touch, pauses when the tab or window loses focus, and Escape always closes
 * it. Nothing moves until the player starts a run; with reduced motion the ghost
 * doesn't bob or trail wisps.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <button onClick={() => setOpen(true)} aria-label="Play Ghost run"><GhostIcon /></button>
 * <GhostRun open={open} onClose={() => setOpen(false)} storageKey="ghost-run-best" />
 * ```
 */
export const GhostRun = ({ open, ...props }: GhostRunProps) => (open ? <GhostRunGame {...props} /> : null);