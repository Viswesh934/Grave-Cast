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
    <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-12">
      {/* Spiderweb in top-right corner of each doc page */}
      <CobwebCorner position="top-right" size="md" hasSpider={true} />

      {/* Breadcrumb & Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-grave-mist-400">
          <Link to="/docs" className="hover:text-emerald-300 transition-colors">Docs</Link>
          <span>/</span>
          <span className="text-grave-bone-200">{category}</span>
          <span>/</span>
          <span className="text-emerald-400 font-semibold">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-extrabold font-serif tracking-tight text-white">
            {title}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-sm">
            {category}
          </span>
          {has3DMode && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-teal-950/60 text-teal-300 border border-teal-700/60">
              3D WebGL
            </span>
          )}
        </div>

        <p className="text-base text-stone-300 max-w-3xl leading-relaxed">
          {description}
        </p>

        {/* Gothic Design Architecture Badge */}
        <div className="pt-1 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono bg-[#0c1813] border border-emerald-900/60 text-emerald-200 shadow-inner">
            <span className="text-emerald-400 font-bold">Archetype:</span>
            <span className="text-stone-300">
              {gothicPhilosophy?.influence ?? "Ancient Crypts & Catacombs"}
            </span>
            <span className="text-stone-500">·</span>
            <span className="text-teal-400 font-medium">
              {gothicPhilosophy?.movement ?? "Living Sculptural Reliefs"}
            </span>
          </div>
        </div>

        {/* Quick CLI Install Pill */}
        <div className="pt-1 flex items-center gap-3">
          <div className="inline-flex items-center gap-3 bg-[#0c1813] border border-[#183425] rounded-xl px-3.5 py-1.5 text-xs font-mono text-stone-300 shadow-inner">
            <span className="text-emerald-400 font-bold">$</span>
            <span>{installCommand}</span>
            <button
              onClick={handleCopyInstall}
              className="ml-2 text-stone-400 hover:text-emerald-300 transition-colors cursor-pointer"
              title="Copy install command"
            >
              {copiedInstall ? <CheckIcon size={14} className="text-emerald-400" /> : <CopyIcon size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Showcase (Animate UI Tabbed Canvas with Extra Width) */}
      <section className="space-y-4">
        <div className="border border-[#183425] rounded-2xl bg-[#09140f] overflow-hidden shadow-2xl">
          {/* Header Bar with Tabs & Controls */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#183425] bg-[#0d1d16]">
            {/* Segmented Preview/Code Switch */}
            <div className="flex items-center gap-1 bg-[#13251c] p-1 rounded-xl border border-[#1b3d2b]">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-emerald-950/90 text-emerald-200 shadow-sm border border-emerald-600/70 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-emerald-950/90 text-emerald-200 shadow-sm border border-emerald-600/70 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Code
              </button>
            </div>

            {/* Toolbar: 3D Default vs 2D Surface Toggle */}
            <div className="flex items-center gap-3">
              {has3DMode && onToggle3D && (
                <div className="flex items-center bg-[#13251c] p-0.5 rounded-xl border border-[#1b3d2b] shadow-inner">
                  <button
                    type="button"
                    onClick={() => onToggle3D(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                      is3DMode
                        ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-100 border border-emerald-500/80 font-semibold shadow-md shadow-emerald-950/60'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="3D WebGL Mode (Default)"
                  >
                    <span>3D WebGL</span>
                    <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-emerald-600 text-white font-sans tracking-wider">Default</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle3D(false)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                      !is3DMode
                        ? 'bg-[#173022] text-emerald-100 border border-[#27533b] font-semibold shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="Switch to 2D Surface Mode"
                  >
                    2D Surface
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-stone-300 hover:text-emerald-300 bg-[#13251c] border border-[#1b3d2b] hover:border-emerald-600/60 transition-colors cursor-pointer"
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

          {/* Canvas Area: Atmospheric eerie green tinted obsidian with generous breathing room */}
          {activeTab === 'preview' ? (
            <div
              className={`relative flex items-center justify-center bg-[#09110d] bg-[radial-gradient(#1a3324_1px,transparent_1px)] [background-size:24px_24px] shadow-[inset_0_0_100px_rgba(4,10,7,0.95)] ${
                has3DMode ? 'min-h-[560px] p-8 sm:p-14' : 'min-h-[400px] p-8 sm:p-12'
              }`}
            >
              {preview}
            </div>
          ) : (
            <div className="p-6 bg-[#060e0a] overflow-x-auto font-mono text-xs text-stone-200 leading-relaxed max-h-[520px]">
              <pre className="p-3">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* Variants & States Section */}
      {variants.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-serif text-white border-b border-[#183425] pb-3">
            Variants & Presets
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {variants.map((v, i) => (
              <div key={i} className="border border-[#183425] rounded-2xl bg-[#0c1813] p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">{v.title}</h3>
                  {v.description && (
                    <p className="text-xs text-stone-400 mt-0.5">{v.description}</p>
                  )}
                </div>
                <div className="p-6 bg-[#08120e] rounded-xl border border-[#162e20] flex items-center justify-center min-h-[140px]">
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
          <h2 className="text-2xl font-bold font-serif text-white border-b border-[#183425] pb-3">
            Props
          </h2>
          <div className="border border-[#183425] rounded-2xl overflow-hidden bg-[#0c1813]">
            <table className="w-full text-left text-sm font-mono">
              <thead className="bg-[#0e2118] text-emerald-400/80 text-xs uppercase tracking-wider border-b border-[#183425]">
                <tr>
                  <th className="px-5 py-3.5">Prop</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Default</th>
                  <th className="px-5 py-3.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162e20] text-xs">
                {propsList.map((p, i) => (
                  <tr key={i} className="hover:bg-[#10241b] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-emerald-300">{p.name}</td>
                    <td className="px-5 py-3.5 text-teal-300/90">{p.type}</td>
                    <td className="px-5 py-3.5 text-stone-400">{p.default ?? '—'}</td>
                    <td className="px-5 py-3.5 text-stone-300 font-sans">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bottom Prev / Next Nav */}
      <div className="flex items-center justify-between pt-8 border-t border-[#183425] text-sm font-mono">
        {prevPage ? (
          <Link
            to={prevPage.path}
            className="group flex items-center gap-2 text-stone-400 hover:text-emerald-300 transition-colors"
          >
            <span className="text-stone-500 group-hover:-translate-x-1 transition-transform">←</span>
            <span>{prevPage.title}</span>
          </Link>
        ) : <div />}

        {nextPage && (
          <Link
            to={nextPage.path}
            className="group flex items-center gap-2 text-stone-400 hover:text-emerald-300 transition-colors ml-auto"
          >
            <span>{nextPage.title}</span>
            <span className="text-stone-500 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
