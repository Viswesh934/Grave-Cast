/**
 * GameDialog - the window a small game opens in: a title, a score line, a close
 * button, the game, and a line of help
 * @module components/effects/GameDialog/GameDialog
 */
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CloseMark } from '../../../assets/svg/base/CloseMark';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { Button, IconButton } from '../../primitives';
import { gameDialogTokens as t } from './tokens';

/** One number in the score line, such as `{ label: 'Score', value: 120 }`. */
export interface GameStat {
  label: string;
  value: ReactNode;
}

export interface GameDialogProps {
  /** The game's name, shown as the dialog's heading. */
  title: string;
  /** Numbers shown beside the title, such as the score and the best score. */
  stats?: readonly GameStat[];
  /** Called when the person asks to close it: the close button or Escape. */
  onClose: () => void;
  /** The close button's accessible name. It shows as an ×. @default 'Close the game' */
  closeLabel?: string;
  /**
   * Keys for the game. Escape (close) and Tab (kept inside the dialog) are
   * handled first, so the game only sees the rest.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** A short line under the game, such as its controls. */
  help?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const css = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: t.zIndex,
    display: 'grid',
    placeItems: 'center',
    padding: t.gap,
    background: t.backdrop,
    outline: 'none',
  },
  panel: {
    width: `min(100%, ${t.width})`,
    display: 'grid',
    gap: t.gap,
    padding: t.padding,
    background: t.panel,
    border: `${t.borderWidth} solid ${t.panelEdge}`,
    borderRadius: t.radius,
    color: t.text,
    fontFamily: t.font,
  },
  header: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: t.gap },
  title: { margin: 0, flex: 1, fontSize: t.titleSize, fontStyle: 'italic', fontWeight: 'normal' },
  stats: {
    margin: 0,
    fontFamily: t.labelFont,
    fontSize: t.labelSize,
    letterSpacing: t.labelTracking,
    textTransform: 'uppercase',
    color: t.muted,
  },
  value: { color: t.accent },
  help: { margin: 0, fontSize: t.textSize, color: t.muted },
  message: { display: 'grid', justifyItems: 'center', gap: t.gap, textAlign: 'center' },
  messageText: { margin: 0, fontSize: t.textSize },
} satisfies Record<string, CSSProperties>;

/**
 * Opens a small game over the page, in its own dialog. Focus moves into it and
 * returns to where it was on close; Tab stays inside it, and Escape and the
 * close button always close it. The forwarded ref is the dialog itself, so a
 * game can take the focus back after a button press.
 *
 * @example
 * ```tsx
 * <GameDialog title="Ghost run" stats={[{ label: 'Score', value: score }]} onClose={close} help="Jump: Space.">
 *   <canvas />
 * </GameDialog>
 * ```
 */
export const GameDialog = forwardRef<HTMLDivElement, GameDialogProps>(
  ({ title, stats = [], onClose, closeLabel = 'Close the game', onKeyDown, help, children, className, style }, ref) => {
    const titleId = useId();
    const helpId = useId();
    const box = useRef<HTMLDivElement>(null);
    const trapTab = useFocusTrap(box);
    useImperativeHandle(ref, () => box.current as HTMLDivElement);

    // Focus moves into the game when it opens, and back to where it was when it closes.
    useEffect(() => {
      const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      box.current?.focus();
      return () => before?.focus();
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (trapTab(event)) return;
      onKeyDown?.(event);
    };

    if (typeof document === 'undefined') return null;
    return createPortal(
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={help ? helpId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={className}
        style={{ ...css.backdrop, ...style }}
      >
        <div style={css.panel}>
          <div style={css.header}>
            <h2 id={titleId} style={css.title}>
              {title}
            </h2>
            {stats.length > 0 && (
              <p style={css.stats}>
                {stats.map((stat, i) => (
                  <span key={stat.label}>
                    {i > 0 && ' \u00b7 '}
                    {stat.label} <span style={css.value}>{stat.value}</span>
                  </span>
                ))}
              </p>
            )}
            <IconButton label={closeLabel} variant="gothic" size="sm" onClick={onClose}>
              <CloseMark size={t.closeIconSize} strokeWidth={t.closeIconStroke} />
            </IconButton>
          </div>
          {children}
          {help && (
            <p id={helpId} style={css.help}>
              {help}
            </p>
          )}
        </div>
      </div>,
      document.body
    );
  }
);
GameDialog.displayName = 'GameDialog';

export interface GameMessageProps {
  /** What has happened, or what to do. */
  text: ReactNode;
  /** What the button does, such as "Start" or "Play again". With an `icon`, these words become its name for screen readers and its tooltip. */
  action: string;
  onAction: () => void;
  /** Show this icon on the button instead of the words, such as `<PlayMark />`. */
  icon?: ReactNode;
  style?: CSSProperties;
}

/**
 * A short message with one button, for a game that is about to start, is
 * paused, or has ended. The button shows `icon` when given (still named by
 * `action`), or the words of `action`. The forwarded ref is the button, so it
 * can take focus.
 *
 * @example
 * ```tsx
 * <GameMessage ref={button} text="Time. 42 words a minute." action="Play again" icon={<ReplayMark />} onAction={start} />
 * ```
 */
export const GameMessage = forwardRef<HTMLButtonElement, GameMessageProps>(({ text, action, onAction, icon, style }, ref) => (
  <div style={{ ...css.message, ...style }}>
    <p style={css.messageText}>{text}</p>
    {icon ? (
      <IconButton ref={ref} label={action} variant="gothic" size="lg" onClick={onAction}>
        {icon}
      </IconButton>
    ) : (
      <Button ref={ref} variant="gothic" size="md" onClick={onAction}>
        {action}
      </Button>
    )}
  </div>
));
GameMessage.displayName = 'GameMessage';
