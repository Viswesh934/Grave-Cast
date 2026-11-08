import { Card } from 'groove-ui';
import { CopyIcon } from '../../components/docs/DocsIcons';

export function InstallationPage() {
  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold font-serif text-white">Installation</h1>
        <p className="text-base text-stone-300">
          How to install and configure Grave UI in your React + Tailwind CSS project.
        </p>
      </div>

      {/* Step 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-white">1. Install dependencies</h2>
        <Card className="p-4 bg-[#0d0e14] border-[#222434] font-mono text-xs flex justify-between items-center text-stone-300">
          <code>npm install groove-ui</code>
          <button
            onClick={() => copyCommand('npm install groove-ui')}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Copy"
          >
            <CopyIcon size={14} />
          </button>
        </Card>
      </section>

      {/* Step 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-white">2. Add styles to your CSS</h2>
        <p className="text-sm text-stone-400">
          Import the Grave UI stylesheet and configure Tailwind v4 source paths in your <code className="text-red-400">index.css</code>:
        </p>
        <div className="p-4 rounded-xl bg-[#0d0e14] border border-[#222434] font-mono text-xs text-stone-300 overflow-x-auto">
          <pre>{`@import "tailwindcss";
@source "../node_modules/groove-ui";
@import "groove-ui/styles.css";

@theme {
  --color-grave-dark-950: #060608;
  --color-grave-dark-900: #0a0a0f;
  --color-grave-bone-100: #f5f2eb;
  --color-grave-crimson-500: #bd081c;
}`}</pre>
        </div>
      </section>

      {/* Step 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-white">3. Import and summon components</h2>
        <div className="p-4 rounded-xl bg-[#0d0e14] border border-[#222434] font-mono text-xs text-stone-300 overflow-x-auto">
          <pre>{`import { TombstoneCard, Button, CauldronBrew } from 'groove-ui';

export default function App() {
  return (
    <div className="p-8">
      <TombstoneCard
        title="Dead Code"
        subtitle="Last modified 2021"
        epitaph="Forgotten in the main branch"
        weathering="aged"
      />
      <CauldronBrew brewColor="witchfire" />
    </div>
  );
}`}</pre>
        </div>
      </section>
    </div>
  );
}

