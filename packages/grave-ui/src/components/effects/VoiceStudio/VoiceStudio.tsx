/**
 * VoiceStudio - A small recording studio for voices and sung lyrics.
 * @module components/effects/VoiceStudio/VoiceStudio
 */

import { useId, type CSSProperties, type KeyboardEvent } from 'react';
import { useMediaStream } from '../../../hooks/useMediaStream';
import { useStudio } from '../../../hooks/useStudio';
import { STUDIO_LIMITS, type StudioProject } from '../../../studio/project';
import { Button } from '../../primitives/Button';
import { formatClock } from './format';
import { StudioSlider } from './StudioSlider';
import { StudioTimeline } from './Timeline';
import { fieldStyle, studioBorder, studioTokens } from './tokens';
import { TrackStrip } from './TrackStrip';

/** Elements that keep the space bar for themselves. */
const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SUMMARY', 'AUDIO']);

/** Steps for the tempo and latency sliders. */
const BPM_STEP = 1;
const LATENCY_STEP_MS = 5;

/** Turns a 0-1 level into a percentage width. */
const PERCENT = 100;

/** Milliseconds in a second. */
const MS_PER_SECOND = 1000;

const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: studioTokens.space.sm };

const smallText: CSSProperties = { margin: 0, fontSize: studioTokens.font.small, color: studioTokens.colors.muted };

/**
 * Props for {@link VoiceStudio}.
 */
export interface VoiceStudioProps {
  /** The song to start with. @default an empty song */
  initialProject?: StudioProject;
  /** Heading shown at the top. @default 'Voice studio' */
  title?: string;
  /** Additional CSS classes. */
  className?: string;
  /** Inline styles for the studio. */
  style?: CSSProperties;
}

/**
 * A browser recording studio. Type lyrics and the studio sings them to a
 * tune, or record your own voice, then shape every track with pitch, a voice
 * preset, and its knobs, mix them, and export the song as a WAV file.
 *
 * Built on {@link useStudio}; use that hook directly for a custom interface.
 *
 * Privacy: the microphone is only opened when asked, never played through the
 * speakers, and recordings and exports stay in memory. Nothing is uploaded or
 * saved unless the user keeps the export.
 *
 * Keyboard: the space bar plays and pauses (outside text fields and buttons),
 * and the timeline moves the playhead with the arrow keys.
 *
 * @example
 * ```tsx
 * <VoiceStudio title="Night song" />
 * ```
 */
