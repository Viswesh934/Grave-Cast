import { useState, useEffect } from 'react';
import { ComponentDocPage } from '../../components/docs/ComponentDocPage';
import { BroomProgress, Button } from 'groove-ui';

const codeSnippet = `import { BroomProgress } from 'groove-ui';

export function StoryViewer() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0.4);

  return (
    <BroomProgress
      count={5}
      index={index}
      progress={progress}
      witchSize={80}
    />
  );
}`;

export function BroomProgressDoc() {
  const [count] = useState(5);
  const [index, setIndex] = useState(1);
  const [progress, setProgress] = useState(0.65);
  const [plain, setPlain] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!animating) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          setIndex((i) => (i + 1) % count);
          return 0;
        }
        return p + 0.04;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [animating, count]);

  return (
    <ComponentDocPage
      title="BroomProgress"
      category="The Effects"
      description="Instagram and TikTok story-style progress bars with Baba Yaga riding atop the active segment. Segments seamlessly track narrative chapters or multi-step wizard state."
      packageName="broom-progress"
      preview={
        <div className="w-full max-w-xl flex flex-col items-center gap-8 p-8 rounded-2xl border border-[#1b3d2b] bg-[#091510] shadow-2xl">
          <div className="w-full space-y-4">
            <BroomProgress
              count={count}
              index={index}
              progress={progress}
              plain={plain}
              witchSize={80}
            />
            <div className="flex justify-between items-center text-xs font-mono text-emerald-400/80 px-1">
              <span>Chapter {index + 1} of {count}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="gothic"
              onClick={() => setAnimating(!animating)}
              className="text-xs font-mono"
            >
              {animating ? 'Pause Flight' : 'Auto Play Flight'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIndex((i) => (i + 1) % count);
                setProgress(0);
              }}
              className="text-xs font-mono"
            >
              Next Chapter →
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPlain(!plain)}
              className="text-xs font-mono"
            >
              Witch Silhouette: {plain ? 'OFF' : 'ON'}
            </Button>
          </div>

          <div className="w-full space-y-1">
            <label className="flex justify-between text-xs font-mono text-stone-400">
              <span>Manual Progress Scrub</span>
              <span>{(progress * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={progress}
              onChange={(e) => {
                setAnimating(false);
                setProgress(parseFloat(e.target.value));
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      }
      codeSnippet={codeSnippet}
      propsList={[
        { name: 'count', type: 'number', description: 'Total number of story segments in the track' },
        { name: 'index', type: 'number', description: 'Current active segment index (zero-based)' },
        { name: 'progress', type: 'number', description: 'Progress of the active segment from 0.0 to 1.0' },
        { name: 'plain', type: 'boolean', default: 'false', description: 'When true, hides the flying witch silhouette' },
        { name: 'witchSize', type: 'number', default: '96', description: 'Width of the witch silhouette in pixels' },
        { name: 'label', type: 'string', default: "'Story progress'", description: 'Accessible screen-reader description' },
      ]}
      prevPage={{ title: 'BitingFrame', path: '/docs/components/biting-frame' }}
      nextPage={{ title: 'Grimoire', path: '/docs/components/grimoire' }}
    />
  );
}

