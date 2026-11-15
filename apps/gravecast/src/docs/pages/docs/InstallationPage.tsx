import { Card } from 'groove-ui';
import { CopyIcon } from '../../components/docs/DocsIcons';

export function InstallationPage() {
  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold font-serif text-white">Installation</h1>
        <p className="text-base text-stone-300">
          How to install and configure Grave UI in your React + Tailwind CSS project.
        </p>
      </div>

      {/* Step 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-white">1. Install dependencies</h2>
        <Card className="p-4 bg-[#0c1813] border-[#183425] font-mono text-xs flex justify-between items-center text-stone-300 rounded-2xl shadow-xl">
          <code>npm install groove-ui three @react-three/fiber</code>
          <button
            onClick={() => copyCommand('npm install groove-ui three @react-three/fiber')}
            className="text-stone-400 hover:text-emerald-400 transition-colors cursor-pointer"
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
          Import the Grave UI stylesheet and configure Tailwind v4 source paths in your <code className="text-emerald-400">index.css</code>:
        </p>
        <div className="p-5 rounded-2xl bg-[#0c1813] border border-[#183425] font-mono text-xs text-stone-300 overflow-x-auto shadow-xl">
          <pre>{`@import "tailwindcss";
@source "../node_modules/groove-ui";
@import "groove-ui/styles.css";

@theme {
  --color-grave-dark-950: #060c09;
  --color-grave-dark-900: #08120e;
  --color-grave-dark-800: #10211a;
  --color-grave-dark-700: #1b382b;
  --color-grave-bone-100: #f4f7f4;
  --color-grave-moss-500: #10b981;
}`}</pre>
        </div>
      </section>

      {/* Step 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-white">3. Import and summon components</h2>
        <div className="p-5 rounded-2xl bg-[#0c1813] border border-[#183425] font-mono text-xs text-stone-300 overflow-x-auto shadow-xl">
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

