import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CopyIcon, CheckIcon, SparklesIcon } from './DocsIcons';
import { CobwebCorner } from 'groove-ui';

export interface PropItem {
  name: string;
  type: string;
  default?: string;
  description: string;
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
}: ComponentDocPageProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [keyReset, setKeyReset] = useState(0);

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
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-red-950/60 text-red-300 border border-red-800/60">
            {category}
          </span>
        </div>

        <p className="text-base text-grave-mist-300 max-w-2xl leading-relaxed">
          {description}
        </p>

        {/* Quick CLI Install Pill */}
        <div className="pt-2 flex items-center gap-3">
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
        <div className="border border-[#222434] rounded-2xl bg-[#0d0e14] overflow-hidden shadow-2xl">
          {/* Header Bar with Tabs & Controls */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#222434] bg-[#11121a]">
            {/* Segmented Preview/Code Switch */}
            <div className="flex items-center gap-1 bg-[#181a26] p-1 rounded-lg border border-[#282a3d]">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-red-950 text-red-200 shadow-sm border border-red-800/60 font-semibold'
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
                    ? 'bg-red-950 text-red-200 shadow-sm border border-red-800/60 font-semibold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Code
              </button>
            </div>

            {/* Toolbar Buttons */}
            <div className="flex items-center gap-2">
              {activeTab === 'preview' && (
                <button
                  type="button"
                  onClick={() => setKeyReset((k) => k + 1)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-stone-400 hover:text-white bg-[#181a26] border border-[#282a3d] hover:border-stone-500 transition-colors cursor-pointer"
                  title="Re-mount component"
                >
                  <SparklesIcon size={13} />
                  <span>Re-render</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-stone-300 hover:text-white bg-[#181a26] border border-[#282a3d] hover:border-stone-500 transition-colors cursor-pointer"
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

          {/* Canvas Area */}
          {activeTab === 'preview' ? (
            <div
              key={keyReset}
              className="relative min-h-[340px] flex items-center justify-center p-8 bg-[radial-gradient(#1f2233_1px,transparent_1px)] [background-size:16px_16px] bg-[#0c0d13]"
            >
              {preview}
            </div>
          ) : (
            <div className="p-4 bg-[#08090d] overflow-x-auto font-mono text-xs text-stone-300 leading-relaxed max-h-[460px]">
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

      {/* Props & API Reference Table */}
      {propsList.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-serif text-grave-bone-100 border-b border-[#222434] pb-3">
            Props & API Reference
          </h2>
          <div className="border border-[#222434] rounded-xl overflow-hidden bg-[#0e0f16]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#141622] text-xs font-mono uppercase tracking-wider text-grave-mist-400 border-b border-[#222434]">
                <tr>
                  <th className="py-3 px-4">Prop</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Default</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1c2b] font-mono text-xs">
                {propsList.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#141520] transition-colors">
                    <td className="py-3 px-4 font-bold text-red-400">{p.name}</td>
                    <td className="py-3 px-4 text-purple-300">{p.type}</td>
                    <td className="py-3 px-4 text-stone-400">{p.default || '-'}</td>
                    <td className="py-3 px-4 text-stone-300 font-sans text-xs">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pagination Footer (Previous / Next) */}
      <div className="pt-8 border-t border-[#222434] flex justify-between items-center text-sm">
        {prevPage ? (
          <Link
            to={prevPage.path}
            className="flex flex-col text-left group p-3 rounded-xl border border-[#222434] hover:border-red-800 bg-[#0f1017] transition-all"
          >
            <span className="text-xs text-grave-mist-400 font-mono">← Previous</span>
            <span className="font-semibold text-grave-bone-100 group-hover:text-red-400 transition-colors">
              {prevPage.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextPage && (
          <Link
            to={nextPage.path}
            className="flex flex-col text-right group p-3 rounded-xl border border-[#222434] hover:border-red-800 bg-[#0f1017] transition-all"
          >
            <span className="text-xs text-grave-mist-400 font-mono">Next →</span>
            <span className="font-semibold text-grave-bone-100 group-hover:text-red-400 transition-colors">
              {nextPage.title}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

