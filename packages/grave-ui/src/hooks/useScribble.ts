/**
 * useScribble - A drawing's shapes, the stroke being drawn, and undo history
 * @module hooks/useScribble
 */

import { useCallback, useEffect, useReducer } from 'react';
import {
  eraserHits,
  extendStroke,
  isWorthKeeping,
  newShapeIdentity,
  readScribbleShapes,
  SCRIBBLE_TEXT_LIMIT,
  type ScribblePoint,
  type ScribbleShape,
  type ScribbleShapeKind,
} from '../components/effects/Scribble/geometry';
import { scribbleStroke } from '../components/effects/Scribble/tokens';

/** How a new shape is drawn: everything but where it goes. */
export interface ScribbleStyle {
  color: string;
  /** Line width, in px. */
  width: number;
  /** Draw with a hand-drawn wobble. */
  sketchy: boolean;
}

/**
 * Options for {@link useScribble}.
 */
export interface ScribbleOptions {
  /**
   * Keep the drawing in localStorage under this key, so it is still there
   * after a reload. Leave out to keep it only while the page is open.
   */
  storageKey?: string;
  /** Shapes to start with, when nothing is stored. */
  initialShapes?: readonly ScribbleShape[];
}

/**
 * Return value of {@link useScribble}.
 */
export interface ScribbleReturn {
  /** Everything drawn, oldest first. */
  shapes: readonly ScribbleShape[];
  /** The shape being drawn right now, or `null`. */
  draft: ScribbleShape | null;
  canUndo: boolean;
  canRedo: boolean;
  /** Starts a shape at `point`. */
  begin: (kind: ScribbleShapeKind, point: ScribblePoint, style: ScribbleStyle) => void;
  /** Moves the shape being drawn: adds to a freehand line, or moves the far corner. */
  extend: (point: ScribblePoint) => void;
  /** Keeps the shape being drawn, unless it is too small to see. */
  finish: () => void;
  /** Drops the shape being drawn. */
  cancel: () => void;
  /** Adds a text note with its top left at `point`. Empty text adds nothing. */
  addText: (point: ScribblePoint, text: string, style: ScribbleStyle) => void;
  /** Starts an eraser drag; everything erased until {@link stopErasing} is one undo step. */
  startErasing: () => void;
  /** Removes every shape the eraser touches at `point`. */
  eraseAt: (point: ScribblePoint) => void;
  stopErasing: () => void;
  undo: () => void;
  redo: () => void;
  /** Removes everything. Can be undone. */
  clear: () => void;
  /** Replaces the drawing, such as with one loaded from a file. Can be undone. */
  load: (shapes: readonly ScribbleShape[]) => void;
}

interface State {
  shapes: ScribbleShape[];
  past: ScribbleShape[][];
  future: ScribbleShape[][];
  draft: ScribbleShape | null;
  /** The drawing as it was when the eraser went down, or `null` when not erasing. */
  erasingFrom: ScribbleShape[] | null;
}

type Action =
  | { type: 'begin'; shape: ScribbleShape }
  | { type: 'extend'; point: ScribblePoint }
  | { type: 'finish' }
  | { type: 'cancel' }
  | { type: 'add'; shape: ScribbleShape }
  | { type: 'eraseStart' }
  | { type: 'erase'; point: ScribblePoint }
  | { type: 'eraseStop' }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'replace'; shapes: ScribbleShape[] };

/** Saves the current drawing as an undo step, and forgets anything that could be redone. */
const remember = (state: State): Pick<State, 'past' | 'future'> => ({
  past: [...state.past, state.shapes].slice(-scribbleStroke.maxHistory),
  future: [],
});

