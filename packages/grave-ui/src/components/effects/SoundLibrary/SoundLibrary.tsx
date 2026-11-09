/**
 * SoundLibrary - A browsable list of sound effects, like a ringtone store.
 * @module components/effects/SoundLibrary/SoundLibrary
 */

import { useState, type CSSProperties } from 'react';
import { EFFECT_CATEGORIES } from '../../../audio';
import type { EffectCategory, EffectName } from '../../../audio';
import { useSoundLibrary } from '../../../hooks/useSoundLibrary';
import { Button } from '../../primitives/Button';
import { Badge } from '../../primitives/Badge';
import { libraryTokens, categoryBadge } from './tokens';

/**
 * Props for {@link SoundLibrary}.
 */
export interface SoundLibraryProps {
  /** Start on this category. @default 'all' */
  category?: EffectCategory | 'all';
  /** Show the search box. @default true */
  showSearch?: boolean;
  /** Show the category filter chips. @default true */
  showCategories?: boolean;
  /** Show a Download button that saves each sound as a WAV file. @default true */
  showDownload?: boolean;
  /** Preview loudness, 0-1. */
  volume?: number;
  /** Called when a preview starts. */
  onPlay?: (name: EffectName) => void;
  /** Maximum height of the list before it scrolls. Number is px. */
  maxHeight?: number | string;
  /** Additional CSS classes for the wrapper. */
  className?: string;
  /** Inline styles for the wrapper. */
  style?: CSSProperties;
}

const CATEGORY_ICONS: Record<EffectCategory, string> = {
  machines: '💻',
  taps: '🔘',
  doors: '🚪',
  impacts: '💥',
  magic: '🧪',
  creatures: '🐺',
  ambience: '🌫️',
  alerts: '🔔',
};

const PlayGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.5-5.2a.5.5 0 0 0 0-.86l-8.5-5.2A.5.5 0 0 0 4.5 2.8Z" />
  </svg>
);

const StopGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="10" height="10" rx="1.5" />
  </svg>
);

/**
 * A searchable list of every sound effect, with a play button, category
 * badge, length, a copy-code button, and a WAV download for each.
 */
