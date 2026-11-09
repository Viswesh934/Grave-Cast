/**
 * SoundLibrary - A browsable list of sound effects, with pagination and category filters.
 * @module components/effects/SoundLibrary/SoundLibrary
 */

import { useState, useEffect, type CSSProperties } from 'react';
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
  /** Number of sounds per page. Set to 0 to disable pagination. @default 8 */
  pageSize?: number;
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
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.5-5.2a.5.5 0 0 0 0-.86l-8.5-5.2A.5.5 0 0 0 4.5 2.8Z" />
  </svg>
);

const StopGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="10" height="10" rx="1.5" />
  </svg>
);

/**
 * A searchable, paginated list of every sound effect, with a play button,
 * category badge, length, copy-code button, and WAV download.
 */
export const SoundLibrary = ({
  category = 'all',
  showSearch = true,
  showCategories = true,
  showDownload = true,
  volume,
  onPlay,
  pageSize = 8,
  maxHeight,
  className = '',
  style,
}: SoundLibraryProps) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<EffectCategory | 'all'>(category);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);

  const { effects, playing, toggle, download } = useSoundLibrary({ category: active, query, volume });
  const { row, progressHeight, colors, shadow, font, transition } = libraryTokens;

  // Reset to page 1 whenever category or search filter changes
  useEffect(() => {
    setPage(1);
  }, [active, query]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(effects.length / pageSize)) : 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const displayedEffects = pageSize > 0
    ? effects.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : effects;

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
      {/* Search Input Bar */}
      {showSearch && (
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search sounds (e.g. cpu, click, bell, modem, egg)..."
            aria-label="Search sounds"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 16px',
              fontFamily: font.bodyFamily,
              fontSize: 13,
              color: colors.title,
              backgroundColor: colors.inputSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}

      {/* Category Pills Bar (Horizontal Scrollable Ribbon) */}
      {showCategories && (
        <div
          role="group"
          aria-label="Sound categories"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
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
              whiteSpace: 'nowrap',
              border: active === 'all' ? '1px solid #10b981' : `1px solid ${colors.border}`,
              backgroundColor: active === 'all' ? 'rgba(6, 78, 59, 0.75)' : colors.surface,
              color: active === 'all' ? '#a7f3d0' : colors.muted,
              boxShadow: active === 'all' ? '0 0 10px rgba(16, 185, 129, 0.25)' : 'none',
              transition,
            }}
          >
            <span>All Sounds</span>
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
                  whiteSpace: 'nowrap',
                  border: isCategoryActive ? '1px solid #10b981' : `1px solid ${colors.border}`,
                  backgroundColor: isCategoryActive ? 'rgba(6, 78, 59, 0.75)' : colors.surface,
                  color: isCategoryActive ? '#a7f3d0' : colors.body,
                  boxShadow: isCategoryActive ? '0 0 10px rgba(16, 185, 129, 0.25)' : 'none',
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

      {/* Results Telemetry & Top Pagination Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          padding: '4px 2px',
        }}
      >
        <p aria-live="polite" style={{ margin: 0, fontSize: 12, color: colors.muted, fontFamily: 'monospace' }}>
          {effects.length === 0
            ? '0 sounds found'
            : pageSize > 0
            ? `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, effects.length)} of ${effects.length} sounds`
            : `${effects.length} sounds`}
        </p>

        {totalPages > 1 && (
          <div
            role="navigation"
            aria-label="Sound pages (top)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.4 : 1,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.title,
                transition,
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => setPage(p)}
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    border: isCurrent ? '1px solid #10b981' : `1px solid ${colors.border}`,
                    backgroundColor: isCurrent ? 'rgba(6, 78, 59, 0.85)' : colors.surface,
                    color: isCurrent ? '#a7f3d0' : colors.muted,
                    fontWeight: isCurrent ? 700 : 400,
                    boxShadow: isCurrent ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
                    transition,
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontFamily: 'monospace',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.4 : 1,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.title,
                transition,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Sound Cards List */}
      {effects.length === 0 ? (
        <div style={{ padding: '36px 16px', textAlign: 'center', backgroundColor: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}` }}>
          <p style={{ margin: 0, color: colors.muted, fontSize: 13, fontFamily: 'monospace' }}>
            No audio signals found matching &ldquo;{query}&rdquo;.
          </p>
        </div>
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
          {displayedEffects.map((effect) => {
            const name = effect.name as EffectName;
            const isPlaying = playing === name;
            const isEgg = effect.tags?.includes('egg') || effect.tags?.includes('easter egg');

            return (
              <li
                key={effect.name}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: `1px solid ${isPlaying ? '#10b981' : colors.border}`,
                  backgroundColor: isPlaying ? colors.surfaceActive : colors.surface,
                  boxShadow: isPlaying ? shadow.active : '0 2px 6px rgba(0, 0, 0, 0.35)',
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
                      width: 36,
                      height: 36,
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
                            padding: '1px 6px',
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
                    <p style={{ margin: '2px 0 0 0', fontSize: 12, color: colors.body, lineHeight: 1.4 }}>
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
