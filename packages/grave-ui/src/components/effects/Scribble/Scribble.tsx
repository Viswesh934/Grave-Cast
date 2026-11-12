/**
 * Scribble - Draw on the screen: pens, shapes, arrows, notes, and an eraser
 * @module components/effects/Scribble
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { useAriaAnnounce } from '../../../hooks/useAriaAnnounce';
import { useFadingTrail, type TrailPoint } from '../../../hooks/useFadingTrail';
import { useLatest } from '../../../hooks/useLatest';
import { useScribble, type ScribbleStyle } from '../../../hooks/useScribble';
import { withAlpha } from '../../../tokens/colors';
import { zLayers } from '../../../tokens/layers';
import { SCRIBBLE_TRANSIENT_ATTRIBUTE, exportScribble, type ScribbleFormat } from './exportDrawing';
import {
  SCRIBBLE_TEXT_LIMIT,
  SCRIBBLE_TOOLS,
  TEXT_LINE_HEIGHT,
  shapePath,
  strokeWidthOf,
  textSizeOf,
  type ScribblePoint,
  type ScribbleShape,
  type ScribbleTool,
} from './geometry';
import { SCRIBBLE_INKS, SCRIBBLE_WIDTHS, scribbleChrome as chrome, scribbleStroke, scribbleTrail } from './tokens';

/** Each tool's name, keyboard shortcut, and icon (drawn on a 24-unit grid). */
export const SCRIBBLE_TOOL_INFO: Record<ScribbleTool, { name: string; key: string; icon: string }> = {
  pen: { name: 'Pen', key: 'p', icon: 'M4 20l4-1 11-11-3-3L5 16l-1 4z M14 7l3 3' },
  highlighter: { name: 'Highlighter', key: 'h', icon: 'M15 4l5 5-8 8H7v-5z M4 20h7' },
  line: { name: 'Line', key: 'l', icon: 'M5 19L19 5' },
  arrow: { name: 'Arrow', key: 'a', icon: 'M5 19L19 5 M10 5h9v9' },
  rectangle: { name: 'Rectangle', key: 'r', icon: 'M4 6h16v12H4z' },
  ellipse: { name: 'Ellipse', key: 'o', icon: 'M12 5c4.4 0 8 3.1 8 7s-3.6 7-8 7-8-3.1-8-7 3.6-7 8-7z' },
  text: { name: 'Text', key: 't', icon: 'M5 7V5h14v2 M12 5v14 M9 19h6' },
  laser: { name: 'Laser pointer', key: 'k', icon: 'M4 20l7-7 M15 3l1.4 3.6L20 8l-3.6 1.4L15 13l-1.4-3.6L10 8l3.6-1.4z' },
  eraser: { name: 'Eraser', key: 'e', icon: 'M16 4l4 4-10 10H6l-2-2z M9 20h11 M10 8l6 6' },
};

const ICONS = {
  undo: 'M9 14L4 9l5-5 M4 9h10a6 6 0 010 12h-3',
  redo: 'M15 14l5-5-5-5 M20 9H10a6 6 0 000 12h3',
  clear: 'M5 7h14 M10 7V4h4v3 M7 7l1 13h8l1-13',
  save: 'M12 4v11 M7 10l5 5 5-5 M5 20h14',
  close: 'M6 6l12 12 M18 6L6 18',
  sketchy: 'M3 12c3-4 5 4 9 0s6 4 9 0',
  width: 'M5 12h14',
} as const;

/** The grid icons are drawn on, and their line width. */
const ICON_GRID = 24;
const ICON_STROKE = 2;

const CLASS = {
  root: 'grave-scribble',
  toolbar: 'grave-scribble__toolbar',
  button: 'grave-scribble__button',
  divider: 'grave-scribble__divider',
  launcher: 'grave-scribble__launcher',
} as const;

