/**
 * Small building blocks for rite panels: sections, stats, logs, choices,
 * fields, sliders, and empty states. Rites compose these so every panel
 * looks and behaves the same.
 * @module components/grimoire/RiteParts
 */

import { createContext, useContext, useId, type CSSProperties, type ReactNode } from 'react';
import { withAlpha } from '../../tokens/colors';
import { ACCENT_STRENGTH, RITE_CLASS, RITE_VARS, riteTokens, riteTones, type RiteTone } from './tokens';

const { space, radius, font, line } = riteTokens;
const surface = riteTokens.surface;

/** Headings never go deeper than this. */
const MAX_HEADING_LEVEL = 6;

/** Rows a multi-line field shows by default. */
const DEFAULT_ROWS = 3;

/** The rite's accent, with a fallback for parts used outside a `RiteShell`. */
const ACCENT = `var(${RITE_VARS.accent}, ${surface.focus})`;

/**
 * The heading level of the nearest rite or section, so nested sections pick
 * the next level and the page outline stays correct. `RiteShell` sets it.
 */
export const RiteHeadingContext = createContext(2);

/** The heading level of the nearest rite or section. */
export const useRiteHeadingLevel = (): number => useContext(RiteHeadingContext);

const smallCaps: CSSProperties = {
  margin: 0,
  fontFamily: font.mono,
  fontSize: font.tiny,
  fontWeight: font.weight.normal,
  letterSpacing: font.tracking,
  textTransform: 'uppercase',
  color: surface.muted,
};

/**
 * Props for {@link RiteSection}.
 */
