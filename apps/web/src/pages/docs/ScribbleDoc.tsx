import { useState } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { Scribble } from 'groove-ui';

const codeSnippet = `import { Scribble } from 'groove-ui';

// A "Scribble" button in the corner; draw over the whole page.
<Scribble storageKey="page-notes" />

// Or control it yourself, and draw inside one panel only.
const [drawing, setDrawing] = useState(false);
<div style={{ position: 'relative', height: 420 }}>
  <Scribble inline open={drawing} onOpenChange={setDrawing} showLauncher={false} />
</div>`;

const SHORTCUTS = [
  ['P', 'Pen'],
  ['H', 'Highlighter'],
  ['L', 'Line'],
  ['A', 'Arrow'],
  ['R', 'Rectangle'],
  ['O', 'Ellipse'],
  ['T', 'Text'],
  ['K', 'Laser pointer'],
  ['E', 'Eraser'],
  ['Ctrl+Z', 'Undo'],
  ['Ctrl+Shift+Z', 'Redo'],
  ['Esc', 'Stop drawing'],
] as const;

export function ScribbleDoc() {
  const [boardOpen, setBoardOpen] = useState(true);
  const [screenOpen, setScreenOpen] = useState(false);

  return (
    <ComponentDocPage
      title="Scribble"
      category="The Effects"
      description="Draw right on the screen, like a quick whiteboard over your page: pen, highlighter, lines, arrows, boxes, circles, text notes, a laser pointer that fades as you go, and an eraser that shows what it will remove. Hand-drawn look, undo, and saving as PNG or SVG. Nothing leaves the device."
      packageName="scribble"
      preview={
        <div className="w-full max-w-4xl space-y-4">
          <div className="relative h-[440px] overflow-hidden rounded-2xl border border-[#1e293b]/70 bg-[#0b0c12] bg-[radial-gradient(circle,#1e2230_1px,transparent_1px)] [background-size:22px_22px]">
            <div className="pointer-events-none absolute bottom-4 left-5 max-w-sm text-sm text-stone-400">
              <p className="m-0 font-semibold text-stone-200">Try it here</p>
              <p className="m-0">Sketch a box, point at it with an arrow, and add a note. Your drawing is kept for your next visit.</p>
            </div>
            <Scribble inline open={boardOpen} onOpenChange={setBoardOpen} showLauncher={false} storageKey="grave-docs-scribble" />
            {!boardOpen && (
              <button
                type="button"
                onClick={() => setBoardOpen(true)}
                className="absolute bottom-4 right-4 rounded-lg border border-[#2e3146] bg-[#0a0a0f] px-3 py-2 text-xs font-mono text-stone-200 hover:border-violet-500"
              >
                Draw again
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#183425] bg-[#0c1813] p-3">
            <p className="m-0 text-xs text-stone-300">Draw over this whole page instead, docs and all.</p>
            <button
              type="button"
              onClick={() => setScreenOpen(true)}
              className="rounded-lg border border-violet-700/70 bg-violet-950/60 px-3 py-1.5 text-xs font-mono text-violet-100 hover:border-violet-400"
            >
              Draw on the whole screen
            </button>
          </div>

          <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-400 sm:grid-cols-4">
            {SHORTCUTS.map(([key, action]) => (
              <div key={key} className="flex items-center gap-2">
                <dt>
                  <kbd className="rounded border border-[#2e3146] px-1.5 font-mono text-stone-200">{key}</kbd>
                </dt>
                <dd className="m-0">{action}</dd>
              </div>
            ))}
          </dl>

          <Scribble open={screenOpen} onOpenChange={setScreenOpen} showLauncher={false} keepVisible={false} />
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'open · defaultOpen · onOpenChange', type: 'boolean · boolean · (open) => void', default: 'false', description: 'Whether drawing is on; leave out open to let Scribble manage it' },
        { name: 'inline', type: 'boolean', default: 'false', description: 'Fill the nearest positioned parent instead of the whole screen' },
        { name: 'showLauncher', type: 'boolean', default: 'true', description: 'A floating "Scribble" button that turns drawing on' },
        { name: 'keepVisible', type: 'boolean', default: 'true', description: 'Keep the drawing on screen after drawing is turned off' },
        { name: 'storageKey', type: 'string', default: '—', description: 'Keep the drawing in localStorage, so it survives a reload' },
        { name: 'inks · widths', type: 'array', default: 'six inks · thin, medium, bold', description: 'The colors and line widths offered' },
        { name: 'defaultTool · defaultSketchy', type: 'ScribbleTool · boolean', default: "'pen' · true", description: 'What the pointer starts as, and whether lines start hand-drawn' },
        { name: 'exportBackground · fileName', type: 'string | null · string', default: "null · 'scribble'", description: 'Fill behind saved pictures, and the saved file name' },
        { name: 'onChange', type: '(shapes) => void', default: '—', description: 'Called whenever the drawing changes' },
        { name: 'useScribble({ storageKey })', type: 'hook', default: '—', description: 'The drawing state on its own: shapes, undo and redo, eraser, and text notes' },
      ]}
      prevPage={{ title: 'Voice', path: '/docs/components/voice' }}
      nextPage={{ title: 'Grimoire', path: '/docs/components/grimoire' }}
    />
  );
}
