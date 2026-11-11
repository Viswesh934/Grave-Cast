/**
 * StudioTimeline - Tracks laid out in time, with a movable playhead.
 * @module components/effects/VoiceStudio/Timeline
 */

import { useMemo, type KeyboardEvent, type PointerEvent } from 'react';
import type { StudioProject, StudioTake } from '../../../studio/project';
import { beatsToSeconds, clipLengthSeconds, planLyrics } from '../../../studio/timeline';
import { withAlpha } from '../HorrorBackground/tokens';
import { formatClock, roundToClock } from './format';
import { studioBorder, studioTokens } from './tokens';
import { Waveform } from './Waveform';

/** How faded a muted track looks. */
const MUTED_OPACITY = 0.4;

/**
 * Props for {@link StudioTimeline}.
 */
export interface StudioTimelineProps {
  project: StudioProject;
  takes: Readonly<Record<string, StudioTake>>;
  /** Playhead position in seconds. */
  position: number;
  /** Length of the song in seconds. */
  duration: number;
  /** Called with a new playhead position when the user clicks or uses the keyboard. */
  onSeek: (seconds: number) => void;
}

const { pixelsPerSecond, laneHeight, rulerHeight, minSeconds, playheadWidth, keyStepSeconds, keyStepLargeSeconds } =
  studioTokens.timeline;

const blockStyle = (left: number, width: number, color: string) =>
  ({
    position: 'absolute',
    left,
    width: Math.max(playheadWidth, width),
    top: studioTokens.space.xs,
    bottom: studioTokens.space.xs,
    background: withAlpha(color, studioTokens.blockStrength),
    border: `${studioTokens.hairline} solid ${color}`,
    borderRadius: studioTokens.radius,
    overflow: 'hidden',
  }) as const;

/**
 * A horizontal view of the song: one lane per track, recordings drawn as
 * waveforms, lyrics drawn as their syllables, and a playhead.
 *
 * The whole view is one keyboard control. Arrow keys move the playhead by a
 * second (five with Shift), and Home and End jump to the start and end.
 * Clicking anywhere moves the playhead there.
 */
export const StudioTimeline = ({ project, takes, position, duration, onSeek }: StudioTimelineProps) => {
  const seconds = Math.max(minSeconds, Math.ceil(duration));
  const width = seconds * pixelsPerSecond;
  const spb = beatsToSeconds(1, project.bpm);

  const lanes = useMemo(
    () =>
      project.tracks.map((track) => {
        if (track.kind === 'lyrics') {
          const { syllables, melody } = planLyrics(track);
          const offset = track.lyrics.startBeat * spb;
          return {
            track,
            blocks: melody.notes.map((note, index) => ({
              key: `n${index}`,
              left: (offset + note.startBeat * spb) * pixelsPerSecond,
              width: note.durationBeats * spb * pixelsPerSecond,
              label: syllables[index]?.label ?? '',
              peaks: null as readonly number[] | null,
            })),
          };
        }
        return {
          track,
          blocks: track.clips.flatMap((clip) => {
            const take = takes[clip.takeId];
            if (!take) return [];
            const skip = take.durationSeconds > 0 ? Math.floor((clip.offsetSeconds / take.durationSeconds) * take.peaks.length) : 0;
            return [
              {
                key: clip.id,
                left: beatsToSeconds(clip.startBeat, project.bpm) * pixelsPerSecond,
                width: clipLengthSeconds(clip, take, track) * pixelsPerSecond,
                label: take.name,
                peaks: take.peaks.slice(skip) as readonly number[] | null,
              },
            ];
          }),
        };
      }),
    [project, takes, spb]
  );

  const seekTo = (value: number) => onSeek(Math.min(seconds, Math.max(0, value)));

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    seekTo((event.clientX - rect.left) / pixelsPerSecond);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const stepBy = event.shiftKey ? keyStepLargeSeconds : keyStepSeconds;
    const moves: Record<string, number> = {
      ArrowRight: position + stepBy,
      ArrowUp: position + stepBy,
      ArrowLeft: position - stepBy,
      ArrowDown: position - stepBy,
      Home: 0,
      End: duration,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    seekTo(moves[event.key]);
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Playhead"
      aria-valuemin={0}
      aria-valuemax={seconds}
      aria-valuenow={roundToClock(position)}
      aria-valuetext={formatClock(position)}
      onKeyDown={onKeyDown}
      style={{ overflowX: 'auto', border: studioBorder, borderRadius: studioTokens.radius, background: studioTokens.colors.panel }}
    >
      <div onPointerDown={onPointerDown} style={{ position: 'relative', width, cursor: 'pointer' }} aria-hidden="true">
        <div style={{ position: 'relative', height: rulerHeight, borderBottom: studioBorder }}>
          {Array.from({ length: seconds + 1 }, (_, second) => (
            <span
              key={second}
              style={{
                position: 'absolute',
                left: second * pixelsPerSecond,
                top: 0,
                bottom: 0,
                borderLeft: `${studioTokens.hairline} solid ${studioTokens.colors.grid}`,
                paddingLeft: studioTokens.space.xs,
                fontFamily: studioTokens.font.mono,
                fontSize: studioTokens.font.small,
                color: studioTokens.colors.muted,
              }}
            >
              {second}
            </span>
          ))}
        </div>

        {lanes.map(({ track, blocks }) => {
          const color = track.kind === 'lyrics' ? studioTokens.colors.lyrics : studioTokens.colors.voice;
          return (
            <div
              key={track.id}
              style={{
                position: 'relative',
                height: laneHeight,
                borderBottom: studioBorder,
                background: studioTokens.colors.lane,
                opacity: track.muted ? MUTED_OPACITY : 1,
              }}
            >
              {blocks.map((block) => (
                <div key={block.key} style={blockStyle(block.left, block.width, color)}>
                  {block.peaks ? (
                    <Waveform peaks={block.peaks} color={color} />
                  ) : (
                    <span
                      style={{
                        display: 'block',
                        padding: studioTokens.space.xs,
                        fontSize: studioTokens.font.small,
                        color: studioTokens.colors.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {block.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: position * pixelsPerSecond,
            width: playheadWidth,
            background: studioTokens.colors.playhead,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};
