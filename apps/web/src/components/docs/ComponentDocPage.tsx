import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CopyIcon, CheckIcon } from './DocsIcons';
import { CobwebCorner } from 'groove-ui';

export interface PropItem {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface GothicPhilosophyMeta {
  influence: string; // e.g. "Catacombs & Ancient Crypts"
  movement: string;  // e.g. "Living Stone & Sacrificial Embers"
  lore?: string;
}

export interface ComponentDocPageProps {
  title: string;
  category: 'Primitives' | 'The Crypt' | 'The Coven' | 'The Sanguine' | 'The Lycan' | 'The Slavic' | 'The Arachnid';
  description: string;
  packageName?: string;
  preview: ReactNode;
  codeSnippet: string;
  propsList?: PropItem[];
  variants?: { title: string; description?: string; element: ReactNode }[];
  prevPage?: { title: string; path: string };
  nextPage?: { title: string; path: string };

  // 3D Gothic vs 2D Flat Mode Controls
  has3DMode?: boolean;
  is3DMode?: boolean;
  onToggle3D?: (is3D: boolean) => void;
  gothicPhilosophy?: GothicPhilosophyMeta;
}

export function ComponentDocPage({
  title,
  category,
  description,
  packageName = title.toLowerCase(),
  preview,
  codeSnippet,
  propsList = [],
  variants = [],
  prevPage,
  nextPage,
  has3DMode = false,
  is3DMode = true,
  onToggle3D,
  gothicPhilosophy,
}: ComponentDocPageProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);

