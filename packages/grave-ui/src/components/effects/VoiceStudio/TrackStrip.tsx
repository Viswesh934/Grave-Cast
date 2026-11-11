/**
 * TrackStrip - Everything that shapes one studio track.
 * @module components/effects/VoiceStudio/TrackStrip
 */

import { useEffect, useId, useRef, useState, type CSSProperties, type Dispatch } from 'react';
import { SCALE_NAMES } from '../../../audio/music/scales';
import { parseAbsoluteNote } from '../../../audio/music/theory';
import { parseLyrics } from '../../../studio/lyrics/lyrics';
import { MELODY_STYLES, type MelodyStyle } from '../../../studio/lyrics/melody';
import {
  EFFECT_RANGES,
  STUDIO_LIMITS,
  type LyricsSettings,
  type StudioAction,
  type StudioTake,
  type StudioTrack,
  type StudioTrackPatch,
} from '../../../studio/project';
import { PERSONAS, VOICE_PERSONAS, type VoicePersona } from '../../../voice/personas';
import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { visuallyHidden } from '../Ascii/tokens';
import { formatClock, formatPan, formatSemitones } from './format';
import { StudioSlider } from './StudioSlider';
import { EFFECT_CONTROLS, fieldStyle, labelStyle, studioBorder, studioTokens } from './tokens';

/** How finely the volume, pan, and note-length sliders move. */
const FINE_STEP = 0.01;

/** How finely start beats can be typed: a sixteenth note. */
const BEAT_STEP = 0.25;

/** Labels for each delivery style. */
const STYLE_LABELS: Record<MelodyStyle, string> = { sing: 'Sing', chant: 'Chant', talk: 'Talk' };

