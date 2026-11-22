import { useRef, useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import {
  HauntedScrollbar,
  Button,
  type HauntedScrollbarVariant,
} from 'groove-ui';

const codeSnippet = `import { HauntedScrollbar } from 'groove-ui';

// 1. Mount globally in your layout to haunt the window scrollbar
export function Layout({ children }) {
  return (
    <>
      {children}
      <HauntedScrollbar variant="ectoplasm" hasEye autoHide />
    </>
  );
}

// 2. Or attach to a scoped scrollable container
export function CursedScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ height: 400, overflowY: 'auto' }}>
        {/* Long content */}
      </div>
      <HauntedScrollbar targetRef={containerRef} variant="blood" />
    </div>
  );
}`;

export function HauntedScrollbarDoc() {
  const [variant, setVariant] = useState<HauntedScrollbarVariant>('ectoplasm');
  const [hasEye, setHasEye] = useState(true);
  const [autoHide, setAutoHide] = useState(false);
  const scrollBoxRef = useRef<HTMLDivElement>(null);

  return (
    <ComponentDocPage
      title="HauntedScrollbar"
      category="The Effects"
      description="An organic, living slime-blob scrollbar that stretches, squishes, and deforms as you scroll. Features velocity-based viscous liquid physics, a gooey sticky trail that snaps under tension, an eyeball that tracks the cursor, and interactive dragging."
      packageName="haunted-scrollbar"
      preview={
        <div className="w-full max-w-xl flex flex-col gap-6 p-6 rounded-2xl border border-[#1b3d2b] bg-[#091510] shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b3d2b] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-400">Variant:</span>
              {(['ectoplasm', 'blood', 'void'] as HauntedScrollbarVariant[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-mono border transition-all ${
                    variant === v
                      ? 'border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold'
                      : 'border-[#1b3a2a] bg-[#0c1813] text-stone-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setHasEye(!hasEye)}
                className="text-xs font-mono py-1 px-2.5"
              >
                Watcher Eye: {hasEye ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setAutoHide(!autoHide)}
                className="text-xs font-mono py-1 px-2.5"
              >
                Auto-Hide: {autoHide ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>

          {/* Interactive Scroll Box */}
          <div className="relative isolate rounded-xl border border-[#1b3d2b] bg-[#060c08] overflow-hidden">
            <div
              ref={scrollBoxRef}
              className="h-72 overflow-y-auto p-6 space-y-4 text-stone-300 text-sm leading-relaxed pr-10"
              style={{ scrollbarWidth: 'none' }}
            >
              <h4 className="font-serif text-lg font-bold text-emerald-300 m-0">
                The Chronicles of the Viscous Hollow
              </h4>
              <p>
                Scroll inside this container or use your mouse wheel rapidly to watch the gelatinous blob stretch, sag, and snap under kinetic tension.
              </p>
              <p className="text-xs font-mono text-emerald-400/80 bg-[#0e2117] p-3 rounded-lg border border-[#183a29]">
                💡 Try grabbing the blob and dragging it up or down. Notice the gum-like elasticity, inertial drag, and organic recoil when released.
              </p>
              <p>
                Deep beneath the crypt moss, the living slime moves along ancient iron conduit rails. Unlike static mechanical bars, its volume is conserved: when kinetic speed elongates it vertically, its horizontal waist cinches inwards before bouncing back with spring damping.
              </p>
              <p>
                If left undisturbed, the watcher iris opens and tracks your mouse movements across the chamber, ready to recoil at sudden gestures.
              </p>
              <p className="font-serif italic text-stone-400">
                &ldquo;It does not merely measure the height of the tome; it clings to it, as if afraid to be left in the dark.&rdquo;
              </p>
              <div className="h-20" />
            </div>

            <HauntedScrollbar
              targetRef={scrollBoxRef}
              variant={variant}
              hasEye={hasEye}
              autoHide={autoHide}
              style={{ position: 'absolute', right: 4 }}
            />
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'variant', type: "'ectoplasm' | 'blood' | 'void'", default: "'ectoplasm'", description: 'Atmospheric color palette and glow intensity' },
        { name: 'targetRef', type: 'RefObject<HTMLElement | null>', default: 'undefined', description: 'Scrollable container element to watch (defaults to window scroll)' },
        { name: 'hasEye', type: 'boolean', default: 'true', description: 'Renders the living eyeball that tracks scroll direction and cursor position' },
        { name: 'autoHide', type: 'boolean', default: 'true', description: 'Fades the blob to low opacity when scrolling stops' },
        { name: 'soundEnabled', type: 'boolean', default: 'true', description: 'Plays wet squelch and drip sounds during high velocity stretch and snapping' },
        { name: 'style', type: 'CSSProperties', description: 'Inline style overrides for the track wrapper' },
        { name: 'className', type: 'string', default: "''", description: 'Custom CSS class for the track wrapper' },
      ]}
      prevPage={{ title: 'BroomProgress', path: '/docs/components/broom-progress' }}
      nextPage={{ title: 'HorrorCursor', path: '/docs/components/horror-cursor' }}
    />
  );
}