const scribbleStyles = `
.${CLASS.toolbar} {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${chrome.gap};
  padding: ${chrome.padding};
  background: ${chrome.panel};
  border: ${chrome.divider} solid ${chrome.panelBorder};
  border-radius: ${chrome.radius};
  box-shadow: ${chrome.shadow};
  color: ${chrome.text};
  font: ${chrome.fontSize} ${chrome.font};
}
.${CLASS.button}, .${CLASS.launcher} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${chrome.gap};
  min-width: ${chrome.buttonSize};
  height: ${chrome.buttonSize};
  padding: 0 ${chrome.padding};
  border: ${chrome.divider} solid transparent;
  border-radius: ${chrome.buttonRadius};
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.${CLASS.button}:hover:not(:disabled) { background: ${withAlpha(chrome.active, chrome.hoverTint)}; }
.${CLASS.button}[aria-pressed="true"] {
  background: ${withAlpha(chrome.active, chrome.pressedTint)};
  border-color: ${chrome.active};
}
.${CLASS.button}:disabled { opacity: ${chrome.disabledOpacity}; cursor: not-allowed; }
.${CLASS.button}:focus-visible, .${CLASS.launcher}:focus-visible {
  outline: ${chrome.focusRing} solid ${chrome.active};
  outline-offset: ${chrome.divider};
}
.${CLASS.divider} {
  align-self: stretch;
  width: ${chrome.divider};
  margin: 0 ${chrome.gap};
  background: ${chrome.panelBorder};
}
.${CLASS.launcher} {
  background: ${chrome.panel};
  border-color: ${chrome.panelBorder};
  box-shadow: ${chrome.shadow};
  color: ${chrome.text};
  font: ${chrome.fontSize} ${chrome.font};
}
.${CLASS.launcher}:hover { border-color: ${chrome.active}; }
`;