/** A grid that fits as many controls per row as there is room for. */
const controlGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${studioTokens.layout.controlMin}, 1fr))`,
  gap: studioTokens.space.md,
};

const helpText: CSSProperties = {
  margin: 0,
  marginTop: studioTokens.space.xs,
  fontSize: studioTokens.font.small,
  color: studioTokens.colors.muted,
};

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: studioTokens.space.sm };

/** Capitalizes a typed note so "c3" and "C3" both count. */
const normalizeNote = (text: string): string => text.trim().charAt(0).toUpperCase() + text.trim().slice(1);

/** Reads a typed start beat, or `null` if it is not a usable number. */
const readBeat = (text: string): number | null => {
  const beat = Number(text);
  return text.trim() !== '' && Number.isFinite(beat) && beat >= 0 ? beat : null;
};

/**
 * Props for {@link TrackStrip}.
 */
export interface TrackStripProps {
  track: StudioTrack;
  takes: Readonly<Record<string, StudioTake>>;
  dispatch: Dispatch<StudioAction>;
  /** `true` while this track is being recorded onto. */
  recording: boolean;
  /** Why recording is not possible right now, or `null` if it is. */
  recordBlocked: string | null;
  onRecord: () => void;
  onStopRecording: () => void;
  /** Called with an audio file the user picked. */
  onAddAudio: (file: File) => void;
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  hint?: string;
  placeholder?: string;
  type?: 'text' | 'number';
  min?: number;
  step?: number;
}

/** A text or number field with its label and an optional hint. */
const TextField = ({ label, value, onChange, invalid = false, hint, placeholder, type = 'text', min, step }: TextFieldProps) => {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => onChange(event.target.value)}
        style={{ ...fieldStyle, width: '100%', borderColor: invalid ? studioTokens.colors.error : studioTokens.colors.border }}
      />
      {hint && <p id={hintId} style={helpText}>{hint}</p>}
    </div>
  );
};

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** A select with its label. */
const SelectField = <T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as T)} style={{ ...fieldStyle, width: '100%' }}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

const LyricsPanel = ({ track, dispatch }: Pick<TrackStripProps, 'track' | 'dispatch'>) => {
  const { lyrics } = track;
  const textId = useId();
  const helpId = `${textId}-help`;
  const patch = (next: Partial<LyricsSettings>, key?: string) => dispatch({ type: 'updateLyrics', trackId: track.id, patch: next, key });

  // Typed fields keep a draft, so half-typed values ("C", "1.") are allowed
  // while only finished, valid values reach the song.
  const [tonicDraft, setTonicDraft] = useState(lyrics.tonic);
  useEffect(() => setTonicDraft(lyrics.tonic), [lyrics.tonic]);
  const tonicValid = parseAbsoluteNote(normalizeNote(tonicDraft)) !== null;

  const [startDraft, setStartDraft] = useState(String(lyrics.startBeat));
  useEffect(() => setStartDraft(String(lyrics.startBeat)), [lyrics.startBeat]);

  const syllableCount = parseLyrics(lyrics.text).length;

  return (
    <div style={{ display: 'grid', gap: studioTokens.space.md }}>
      <div>
        <label htmlFor={textId} style={labelStyle}>Lyrics</label>
        <textarea
          id={textId}
          rows={studioTokens.lyricRows}
          value={lyrics.text}
          maxLength={STUDIO_LIMITS.maxLyricsLength}
          aria-describedby={helpId}
          onChange={(event) => patch({ text: event.target.value }, `${track.id}:text`)}
          style={{ ...fieldStyle, width: '100%', resize: 'vertical' }}
        />
        <p id={helpId} style={helpText}>
          {syllableCount} syllable{syllableCount === 1 ? '' : 's'}. Hyphens split syllables (hal-low). Braces fix a
          word&apos;s sound (queue{'{kyoo}'}). Commas and new lines add rests.
        </p>
      </div>
      <div style={controlGrid}>
        <SelectField
          label="Scale"
          value={lyrics.scale}
          options={SCALE_NAMES.map((name) => ({ value: name, label: name }))}
          onChange={(scale) => patch({ scale })}
        />
        <TextField
          label="Home note"
          value={tonicDraft}
          invalid={!tonicValid}
          hint={tonicValid ? undefined : 'Use a note with an octave, such as C3 or F#2.'}
          onChange={(text) => {
            setTonicDraft(text);
            if (parseAbsoluteNote(normalizeNote(text)) !== null) patch({ tonic: normalizeNote(text) }, `${track.id}:tonic`);
          }}
        />
        <SelectField
          label="Delivery"
          value={lyrics.style}
          options={MELODY_STYLES.map((style) => ({ value: style, label: STYLE_LABELS[style] }))}
          onChange={(style) => patch({ style })}
        />
        <TextField
          label="Starts at beat"
          type="number"
          min={0}
          step={BEAT_STEP}
          value={startDraft}
          onChange={(text) => {
            setStartDraft(text);
            const beat = readBeat(text);
            if (beat !== null) patch({ startBeat: beat }, `${track.id}:start`);
          }}
        />
        <StudioSlider
          label="Note length"
          value={lyrics.stretch}
          min={STUDIO_LIMITS.minStretch}
          max={STUDIO_LIMITS.maxStretch}
          step={FINE_STEP}
          unit="×"
          onChange={(stretch) => patch({ stretch }, `${track.id}:stretch`)}
        />
      </div>
      <div style={{ ...row, alignItems: 'flex-end', gap: studioTokens.space.md }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextField
            label="Your own tune (optional)"
            value={lyrics.notes}
            placeholder="C3 E3 G3"
            hint="Notes repeat to cover every syllable. Leave empty for a made-up tune."
            onChange={(notes) => patch({ notes }, `${track.id}:notes`)}
          />
        </div>
        <Button size="sm" variant="secondary" disabled={lyrics.notes.trim() !== ''} onClick={() => patch({ seed: lyrics.seed + 1 })}>
          New tune
        </Button>
      </div>
    </div>
  );
};

/** A start-beat field for one clip, with a draft so it can be typed freely. */
const ClipStartField = ({ value, onCommit }: { value: number; onCommit: (beat: number) => void }) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <TextField
      label="Starts at beat"
      type="number"
      min={0}
      step={BEAT_STEP}
      value={draft}
      onChange={(text) => {
        setDraft(text);
        const beat = readBeat(text);
        if (beat !== null) onCommit(beat);
      }}
    />
  );
};

const VoicePanel = ({ track, takes, dispatch, recording, recordBlocked, onRecord, onStopRecording, onAddAudio }: TrackStripProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const recordHelpId = useId();

  return (
    <div style={{ display: 'grid', gap: studioTokens.space.md }}>
      <div style={row}>
        {recording ? (
          <Button size="sm" variant="danger" onClick={onStopRecording}>Stop recording</Button>
        ) : (
          <Button
            size="sm"
            variant="gothic"
            disabled={recordBlocked !== null}
            aria-describedby={recordBlocked ? recordHelpId : undefined}
            onClick={onRecord}
          >
            Record
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>Add audio file</Button>
        <label htmlFor={fileId} style={visuallyHidden}>Add audio file to {track.name}</label>
        <input
          id={fileId}
          ref={fileRef}
          type="file"
          accept="audio/*"
          tabIndex={-1}
          style={visuallyHidden}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onAddAudio(file);
            event.target.value = '';
          }}
        />
        {recordBlocked && !recording && (
          <span id={recordHelpId} style={{ fontSize: studioTokens.font.small, color: studioTokens.colors.muted }}>{recordBlocked}</span>
        )}
      </div>

      {track.clips.length === 0 ? (
        <p style={{ ...helpText, marginTop: 0 }}>No recordings yet. Record at the playhead, or add a file.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: studioTokens.space.sm }}>
          {track.clips.map((clip) => {
            const take = takes[clip.takeId];
            const name = take?.name ?? 'Missing recording';
            return (
              <li key={clip.id} style={{ ...row, alignItems: 'flex-end' }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: studioTokens.font.base, color: studioTokens.colors.text }}>
                  {name}
                  {take && (
                    <span style={{ marginLeft: studioTokens.space.sm, fontFamily: studioTokens.font.mono, color: studioTokens.colors.muted }}>
                      {formatClock(take.durationSeconds)}
                    </span>
                  )}
                </span>
                <div style={{ width: studioTokens.layout.numberField }}>
                  <ClipStartField
                    value={clip.startBeat}
                    onCommit={(beat) =>
                      dispatch({ type: 'moveClip', trackId: track.id, clipId: clip.id, startBeat: beat, key: `${clip.id}:move` })
                    }
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Remove ${name}`}
                  onClick={() => dispatch({ type: 'removeClip', trackId: track.id, clipId: clip.id })}
                >
                  Remove
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/**
 * The controls for one track: name, mute and solo, volume, pan, pitch, a
 * voice preset with every knob, and either a lyrics editor or the track's
 * recordings.
 */