export const SoundLibrary = ({
  category = 'all',
  showSearch = true,
  showCategories = true,
  showDownload = true,
  volume,
  onPlay,
  maxHeight,
  className = '',
  style,
}: SoundLibraryProps) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<EffectCategory | 'all'>(category);
  const [copied, setCopied] = useState<string | null>(null);

  const { effects, playing, toggle, download } = useSoundLibrary({ category: active, query, volume });
  const { row, playSize, progressHeight, colors, shadow, font, transition } = libraryTokens;

  const handleToggle = (name: EffectName) => {
    if (playing !== name) onPlay?.(name);
    toggle(name);
  };

  const handleCopy = (name: string) => {
    void navigator.clipboard?.writeText(`playSound('${name}')`);
    setCopied(name);
    window.setTimeout(() => setCopied((current) => (current === name ? null : current)), libraryTokens.copyFeedbackMs);
  };

  const categoryIds = Object.keys(EFFECT_CATEGORIES) as EffectCategory[];

  return (
    <div
      className={`grave-sound-library ${className}`.trim()}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: font.bodyFamily, ...style }}
    >
      {/* Search Input */}
      {showSearch && (
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search 40+ sounds (e.g. cpu, click, bell, modem, egg)..."
            aria-label="Search sounds"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '11px 16px',
              fontFamily: font.bodyFamily,
              fontSize: 13,
              color: colors.title,
              backgroundColor: colors.inputSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
            }}
          />
        </div>
      )}

      {/* Category Pills Bar */}
      {showCategories && (
        <div
          role="group"
          aria-label="Sound categories"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            paddingBottom: 2,
          }}
        >
          <button
            type="button"
            aria-pressed={active === 'all'}
            onClick={() => setActive('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 10,
              fontSize: 12,
              fontFamily: 'monospace',
              cursor: 'pointer',
              border: active === 'all' ? '1px solid #10b981' : `1px solid ${colors.border}`,
              backgroundColor: active === 'all' ? 'rgba(6, 78, 59, 0.7)' : colors.surface,
              color: active === 'all' ? '#a7f3d0' : colors.muted,
              boxShadow: active === 'all' ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none',
              transition,
            }}
          >
            <span>All</span>
            <span style={{ fontSize: 10, opacity: 0.8 }}>({effects.length})</span>
          </button>

          {categoryIds.map((id) => {
            const isCategoryActive = active === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isCategoryActive}
                title={EFFECT_CATEGORIES[id].blurb}
                onClick={() => setActive(id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  border: isCategoryActive ? '1px solid #10b981' : `1px solid ${colors.border}`,
                  backgroundColor: isCategoryActive ? 'rgba(6, 78, 59, 0.7)' : colors.surface,
                  color: isCategoryActive ? '#a7f3d0' : colors.body,
                  boxShadow: isCategoryActive ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none',
                  transition,
                }}
              >
                <span>{CATEGORY_ICONS[id] ?? '🔊'}</span>
                <span>{EFFECT_CATEGORIES[id].label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sounds Count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <p aria-live="polite" style={{ margin: 0, fontSize: 11, color: colors.muted, fontFamily: 'monospace' }}>
          {effects.length} {effects.length === 1 ? 'sound available' : 'sounds available'}
        </p>
      </div>

      {/* Sound Cards List */}
      {effects.length === 0 ? (
        <p style={{ margin: 0, padding: 32, textAlign: 'center', color: colors.muted, fontSize: 13, fontFamily: 'monospace' }}>
          No audio signals found matching that query. Try another term.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxHeight,
            overflowY: maxHeight === undefined ? undefined : 'auto',
          }}
        >
          {effects.map((effect) => {
            const name = effect.name as EffectName;
            const isPlaying = playing === name;
            const isEgg = effect.tags?.includes('egg') || effect.tags?.includes('easter egg');

            return (
              <li
                key={effect.name}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: `1px solid ${isPlaying ? '#10b981' : colors.border}`,
                  backgroundColor: isPlaying ? colors.surfaceActive : colors.surface,
                  boxShadow: isPlaying ? shadow.active : '0 2px 8px rgba(0, 0, 0, 0.4)',
                  transition,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: row.gap, flexWrap: 'wrap' }}>
                  {/* Play Button */}
                  <button
                    type="button"
                    aria-label={`${isPlaying ? 'Stop' : 'Play'} ${effect.label}`}
                    aria-pressed={isPlaying}
                    onClick={() => handleToggle(name)}
                    style={{
                      width: playSize,
                      height: playSize,
                      padding: 0,
                      borderRadius: 10,
                      border: isPlaying ? '1px solid #10b981' : '1px solid #1f422e',
                      backgroundColor: isPlaying ? '#0d3822' : '#0d2217',
                      color: isPlaying ? '#a7f3d0' : '#34d399',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: isPlaying ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isPlaying ? <StopGlyph /> : <PlayGlyph />}
                  </button>

                  {/* Title & Description */}
                  <div style={{ flex: '1 1 12rem', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: colors.title, fontWeight: 700, fontFamily: 'monospace' }}>
                        {effect.label}
                      </span>
                      <Badge size="sm" variant={categoryBadge[effect.category]}>
                        {EFFECT_CATEGORIES[effect.category].label}
                      </Badge>
                      {isEgg && (
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: 'monospace',
                            padding: '2px 6px',
                            borderRadius: 6,
                            backgroundColor: 'rgba(120, 53, 15, 0.5)',
                            color: '#fde68a',
                            border: '1px solid #92400e',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                          }}
                        >
                          Easter Egg
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: 12, color: colors.body, lineHeight: 1.4 }}>
                      {effect.description}
                    </p>
                  </div>

                  {/* Duration Pill */}
                  <span style={{ fontSize: 11, color: colors.muted, fontFamily: 'monospace' }}>
                    {effect.duration.toFixed(2)}s
                  </span>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Copy code to play ${effect.label}`}
                      onClick={() => handleCopy(effect.name)}
                    >
                      {copied === effect.name ? 'Copied!' : 'Copy'}
                    </Button>
                    {showDownload && (
                      <Button
                        size="sm"
                        variant="secondary"
                        aria-label={`Download ${effect.label} as a WAV file`}
                        onClick={() => void download(name).catch(() => undefined)}
                      >
                        WAV
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bottom Playback Progress Bar */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: progressHeight,
                    backgroundColor: colors.progressTrack,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: colors.progressFill,
                      transformOrigin: 'left',
                      transform: isPlaying ? 'scaleX(1)' : 'scaleX(0)',
                      transition: isPlaying ? `transform ${effect.duration}s linear` : 'none',
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