const capped = (shapes: ScribbleShape[]) => shapes.slice(-scribbleStroke.maxShapes);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'begin':
      return { ...state, draft: action.shape };
    case 'extend': {
      const draft = state.draft;
      if (!draft) return state;
      const freehand = draft.kind === 'pen' || draft.kind === 'highlighter';
      const points = freehand ? extendStroke(draft.points, action.point) : [draft.points[0], action.point];
      return points === draft.points ? state : { ...state, draft: { ...draft, points } };
    }
    case 'finish': {
      const draft = state.draft;
      if (!draft) return state;
      if (!isWorthKeeping(draft)) return { ...state, draft: null };
      return { ...state, ...remember(state), shapes: capped([...state.shapes, draft]), draft: null };
    }
    case 'cancel':
      return { ...state, draft: null };
    case 'add':
      return isWorthKeeping(action.shape) ? { ...state, ...remember(state), shapes: capped([...state.shapes, action.shape]) } : state;
    case 'eraseStart':
      return state.erasingFrom ? state : { ...state, erasingFrom: state.shapes };
    case 'erase': {
      const kept = state.shapes.filter((shape) => !eraserHits(shape, action.point));
      return kept.length === state.shapes.length ? state : { ...state, shapes: kept };
    }
    case 'eraseStop': {
      const before = state.erasingFrom;
      if (!before) return state;
      // Only an eraser drag that removed something becomes an undo step.
      if (before === state.shapes) return { ...state, erasingFrom: null };
      return { ...state, erasingFrom: null, past: [...state.past, before].slice(-scribbleStroke.maxHistory), future: [] };
    }
    case 'undo': {
      const previous = state.past[state.past.length - 1];
      if (!previous) return state;
      return { ...state, shapes: previous, past: state.past.slice(0, -1), future: [state.shapes, ...state.future], draft: null };
    }
    case 'redo': {
      const next = state.future[0];
      if (!next) return state;
      return { ...state, shapes: next, past: [...state.past, state.shapes], future: state.future.slice(1), draft: null };
    }
    case 'replace':
      return { ...state, ...remember(state), shapes: capped(action.shapes), draft: null };
  }
};

const loadStored = (storageKey: string | undefined): ScribbleShape[] | null => {
  if (!storageKey || typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? readScribbleShapes(JSON.parse(raw)) : null;
  } catch {
    // Unreadable or blocked storage: start with an empty drawing.
    return null;
  }
};

/**
 * Keeps a drawing: its shapes, the one being drawn, and undo and redo.
 * Every finished shape, text note, eraser drag, and clear is one undo step.
 * With `storageKey`, the drawing is saved to localStorage as it changes and
 * read back (and checked) on the next visit.
 *
 * @example
 * ```tsx
 * const scribble = useScribble({ storageKey: 'my-notes' });
 * scribble.begin('pen', { x: 10, y: 10 }, { color: '#fff', width: 4, sketchy: false });
 * scribble.extend({ x: 40, y: 30 });
 * scribble.finish();
 * scribble.undo();
 * ```
 */
export const useScribble = (options: ScribbleOptions = {}): ScribbleReturn => {
  const { storageKey, initialShapes } = options;
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    shapes: loadStored(storageKey) ?? capped([...(initialShapes ?? [])]),
    past: [],
    future: [],
    draft: null,
    erasingFrom: null,
  }));

  useEffect(() => {
    if (!storageKey || typeof localStorage === 'undefined') return;
    try {
      if (state.shapes.length === 0) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify(state.shapes));
    } catch {
      // Storage full or blocked: the drawing still works, it just is not saved.
    }
  }, [storageKey, state.shapes]);

  const begin = useCallback((kind: ScribbleShapeKind, point: ScribblePoint, style: ScribbleStyle) => {
    dispatch({ type: 'begin', shape: { ...newShapeIdentity(), kind, ...style, points: [point] } });
  }, []);

  const addText = useCallback((point: ScribblePoint, text: string, style: ScribbleStyle) => {
    dispatch({ type: 'add', shape: { ...newShapeIdentity(), kind: 'text', ...style, points: [point], text: text.slice(0, SCRIBBLE_TEXT_LIMIT) } });
  }, []);

  return {
    shapes: state.shapes,
    draft: state.draft,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    begin,
    extend: useCallback((point: ScribblePoint) => dispatch({ type: 'extend', point }), []),
    finish: useCallback(() => dispatch({ type: 'finish' }), []),
    cancel: useCallback(() => dispatch({ type: 'cancel' }), []),
    addText,
    startErasing: useCallback(() => dispatch({ type: 'eraseStart' }), []),
    eraseAt: useCallback((point: ScribblePoint) => dispatch({ type: 'erase', point }), []),
    stopErasing: useCallback(() => dispatch({ type: 'eraseStop' }), []),
    undo: useCallback(() => dispatch({ type: 'undo' }), []),
    redo: useCallback(() => dispatch({ type: 'redo' }), []),
    clear: useCallback(() => dispatch({ type: 'replace', shapes: [] }), []),
    load: useCallback((shapes: readonly ScribbleShape[]) => dispatch({ type: 'replace', shapes: readScribbleShapes(shapes) }), []),
  };
};