export const TrackStrip = (props: TrackStripProps) => {
  const { track, dispatch } = props;
  const update = (patch: StudioTrackPatch, key?: string) => dispatch({ type: 'updateTrack', trackId: track.id, patch, key });
  const isLyrics = track.kind === 'lyrics';
  const color = isLyrics ? studioTokens.colors.lyrics : studioTokens.colors.voice;

  return (
    <section
      aria-label={`${track.name}, ${isLyrics ? 'lyrics' : 'voice'} track`}
      style={{
        display: 'grid',
        gap: studioTokens.space.md,
        padding: studioTokens.space.lg,
        background: studioTokens.colors.raised,
        border: studioBorder,
        borderLeft: `${studioTokens.layout.accentBar} solid ${color}`,
        borderRadius: studioTokens.radius,
      }}
    >
      <div style={row}>
        <input
          aria-label="Track name"
          value={track.name}
          maxLength={STUDIO_LIMITS.maxNameLength}
          onChange={(event) => update({ name: event.target.value }, `${track.id}:name`)}
          style={{ ...fieldStyle, flex: 1, minWidth: 0 }}
        />
        <Badge size="sm" variant={isLyrics ? 'info' : 'danger'}>{isLyrics ? 'Lyrics' : 'Voice'}</Badge>
        <Button size="sm" variant={track.muted ? 'stone' : 'ghost'} aria-pressed={track.muted} onClick={() => update({ muted: !track.muted })}>
          Mute
        </Button>
        <Button size="sm" variant={track.soloed ? 'gothic' : 'ghost'} aria-pressed={track.soloed} onClick={() => update({ soloed: !track.soloed })}>
          Solo
        </Button>
        <Button size="sm" variant="ghost" aria-label={`Remove ${track.name}`} onClick={() => dispatch({ type: 'removeTrack', trackId: track.id })}>
          Remove
        </Button>
      </div>

      <div style={controlGrid}>
        <StudioSlider
          label="Volume"
          value={track.gain}
          min={0}
          max={STUDIO_LIMITS.maxGain}
          step={FINE_STEP}
          onChange={(gain) => update({ gain }, `${track.id}:gain`)}
        />
        <StudioSlider
          label="Pan"
          value={track.pan}
          min={-1}
          max={1}
          step={FINE_STEP}
          format={formatPan}
          onChange={(pan) => update({ pan }, `${track.id}:pan`)}
        />
        <StudioSlider
          label="Pitch"
          value={track.semitones}
          min={-STUDIO_LIMITS.maxSemitones}
          max={STUDIO_LIMITS.maxSemitones}
          step={1}
          format={formatSemitones}
          onChange={(semitones) => update({ semitones }, `${track.id}:pitch`)}
        />
        <SelectField
          label="Voice"
          value={track.persona}
          options={VOICE_PERSONAS.map((name) => ({ value: name, label: PERSONAS[name].label }))}
          onChange={(persona: VoicePersona) => dispatch({ type: 'setPersona', trackId: track.id, persona })}
        />
      </div>
      <p style={{ ...helpText, marginTop: 0 }}>
        {PERSONAS[track.persona].description}
        {isLyrics ? '' : ' On recordings, raising the pitch also speeds them up.'}
      </p>

      <details>
        <summary style={{ cursor: 'pointer', fontSize: studioTokens.font.base, color: studioTokens.colors.text }}>Voice knobs</summary>
        <div style={{ ...controlGrid, marginTop: studioTokens.space.md }}>
          {EFFECT_CONTROLS.map((control) => {
            const [min, max] = EFFECT_RANGES[control.key];
            return (
              <StudioSlider
                key={control.key}
                label={control.label}
                value={track.effects[control.key]}
                min={min}
                max={max}
                step={control.step}
                unit={control.unit}
                onChange={(value) =>
                  dispatch({ type: 'setEffect', trackId: track.id, effect: control.key, value, key: `${track.id}:${control.key}` })
                }
              />
            );
          })}
        </div>
      </details>

      {isLyrics ? <LyricsPanel track={track} dispatch={dispatch} /> : <VoicePanel {...props} />}
    </section>
  );
};