export interface RiteSectionProps {
  /** The section's name, shown as a small heading. */
  title: string;
  /** Buttons shown at the end of the heading row. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * A titled part of a rite panel. Its heading is one level below the rite's,
 * so screen reader users can jump between sections.
 *
 * @example
 * ```tsx
 * <RiteSection title="Box"><BoxModelDiagram {...} /></RiteSection>
 * ```
 */
export const RiteSection = ({ title, actions, children, className, style }: RiteSectionProps) => {
  const id = useId();
  const level = Math.min(MAX_HEADING_LEVEL, useRiteHeadingLevel() + 1);
  const Heading = `h${level}` as 'h3';
  return (
    <section aria-labelledby={id} className={className} style={{ display: 'grid', gap: space.sm, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
        <Heading id={id} style={smallCaps}>
          {title}
        </Heading>
        {actions && <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.xs }}>{actions}</div>}
      </div>
      <RiteHeadingContext.Provider value={level}>{children}</RiteHeadingContext.Provider>
    </section>
  );
};

/**
 * Props for {@link RiteStat}.
 */
export interface RiteStatProps {
  /** What is measured, such as "Largest paint". */
  label: string;
  /** The value, such as "1.2 s". */
  value: ReactNode;
  /** A few words on what it means, such as "Good". Always give one when `tone` is set. */
  hint?: string;
  /** How the value is judged. @default 'neutral' */
  tone?: RiteTone;
}

/**
 * One measured value, large and easy to scan, with a short verdict.
 *
 * @example
 * ```tsx
 * <RiteStat label="Largest paint" value="1.2 s" hint="Good" tone="good" />
 * ```
 */
export const RiteStat = ({ label, value, hint, tone = 'neutral' }: RiteStatProps) => (
  <div
    style={{
      display: 'grid',
      alignContent: 'start',
      gap: space.xs,
      minWidth: 0,
      padding: space.md,
      background: surface.raised,
      border: `${line.hairline} solid ${surface.border}`,
      borderRadius: radius.md,
    }}
  >
    <span style={smallCaps}>{label}</span>
    <strong
      style={{
        fontFamily: font.mono,
        fontSize: font.large,
        fontWeight: font.weight.bold,
        color: riteTones[tone],
        overflowWrap: 'anywhere',
      }}
    >
      {value}
    </strong>
    {hint && <span style={{ fontSize: font.small, color: tone === 'neutral' ? surface.muted : riteTones[tone] }}>{hint}</span>}
  </div>
);

/** A grid that fits as many stats per row as there is room for. */
export const RiteStatGrid = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${riteTokens.size.statMinWidth}, 1fr))`,
      gap: space.sm,
    }}
  >
    {children}
  </div>
);

/**
 * Props for {@link RiteEmpty}.
 */
export interface RiteEmptyProps {
  /** What to do to see something here. */
  children: ReactNode;
  /** A button that gets things started. */
  action?: ReactNode;
}

/** A quiet placeholder that says what to do next. */
export const RiteEmpty = ({ children, action }: RiteEmptyProps) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space.md,
      padding: space.lg,
      border: `${line.hairline} dashed ${surface.border}`,
      borderRadius: radius.md,
      color: surface.muted,
      fontSize: font.small,
    }}
  >
    <span>{children}</span>
    {action}
  </div>
);

/**
 * One line in a {@link RiteLog}.
 */
export interface RiteLogEntry {
  /** Stable key. */
  id: string | number;
  /** What happened. */
  text: ReactNode;
  /** More detail, shown smaller below. */
  detail?: ReactNode;
  /** When it happened, already formatted, such as "12:04:31". */
  time?: string;
  /** How it is judged. @default 'neutral' */
  tone?: RiteTone;
}

/**
 * Props for {@link RiteLog}.
 */
export interface RiteLogProps {
  /** What the log records, for screen readers. */
  label: string;
  /** Entries in the order to show them (put the newest first). */
  entries: readonly RiteLogEntry[];
  /** Shown when there are no entries. */
  empty?: ReactNode;
  /**
   * Read new entries aloud as they arrive. Leave off for fast, noisy logs,
   * and announce summaries instead. @default false
   */
  live?: boolean;
}

/**
 * A scrolling list of events: page changes, messages, measurements. It can be
 * scrolled with the keyboard, and only reads entries aloud when `live` is on.
 *
 * @example
 * ```tsx
 * <RiteLog label="Page changes" entries={changes} empty="Nothing has changed yet." />
 * ```
 */
export const RiteLog = ({ label, entries, empty, live = false }: RiteLogProps) => {
  if (entries.length === 0 && empty !== undefined) return <RiteEmpty>{empty}</RiteEmpty>;
  return (
    <ol
      role="log"
      aria-label={label}
      aria-live={live ? 'polite' : 'off'}
      tabIndex={0}
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        maxHeight: riteTokens.size.logMaxHeight,
        overflowY: 'auto',
        background: surface.page,
        border: `${line.hairline} solid ${surface.border}`,
        borderRadius: radius.md,
      }}
    >
      {entries.map((entry) => (
        <li
          key={entry.id}
          style={{
            display: 'grid',
            gridTemplateColumns: entry.time ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)',
            gap: space.sm,
            padding: `${space.xs} ${space.sm}`,
            borderBottom: `${line.hairline} solid ${surface.border}`,
            fontSize: font.small,
          }}
        >
          {entry.time && <span style={{ fontFamily: font.mono, color: surface.muted }}>{entry.time}</span>}
          <span style={{ color: riteTones[entry.tone ?? 'neutral'], overflowWrap: 'anywhere' }}>
            {entry.text}
            {entry.detail !== undefined && <span style={{ display: 'block', color: surface.muted }}>{entry.detail}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
};

/**
 * One choice in a {@link RiteSegmented}.
 */
export interface RiteSegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Props for {@link RiteSegmented}.
 */
export interface RiteSegmentedProps<T extends string> {
  /** What is being chosen, for screen readers. */
  label: string;
  value: T;
  options: readonly RiteSegmentedOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * A row of toggle buttons where one is pressed, such as a speed or a style.
 *
 * @example
 * ```tsx
 * <RiteSegmented label="Speed" value={speed} onChange={setSpeed} options={[{ value: '1', label: '1×' }]} />
 * ```
 */
export const RiteSegmented = <T extends string>({ label, value, options, onChange, disabled = false }: RiteSegmentedProps<T>) => (
  <div role="group" aria-label={label} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: space.xs }}>
    {options.map((option) => {
      const pressed = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={pressed}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={RITE_CLASS.field}
          style={{
            padding: `${space.xs} ${space.md}`,
            borderRadius: radius.sm,
            border: `${line.hairline} solid ${pressed ? ACCENT : surface.border}`,
            background: pressed ? withAlpha(ACCENT, ACCENT_STRENGTH.soft) : surface.raised,
            color: surface.text,
            fontFamily: font.body,
            fontSize: font.small,
            fontWeight: pressed ? font.weight.bold : font.weight.normal,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const fieldStyle = (invalid: boolean): CSSProperties => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: `${space.sm} ${space.md}`,
  background: surface.page,
  color: surface.text,
  border: `${line.hairline} solid ${invalid ? riteTones.bad : surface.border}`,
  borderRadius: radius.md,
  fontFamily: font.body,
  fontSize: font.base,
  lineHeight: font.lineHeight,
});

/**
 * Props for {@link RiteInput}.
 */
export interface RiteInputProps {
  /** The visible label. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** @default 'text' */
  type?: 'text' | 'search' | 'password' | 'url' | 'number';
  placeholder?: string;
  /** A short tip shown below the field. */
  hint?: string;
  /** What is wrong with the value, shown in red below the field. */
  error?: string | null;
  /** A multi-line field. @default false */
  multiline?: boolean;
  /** Visible rows of a multi-line field. @default 3 */
  rows?: number;
  disabled?: boolean;
  /** Passed to the browser; turn off for secrets. */
  autoComplete?: string;
  /** Called when Enter is pressed in a single-line field. */
  onEnter?: () => void;
}

/**
 * A labelled text field with an optional tip and error, wired up so screen
 * readers hear all three.
 *
 * @example
 * ```tsx
 * <RiteInput label="Find" type="search" value={query} onChange={setQuery} hint="Case does not matter." />
 * ```
 */
export const RiteInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  error,
  multiline = false,
  rows = DEFAULT_ROWS,
  disabled,
  autoComplete,
  onEnter,
}: RiteInputProps) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  const shared = {
    id,
    value,
    placeholder,
    disabled,
    autoComplete,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: RITE_CLASS.field,
    style: fieldStyle(Boolean(error)),
  };

  return (
    <div style={{ display: 'grid', gap: space.xs, minWidth: 0 }}>
      <label htmlFor={id} style={{ fontSize: font.small, color: surface.muted }}>
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} rows={rows} onChange={(event) => onChange(event.target.value)} style={{ ...shared.style, resize: 'vertical' }} />
      ) : (
        <input
          {...shared}
          type={type}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && onEnter) {
              event.preventDefault();
              onEnter();
            }
          }}
        />
      )}
      {hint && (
        <span id={hintId} style={{ fontSize: font.small, color: surface.muted }}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} style={{ fontSize: font.small, color: riteTones.bad }}>
          {error}
        </span>
      )}
    </div>
  );
};

/**
 * Props for {@link RiteSlider}.
 */
export interface RiteSliderProps {
  /** The visible label. */
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Turns the value into text for display and screen readers. @default String */
  format?: (value: number) => string;
  disabled?: boolean;
}

/**
 * A labelled range control that shows and speaks its value. Works with the
 * arrow keys, Page Up and Down, Home, and End.
 *
 * @example
 * ```tsx
 * <RiteSlider label="Speed" value={rate} min={0.1} max={2} step={0.1} onChange={setRate} format={(v) => `${v}×`} />
 * ```
 */
export const RiteSlider = ({ label, value, min, max, step, onChange, format = String, disabled }: RiteSliderProps) => {
  const id = useId();
  const text = format(value);
  return (
    <div style={{ display: 'grid', gap: space.xs, minWidth: 0 }}>
      <label htmlFor={id} style={{ display: 'flex', justifyContent: 'space-between', gap: space.sm, fontSize: font.small, color: surface.muted }}>
        <span>{label}</span>
        <output htmlFor={id} style={{ fontFamily: font.mono, color: surface.text }}>
          {text}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={text}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: '100%', accentColor: ACCENT }}
      />
    </div>
  );
};