const Icon = ({ path, strokeWidth = ICON_STROKE }: { path: string; strokeWidth?: number }) => (
  <svg
    aria-hidden="true"
    width={chrome.iconSize}
    height={chrome.iconSize}
    viewBox={`0 0 ${ICON_GRID} ${ICON_GRID}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

/** Draws a fading trail: each segment thins and fades with the age of its newer end. */
const TrailView = ({ points, color, width, glow }: { points: readonly TrailPoint[]; color: string; width: number; glow?: number }) => (
  <g style={glow ? { filter: `drop-shadow(0 0 ${glow}px ${color})` } : undefined}>
    {points.map((point, index) => {
      const previous = points[index - 1];
      if (!previous || point.start) return null;
      const life = 1 - point.age;
      return (
        <line
          key={index}
          x1={previous.x}
          y1={previous.y}
          x2={point.x}
          y2={point.y}
          stroke={color}
          strokeWidth={Math.max(scribbleStroke.minPointGap, width * life)}
          strokeOpacity={life}
          strokeLinecap="round"
        />
      );
    })}
  </g>
);

/** Draws one shape. */
const ShapeView = ({ shape }: { shape: ScribbleShape }) => {
  if (shape.kind === 'text') {
    const [at] = shape.points;
    const size = textSizeOf(shape);
    return (
      <text x={at.x} y={at.y} fill={shape.color} fontSize={size} fontFamily={chrome.font} dominantBaseline="hanging">
        {(shape.text ?? '').split('\n').map((line, index) => (
          <tspan key={index} x={at.x} dy={index === 0 ? 0 : size * TEXT_LINE_HEIGHT}>
            {line}
          </tspan>
        ))}
      </text>
    );
  }
  return (
    <path
      d={shapePath(shape)}
      fill="none"
      stroke={shape.color}
      strokeWidth={strokeWidthOf(shape)}
      strokeOpacity={shape.kind === 'highlighter' ? scribbleStroke.highlighterOpacity : 1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

interface TextDraft {
  point: ScribblePoint;
  value: string;
}

/**
 * Props for {@link Scribble}.
 */
export interface ScribbleProps {
  /** Whether drawing is on. Leave out to let Scribble manage it. */
  open?: boolean;
  /** Whether drawing starts on, when Scribble manages it. @default false */
  defaultOpen?: boolean;
  /** Called when drawing is turned on or off (the launcher, Done, or Escape). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Fill the nearest positioned parent instead of the whole screen. Give
   * the parent `position: relative`. @default false
   */
  inline?: boolean;
  /** The inks offered. @default SCRIBBLE_INKS */
  inks?: readonly { name: string; color: string }[];
  /** The line widths offered, in px. @default SCRIBBLE_WIDTHS */
  widths?: readonly { name: string; value: number }[];
  /** @default 'pen' */
  defaultTool?: ScribbleTool;
  /** Start with the hand-drawn look. @default true */
  defaultSketchy?: boolean;
  /** Keep the drawing in localStorage under this key, so it survives a reload. */
  storageKey?: string;
  /** Keep the drawing on screen after drawing is turned off. @default true */
  keepVisible?: boolean;
  /** Show a floating button that turns drawing on. @default true */
  showLauncher?: boolean;
  /** Fill behind saved pictures, or `null` for see-through. @default null */
  exportBackground?: string | null;
  /** Name of saved files, without the extension. @default 'scribble' */
  fileName?: string;
  /** Called whenever the drawing changes. */
  onChange?: (shapes: readonly ScribbleShape[]) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Scribble: draw right on the screen, like a quick whiteboard over your page.
 *
 * - Pen, highlighter, line, arrow, rectangle, ellipse, text notes, and an eraser
 * - Inks, line widths, and a hand-drawn look that stays the same every time
 * - Undo and redo, clear, and saving as PNG or SVG
 * - Keyboard shortcuts: P, H, L, A, R, O, T, K, E for tools; Ctrl+Z and
 *   Ctrl+Shift+Z (or Ctrl+Y) to undo and redo; Escape to stop drawing
 *
 * While drawing is off the page works as usual and the drawing stays on
 * top without catching any clicks. Nothing leaves the device.
 *
 * @example
 * ```tsx
 * // A launcher button in the corner; draw over the whole page.
 * <Scribble storageKey="page-notes" />
 *
 * // Draw inside one panel only.
 * <div style={{ position: 'relative', height: 400 }}>
 *   <Scribble inline defaultOpen showLauncher={false} />
 * </div>
 * ```
 */
export const Scribble = ({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  inline = false,
  inks = SCRIBBLE_INKS,
  widths = SCRIBBLE_WIDTHS,
  defaultTool = 'pen',
  defaultSketchy = true,
  storageKey,
  keepVisible = true,
  showLauncher = true,
  exportBackground = null,
  fileName = 'scribble',
  onChange,
  className = '',
  style,
}: ScribbleProps) => {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isOpen = openProp ?? innerOpen;
  const [tool, setTool] = useState<ScribbleTool>(defaultTool);
  const [inkIndex, setInkIndex] = useState(0);
  const [widthIndex, setWidthIndex] = useState(Math.min(1, widths.length - 1));
  const [sketchy, setSketchy] = useState(defaultSketchy);
  const [textDraft, setTextDraftState] = useState<TextDraft | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointerRef = useRef<number | null>(null);
  // The note being typed, read synchronously so it is never placed twice.
  const textRef = useRef<TextDraft | null>(null);
  const scribble = useScribble({ storageKey });
  const trail = useFadingTrail({ maxPoints: scribbleTrail.maxPoints });
  // Where the eraser is, for its round cursor.
  const [hover, setHover] = useState<ScribblePoint | null>(null);
  const { announce } = useAriaAnnounce();
  const onChangeRef = useLatest(onChange);

  const styleNow: ScribbleStyle = {
    color: inks[inkIndex]?.color ?? SCRIBBLE_INKS[0].color,
    width: widths[widthIndex]?.value ?? SCRIBBLE_WIDTHS[0].value,
    sketchy,
  };

  const setTextDraft = (draft: TextDraft | null) => {
    textRef.current = draft;
    setTextDraftState(draft);
  };

  const commitText = () => {
    const draft = textRef.current;
    textRef.current = null;
    setTextDraftState(null);
    if (draft && draft.value.trim() !== '') scribble.addText(draft.point, draft.value, styleNow);
  };

  // Read the latest versions inside effects that only run when drawing turns on or off.
  const commitTextRef = useLatest(commitText);
  const cancelRef = useLatest(() => {
    scribble.cancel();
    scribble.cancelErasing();
    trail.clear();
  });

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange]
  );

  useEffect(() => {
    onChangeRef.current?.(scribble.shapes);
  }, [scribble.shapes, onChangeRef]);

  // Turning drawing off keeps any note being typed and drops a half-drawn shape.
  useEffect(() => {
    if (isOpen) {
      announce('Drawing on. Press Escape to stop.');
      return;
    }
    commitTextRef.current();
    cancelRef.current();
    pointerRef.current = null;
  }, [isOpen, announce, commitTextRef, cancelRef]);

  const toPoint = (event: { clientX: number; clientY: number }): ScribblePoint => {
    const box = svgRef.current?.getBoundingClientRect();
    return { x: event.clientX - (box?.left ?? 0), y: event.clientY - (box?.top ?? 0) };
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!isOpen || event.button > 0) return;
    event.preventDefault();
    const point = toPoint(event);
    if (textRef.current) commitText();
    if (tool === 'text') {
      setTextDraft({ point, value: '' });
      return;
    }
    try {
      // Keep receiving the stroke even if the pointer leaves the drawing area.
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone; the stroke still works while it stays inside.
    }
    pointerRef.current = event.pointerId;
    if (tool === 'laser') {
      trail.add(point, scribbleTrail.laser.fadeMs, true);
    } else if (tool === 'eraser') {
      scribble.startErasing();
      scribble.eraseAt(point);
      trail.add(point, scribbleTrail.eraser.fadeMs, true);
    } else {
      scribble.begin(tool, point, styleNow);
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (isOpen && tool === 'eraser') setHover(toPoint(event));
    if (pointerRef.current !== event.pointerId) return;
    // Every point the pointer passed through, not just one per frame, for smooth lines.
    const native = event.nativeEvent as PointerEvent;
    const samples = typeof native.getCoalescedEvents === 'function' ? native.getCoalescedEvents() : [];
    for (const sample of samples.length > 0 ? samples : [native]) {
      const point = toPoint(sample);
      if (tool === 'laser') {
        trail.add(point, scribbleTrail.laser.fadeMs);
      } else if (tool === 'eraser') {
        scribble.eraseAt(point);
        trail.add(point, scribbleTrail.eraser.fadeMs);
      } else {
        scribble.extend(point);
      }
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Already released.
    }
    const cancelled = event.type === 'pointercancel';
    if (tool === 'laser') return; // The trail fades on its own.
    if (tool === 'eraser') {
      if (cancelled) scribble.cancelErasing();
      else scribble.stopErasing();
    } else if (cancelled) {
      scribble.cancel();
    } else {
      scribble.finish();
    }
  };

  const save = async (format: ScribbleFormat) => {
    if (!svgRef.current) return;
    try {
      setSaveError(null);
      await exportScribble(svgRef.current, format, { fileName, background: exportBackground });
      announce(`Saved as ${format.toUpperCase()}.`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'The drawing could not be saved.');
    }
  };

  const clear = () => {
    scribble.clear();
    announce('Drawing cleared. Undo brings it back.');
  };

  // Keyboard shortcuts, only while drawing and never while typing.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (textRef.current) return; // The note field handles its own Escape.
        if (pointerRef.current !== null) {
          // Escape mid-stroke drops the shape, or keeps everything the eraser touched.
          scribble.cancel();
          scribble.cancelErasing();
          pointerRef.current = null;
          return;
        }
        setOpen(false);
        return;
      }
      if (isTyping(event.target)) return;
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (command && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) scribble.redo();
        else scribble.undo();
        return;
      }
      if (command && key === 'y') {
        event.preventDefault();
        scribble.redo();
        return;
      }
      if (command || event.altKey) return;
      const match = SCRIBBLE_TOOLS.find((name) => SCRIBBLE_TOOL_INFO[name].key === key);
      if (match) setTool(match);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, scribble, setOpen]);

  const position = inline ? 'absolute' : 'fixed';
  const showDrawing = isOpen || (keepVisible && scribble.shapes.length > 0);
  // The eraser draws its own round cursor.
  const cursor = tool === 'text' ? 'text' : tool === 'eraser' ? 'none' : 'crosshair';
  const trailStyle = tool === 'eraser' ? scribbleTrail.eraser : scribbleTrail.laser;
  const shapeCount = scribble.shapes.length;

  return (
    <div className={`${CLASS.root} ${className}`.trim()} style={{ position, inset: 0, zIndex: zLayers.annotation, pointerEvents: 'none', ...style }}>
      <style>{scribbleStyles}</style>

      {showDrawing && (
        <svg
          ref={svgRef}
          role="img"
          aria-label={shapeCount === 0 ? 'Empty drawing' : `Drawing with ${shapeCount} ${shapeCount === 1 ? 'mark' : 'marks'}`}
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            pointerEvents: isOpen ? 'auto' : 'none',
            cursor: isOpen ? cursor : undefined,
            touchAction: isOpen ? 'none' : undefined,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={() => setHover(null)}
        >
          {scribble.shapes.map((shape) =>
            scribble.pendingErase.has(shape.id) ? (
              <g key={shape.id} opacity={scribbleTrail.eraser.previewOpacity}>
                <ShapeView shape={shape} />
              </g>
            ) : (
              <ShapeView key={shape.id} shape={shape} />
            )
          )}
          {scribble.draft && <ShapeView shape={scribble.draft} />}
          <g {...{ [SCRIBBLE_TRANSIENT_ATTRIBUTE]: '' }} pointerEvents="none">
            {trail.points.length > 1 && tool === 'laser' && (
              <>
                <TrailView points={trail.points} color={scribbleTrail.laser.color} width={scribbleTrail.laser.width} glow={scribbleTrail.laser.glow} />
                <TrailView points={trail.points} color={scribbleTrail.laser.core} width={scribbleTrail.laser.width / 3} />
              </>
            )}
            {trail.points.length > 1 && tool !== 'laser' && <TrailView points={trail.points} color={trailStyle.color} width={trailStyle.width} />}
            {isOpen && tool === 'eraser' && hover && (
              <circle
                cx={hover.x}
                cy={hover.y}
                r={scribbleStroke.eraserReach}
                fill="none"
                stroke={scribbleTrail.eraser.color}
                strokeWidth={scribbleTrail.eraser.cursorStroke}
              />
            )}
          </g>
        </svg>
      )}

      {isOpen && textDraft && (
        <input
          aria-label="Note text. Press Enter to place it, Escape to cancel."
          autoFocus
          value={textDraft.value}
          maxLength={SCRIBBLE_TEXT_LIMIT}
          onChange={(event) => setTextDraft({ ...textDraft, value: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitText();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              setTextDraft(null);
            }
          }}
          onBlur={commitText}
          style={{
            position: 'absolute',
            left: textDraft.point.x,
            top: textDraft.point.y,
            minWidth: chrome.buttonSize,
            padding: 0,
            border: 0,
            outline: `${chrome.divider} dashed ${chrome.active}`,
            background: 'transparent',
            color: styleNow.color,
            font: `${textSizeOf(styleNow)}px ${chrome.font}`,
            lineHeight: TEXT_LINE_HEIGHT,
            pointerEvents: 'auto',
          }}
        />
      )}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: chrome.inset,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'max-content',
            maxWidth: `calc(100% - 2 * ${chrome.inset})`,
            pointerEvents: 'auto',
          }}
        >
          <div role="toolbar" aria-label="Drawing tools" className={CLASS.toolbar}>
            {SCRIBBLE_TOOLS.map((name) => {
              const info = SCRIBBLE_TOOL_INFO[name];
              return (
                <button
                  key={name}
                  type="button"
                  className={CLASS.button}
                  aria-pressed={tool === name}
                  aria-label={info.name}
                  aria-keyshortcuts={info.key.toUpperCase()}
                  title={`${info.name} (${info.key.toUpperCase()})`}
                  onClick={() => setTool(name)}
                >
                  <Icon path={info.icon} />
                </button>
              );
            })}

            <span aria-hidden="true" className={CLASS.divider} />

            <div role="group" aria-label="Ink" style={{ display: 'flex', gap: chrome.gap }}>
              {inks.map((ink, index) => (
                <button
                  key={ink.name}
                  type="button"
                  className={CLASS.button}
                  aria-pressed={inkIndex === index}
                  aria-label={`${ink.name} ink`}
                  title={ink.name}
                  onClick={() => setInkIndex(index)}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: chrome.swatchSize,
                      height: chrome.swatchSize,
                      borderRadius: '50%',
                      background: ink.color,
                      border: `${chrome.divider} solid ${chrome.panelBorder}`,
                    }}
                  />
                </button>
              ))}
            </div>

            <span aria-hidden="true" className={CLASS.divider} />

            <div role="group" aria-label="Line width" style={{ display: 'flex', gap: chrome.gap }}>
              {widths.map((width, index) => (
                <button
                  key={width.name}
                  type="button"
                  className={CLASS.button}
                  aria-pressed={widthIndex === index}
                  aria-label={`${width.name} line`}
                  title={width.name}
                  onClick={() => setWidthIndex(index)}
                >
                  <Icon path={ICONS.width} strokeWidth={Math.min(width.value, ICON_GRID / 3)} />
                </button>
              ))}
            </div>

            <button
              type="button"
              className={CLASS.button}
              aria-pressed={sketchy}
              aria-label="Hand-drawn look"
              title="Hand-drawn look"
              onClick={() => setSketchy((on) => !on)}
            >
              <Icon path={ICONS.sketchy} />
            </button>

            <span aria-hidden="true" className={CLASS.divider} />

            <button type="button" className={CLASS.button} aria-label="Undo" aria-keyshortcuts="Control+Z" title="Undo (Ctrl+Z)" disabled={!scribble.canUndo} onClick={scribble.undo}>
              <Icon path={ICONS.undo} />
            </button>
            <button type="button" className={CLASS.button} aria-label="Redo" aria-keyshortcuts="Control+Shift+Z" title="Redo (Ctrl+Shift+Z)" disabled={!scribble.canRedo} onClick={scribble.redo}>
              <Icon path={ICONS.redo} />
            </button>
            <button type="button" className={CLASS.button} aria-label="Clear the drawing" title="Clear" disabled={shapeCount === 0} onClick={clear}>
              <Icon path={ICONS.clear} />
            </button>
            <button type="button" className={CLASS.button} aria-label="Save as PNG" title="Save as PNG" disabled={shapeCount === 0} onClick={() => void save('png')}>
              <Icon path={ICONS.save} />
              PNG
            </button>
            <button type="button" className={CLASS.button} aria-label="Save as SVG" title="Save as SVG" disabled={shapeCount === 0} onClick={() => void save('svg')}>
              <Icon path={ICONS.save} />
              SVG
            </button>

            <span aria-hidden="true" className={CLASS.divider} />

            <button type="button" className={CLASS.button} aria-label="Stop drawing" aria-keyshortcuts="Escape" title="Done (Esc)" onClick={() => setOpen(false)}>
              <Icon path={ICONS.close} />
            </button>
          </div>
          {saveError && (
            <p role="alert" style={{ margin: `${chrome.gap} 0 0`, textAlign: 'center', color: chrome.danger, font: `${chrome.fontSize} ${chrome.font}` }}>
              {saveError}
            </p>
          )}
        </div>
      )}

      {!isOpen && showLauncher && (
        <button
          type="button"
          className={CLASS.launcher}
          aria-label="Start drawing on the screen"
          title="Scribble"
          onClick={() => setOpen(true)}
          style={{ position: 'absolute', right: chrome.inset, bottom: chrome.inset, pointerEvents: 'auto' }}
        >
          <Icon path={SCRIBBLE_TOOL_INFO.pen.icon} />
          Scribble
        </button>
      )}
    </div>
  );
};