export const VoiceStudio = ({ initialProject, title = 'Voice studio', className = '', style }: VoiceStudioProps) => {
  const mic = useMediaStream({ audio: true });
  const studio = useStudio({ stream: mic.stream, initialProject });
  const { project, dispatch } = studio;
  const headingId = useId();
  const full = project.tracks.length >= STUDIO_LIMITS.maxTracks;
  const recordingTrack = project.tracks.find((track) => track.id === studio.recordingTrackId);

  const recordBlocked = (trackId: string): string | null => {
    if (studio.recordingTrackId && studio.recordingTrackId !== trackId) return 'Another track is recording.';
    if (mic.status !== 'active') return 'Turn the microphone on to record.';
    return null;
  };

  const togglePlay = () => (studio.playing ? studio.pause() : studio.play());

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== ' ' || TYPING_TAGS.has((event.target as HTMLElement).tagName)) return;
    event.preventDefault();
    togglePlay();
  };

  let status = studio.playing ? 'Playing.' : 'Stopped.';
  if (studio.busy === 'decoding') status = 'Reading the recording...';
  if (studio.busy === 'exporting') status = 'Mixing the song...';
  if (recordingTrack) status = `Recording onto ${recordingTrack.name}.`;

  return (
    <section
      aria-labelledby={headingId}
      onKeyDown={onKeyDown}
      className={className}
      style={{
        display: 'grid',
        gap: studioTokens.space.lg,
        padding: studioTokens.space.lg,
        background: studioTokens.colors.panel,
        color: studioTokens.colors.text,
        fontFamily: studioTokens.font.body,
        border: studioBorder,
        borderRadius: studioTokens.radius,
        ...style,
      }}
    >
      <header style={{ ...row, justifyContent: 'space-between' }}>
        <h2 id={headingId} style={{ margin: 0, fontSize: studioTokens.font.title }}>{title}</h2>
        <input
          aria-label="Song name"
          value={project.name}
          maxLength={STUDIO_LIMITS.maxNameLength}
          onChange={(event) => dispatch({ type: 'rename', name: event.target.value, key: 'name' })}
          style={fieldStyle}
        />
      </header>

      <div role="group" aria-label="Transport" style={{ ...row, gap: studioTokens.space.md }}>
        <Button size="sm" variant="gothic" onClick={togglePlay}>
          {studio.playing ? 'Pause' : 'Play'}
        </Button>
        <Button size="sm" variant="secondary" onClick={studio.stop}>Stop</Button>
        <Button size="sm" variant={studio.loop ? 'gothic' : 'ghost'} aria-pressed={studio.loop} onClick={() => studio.setLoop(!studio.loop)}>
          Loop
        </Button>
        <span style={{ fontFamily: studioTokens.font.mono, fontSize: studioTokens.font.base }}>
          {formatClock(studio.position)} / {formatClock(studio.duration)}
        </span>
        <span
          aria-hidden="true"
          style={{
            width: studioTokens.meter.width,
            height: studioTokens.meter.height,
            background: studioTokens.colors.raised,
            borderRadius: studioTokens.radius,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'block',
              height: '100%',
              width: `${Math.round(studio.level * PERCENT)}%`,
              background: studioTokens.colors.meter,
            }}
          />
        </span>
        <Button size="sm" variant="ghost" disabled={!studio.canUndo} onClick={studio.undo}>Undo</Button>
        <Button size="sm" variant="ghost" disabled={!studio.canRedo} onClick={studio.redo}>Redo</Button>
        {mic.status === 'active' ? (
          <Button size="sm" variant="secondary" onClick={mic.stop}>Microphone off</Button>
        ) : (
          <Button size="sm" variant="secondary" disabled={mic.status === 'requesting'} onClick={() => void mic.start()}>
            {mic.status === 'requesting' ? 'Waiting for permission...' : 'Microphone on'}
          </Button>
        )}
        <Button size="sm" variant="primary" loading={studio.busy === 'exporting'} onClick={() => void studio.exportMix()}>
          Export WAV
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${studioTokens.layout.controlMin}, 1fr))`,
          gap: studioTokens.space.md,
        }}
      >
        <StudioSlider
          label="Tempo"
          value={project.bpm}
          min={STUDIO_LIMITS.minBpm}
          max={STUDIO_LIMITS.maxBpm}
          step={BPM_STEP}
          unit="BPM"
          onChange={(bpm) => dispatch({ type: 'setBpm', bpm, key: 'bpm' })}
        />
        <StudioSlider
          label="Recording delay"
          value={project.latencyMs}
          min={0}
          max={STUDIO_LIMITS.maxLatencyMs}
          step={LATENCY_STEP_MS}
          unit="ms"
          onChange={(ms) => dispatch({ type: 'setLatency', ms })}
        />
      </div>
      <p style={smallText}>
        Use headphones when recording: the song plays while you sing. If takes land late, raise the recording delay.
        Nothing is uploaded or saved unless you keep the export.
      </p>

      <div style={row}>
        <Button size="sm" variant="secondary" disabled={full} onClick={() => dispatch({ type: 'addTrack', kind: 'lyrics' })}>
          Add lyrics track
        </Button>
        <Button size="sm" variant="secondary" disabled={full} onClick={() => dispatch({ type: 'addTrack', kind: 'voice' })}>
          Add voice track
        </Button>
        {full && <span style={smallText}>{STUDIO_LIMITS.maxTracks} tracks is the most a song can have.</span>}
      </div>

      <StudioTimeline project={project} takes={studio.takes} position={studio.position} duration={studio.duration} onSeek={studio.seek} />

      {project.tracks.length === 0 ? (
        <p style={smallText}>Add a lyrics track to hear the studio sing, or a voice track to record yourself.</p>
      ) : (
        <div style={{ display: 'grid', gap: studioTokens.space.md }}>
          {project.tracks.map((track) => (
            <TrackStrip
              key={track.id}
              track={track}
              takes={studio.takes}
              dispatch={dispatch}
              recording={studio.recordingTrackId === track.id}
              recordBlocked={recordBlocked(track.id)}
              onRecord={() => studio.record(track.id)}
              onStopRecording={studio.stopRecording}
              onAddAudio={(file) => void studio.addAudio(track.id, file, file.name)}
            />
          ))}
        </div>
      )}

      {studio.exported && (
        <div style={{ display: 'grid', gap: studioTokens.space.sm, padding: studioTokens.space.md, border: studioBorder, borderRadius: studioTokens.radius }}>
          <p style={{ margin: 0, fontSize: studioTokens.font.base }}>
            {studio.exported.filename}, {formatClock(studio.exported.durationMs / MS_PER_SECOND)}. It exists only in this tab.
          </p>
          <audio controls src={studio.exported.url} style={{ width: '100%' }} />
          <div style={row}>
            <Button size="sm" variant="gothic" onClick={studio.keepExport}>Keep it</Button>
            <Button size="sm" variant="ghost" onClick={studio.discardExport}>Let it go</Button>
          </div>
        </div>
      )}

      {(studio.error || mic.error) && (
        <div role="alert" style={{ ...row, color: studioTokens.colors.error, fontSize: studioTokens.font.base }}>
          <span>{studio.error ?? mic.error}</span>
          {studio.error && <Button size="sm" variant="ghost" onClick={studio.clearError}>Dismiss</Button>}
        </div>
      )}
      <p role="status" style={smallText}>{status}</p>
    </section>
  );
};