  const installCommand = `npx grave-ui add ${packageName}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(installCommand);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  return (
    <div className="relative max-w-4xl mx-auto px-6 py-10 space-y-12">
      {/* Spiderweb in top-right corner of each doc page */}
      <CobwebCorner position="top-right" size="md" hasSpider={true} />

      {/* Breadcrumb & Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-grave-mist-400">
          <Link to="/docs" className="hover:text-grave-bone-100 transition-colors">Docs</Link>
          <span>/</span>
          <span className="text-grave-bone-200">{category}</span>
          <span>/</span>
          <span className="text-red-400 font-semibold">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-extrabold font-serif tracking-tight text-grave-bone-100">
            {title}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-red-950/70 text-red-300 border border-red-800/70 shadow-sm">
            {category}
          </span>
          {has3DMode && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-950/60 text-amber-300 border border-amber-700/60">
              ⚡ WebGL 3D Ready
            </span>
          )}
        </div>

        <p className="text-base text-stone-300 max-w-2xl leading-relaxed">
          {description}
        </p>

        {/* Gothic Design Architecture Badge */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono bg-[#14121e] border border-red-900/60 text-red-200 shadow-inner">
            <span className="text-red-400 font-bold">🏛️ Gothic Architecture:</span>
            <span className="text-stone-300">
              {gothicPhilosophy?.influence ?? "Ancient Crypts & Catacombs"}
            </span>
            <span className="text-stone-500">·</span>
            <span className="text-amber-400 font-medium">
              {gothicPhilosophy?.movement ?? "Living Sculptural Reliefs"}
            </span>
          </div>
        </div>

        {/* Quick CLI Install Pill */}
        <div className="pt-1 flex items-center gap-3">
          <div className="inline-flex items-center gap-3 bg-[#11121a] border border-[#232536] rounded-lg px-3.5 py-1.5 text-xs font-mono text-stone-300 shadow-inner">
            <span className="text-red-400">$</span>
            <span>{installCommand}</span>
            <button
              onClick={handleCopyInstall}
              className="ml-2 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Copy install command"
            >
              {copiedInstall ? <CheckIcon size={14} className="text-emerald-400" /> : <CopyIcon size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Showcase (Animate UI Tabbed Canvas) */}
      <section className="space-y-4">
        <div className="border border-[#26283b] rounded-2xl bg-[#0d0e16] overflow-hidden shadow-2xl">
          {/* Header Bar with Tabs & Controls */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#242638] bg-[#12131d]">
            {/* Segmented Preview/Code Switch */}
            <div className="flex items-center gap-1 bg-[#181a28] p-1 rounded-lg border border-[#282a3d]">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-red-950 text-red-200 shadow-sm border border-red-800/80 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-red-950 text-red-200 shadow-sm border border-red-800/80 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Code
              </button>
            </div>

            {/* Toolbar: 3D Gothic Default vs 2D Flat Toggle replaces the old Re-render button */}
            <div className="flex items-center gap-2">
              {has3DMode && onToggle3D && (
                <div className="flex items-center bg-[#181a28] p-0.5 rounded-lg border border-[#2d3045] shadow-inner">
                  <button
                    type="button"
                    onClick={() => onToggle3D(true)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                      is3DMode
                        ? 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-red-100 border border-red-700 font-bold shadow-md shadow-red-950/60'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="3D Gothic WebGL Mode (Default)"
                  >
                    <span>🗿 3D Gothic</span>
                    <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-red-800/90 text-red-100 font-sans tracking-wider">Default</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle3D(false)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                      !is3DMode
                        ? 'bg-stone-800 text-stone-200 border border-stone-600 font-bold shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="Switch to 2D Flat Card Mode"
                  >
                    2D Flat
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono text-stone-300 hover:text-white bg-[#181a28] border border-[#2d3045] hover:border-stone-500 transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <CheckIcon size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={13} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Canvas Area: High-visibility gothic atmosphere */}
          {activeTab === 'preview' ? (
            <div
              className="relative min-h-[380px] flex items-center justify-center p-8 bg-[#0b0c13] bg-[radial-gradient(#25283d_1px,transparent_1px)] [background-size:20px_20px] shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]"
            >
              {preview}
            </div>
          ) : (
            <div className="p-4 bg-[#07080d] overflow-x-auto font-mono text-xs text-stone-200 leading-relaxed max-h-[480px]">
              <pre className="p-2">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* Variants & States Section */}
      {variants.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-serif text-grave-bone-100 border-b border-[#222434] pb-3">
            Variants & Presets
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {variants.map((v, i) => (
              <div key={i} className="border border-[#222434] rounded-xl bg-[#0f1017] p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-grave-bone-100">{v.title}</h3>
                  {v.description && (
                    <p className="text-xs text-grave-mist-400 mt-0.5">{v.description}</p>
                  )}
                </div>
                <div className="p-6 bg-[#090a0f] rounded-lg border border-[#1b1d29] flex items-center justify-center min-h-[140px]">
                  {v.element}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Props Reference Table */}
      {propsList.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-serif text-grave-bone-100 border-b border-[#222434] pb-3">
            Props
          </h2>
          <div className="border border-[#222434] rounded-xl overflow-hidden bg-[#0d0e14]">
            <table className="w-full text-left text-sm font-mono">
              <thead className="bg-[#12131c] text-stone-400 text-xs uppercase tracking-wider border-b border-[#222434]">
                <tr>
                  <th className="px-4 py-3">Prop</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Default</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e202e] text-xs">
                {propsList.map((p, i) => (
                  <tr key={i} className="hover:bg-[#141520]/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-red-300">{p.name}</td>
                    <td className="px-4 py-3 text-amber-300/90">{p.type}</td>
                    <td className="px-4 py-3 text-stone-500">{p.default ?? '—'}</td>
                    <td className="px-4 py-3 text-stone-300 font-sans">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bottom Prev / Next Nav */}
      <div className="flex items-center justify-between pt-8 border-t border-[#222434] text-sm font-mono">
        {prevPage ? (
          <Link
            to={prevPage.path}
            className="group flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
          >
            <span className="text-stone-500 group-hover:-translate-x-1 transition-transform">←</span>
            <span>{prevPage.title}</span>
          </Link>
        ) : <div />}

        {nextPage && (
          <Link
            to={nextPage.path}
            className="group flex items-center gap-2 text-stone-400 hover:text-white transition-colors ml-auto"
          >
            <span>{nextPage.title}</span>
            <span className="text-stone-500 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
