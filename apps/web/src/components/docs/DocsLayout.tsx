import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { PumpkinIcon, SearchIcon, VolumeIcon, GitHubIcon } from './DocsIcons';
import { CommandPalette } from './CommandPalette';
import { playSound } from 'groove-ui';

interface NavGroup {
  title: string;
  items: { title: string; path: string; icon?: string; badge?: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'GETTING STARTED',
    items: [
      { title: 'Introduction', path: '/docs/introduction', icon: '📖' },
      { title: 'Installation', path: '/docs/installation', icon: '⚡' },
      { title: 'Design Tokens', path: '/docs/tokens', icon: '🎨' },
      { title: 'Web Audio Synth', path: '/docs/audio', icon: '🔊' },
    ],
  },
  {
    title: 'PRIMITIVES',
    items: [
      { title: 'Button', path: '/docs/components/button', icon: '🔘' },
      { title: 'Card', path: '/docs/components/card', icon: '🃏' },
      { title: 'Badge', path: '/docs/components/badge', icon: '🏷️' },
    ],
  },
  {
    title: 'THE CRYPT (GRAVES)',
    items: [
      { title: 'TombstoneCard', path: '/docs/components/tombstone', icon: '🪦', badge: 'Core' },
      { title: 'ExcavationLoader', path: '/docs/components/excavation', icon: '🦴' },
      { title: 'BoneOssuaryDivider', path: '/docs/components/ossuary', icon: '💀' },
      { title: 'MausoleumDrawer', path: '/docs/components/mausoleum', icon: '🚪' },
      { title: 'CoffinAccordion', path: '/docs/components/coffin-accordion', icon: '⚰️' },
    ],
  },
  {
    title: 'THE COVEN (WITCHES)',
    items: [
      { title: 'CauldronBrew', path: '/docs/components/cauldron', icon: '🧪', badge: 'New' },
      { title: 'RunicButton', path: '/docs/components/runic-button', icon: 'ᚦ' },
    ],
  },
  {
    title: 'THE SANGUINE (VAMPIRES)',
    items: [
      { title: 'BloodVialProgress', path: '/docs/components/blood-vial', icon: '🩸', badge: 'New' },
    ],
  },
  {
    title: 'THE LYCAN (WEREWOLVES)',
    items: [
      { title: 'LunarPhaseSelector', path: '/docs/components/lunar-phase', icon: '🌕', badge: 'New' },
    ],
  },
  {
    title: 'THE SLAVIC (BABA YAGA)',
    items: [
      { title: 'ChickenLegStepper', path: '/docs/components/chicken-legs', icon: '🏚️', badge: 'New' },
    ],
  },
  {
    title: 'THE ARACHNID (WEBS)',
    items: [
      { title: 'CobwebCorner', path: '/docs/components/cobweb', icon: '🕸️', badge: 'New' },
    ],
  },
];

export function DocsLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const location = useLocation();

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playSound('coffinCreak');
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#e8e0d5] flex flex-col font-sans">
      {/* Command Palette */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Top Header (Sticky frosted glass navbar) */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1c1e2b] bg-[#090a0f]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
          {/* Brand Logo & Version */}
          <div className="flex items-center gap-6">
            <NavLink to="/docs/introduction" className="flex items-center gap-2.5 group">
              <PumpkinIcon size={26} className="filter drop-shadow-[0_0_8px_rgba(245,124,0,0.6)] group-hover:scale-110 transition-transform" />
              <span className="font-serif font-bold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Grave UI
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60">
                v0.1.0
              </span>
            </NavLink>

            {/* Quick Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-stone-400">
              <NavLink
                to="/docs/introduction"
                className={({ isActive }) =>
                  `hover:text-white transition-colors ${isActive ? 'text-white font-semibold' : ''}`
                }
              >
                Docs
              </NavLink>
              <NavLink
                to="/docs/components/tombstone"
                className={({ isActive }) =>
                  `hover:text-white transition-colors ${isActive ? 'text-white font-semibold' : ''}`
                }
              >
                Components
              </NavLink>
              <NavLink
                to="/docs/tokens"
                className={({ isActive }) =>
                  `hover:text-white transition-colors ${isActive ? 'text-white font-semibold' : ''}`
                }
              >
                Tokens
              </NavLink>
              <NavLink
                to="/docs/audio"
                className={({ isActive }) =>
                  `hover:text-white transition-colors ${isActive ? 'text-white font-semibold' : ''}`
                }
              >
                Audio Synth
              </NavLink>
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Search Trigger Input */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#13151f] hover:bg-[#1a1c2a] border border-[#232536] text-xs font-mono text-stone-400 transition-all cursor-pointer shadow-inner w-44 sm:w-60 justify-between"
            >
              <div className="flex items-center gap-2">
                <SearchIcon size={14} className="text-stone-400" />
                <span className="truncate">Search docs...</span>
              </div>
              <kbd className="text-[10px] bg-[#1d1f2e] border border-[#313548] px-1.5 py-0.5 rounded text-stone-400">
                ⌘K
              </kbd>
            </button>

            {/* Audio Synth Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:border-purple-500'
                  : 'bg-[#13151f] border-[#232536] text-stone-500 hover:text-stone-300'
              }`}
              title={soundEnabled ? 'Web Audio SFX: Active' : 'Web Audio SFX: Muted'}
            >
              <VolumeIcon size={16} muted={!soundEnabled} />
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/yourusername/grave-cast"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-[#13151f] hover:bg-[#1a1c2a] border border-[#232536] text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="GitHub repository"
            >
              <GitHubIcon size={16} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="max-w-7xl mx-auto w-full flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border-r border-[#1a1c28] p-5 hidden md:block overflow-y-auto max-h-[calc(100vh-3.5rem)] sticky top-14 space-y-7 select-none">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <h3 className="text-[11px] font-mono font-bold tracking-wider text-stone-500 px-3 uppercase">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item, iIdx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-red-950/70 text-red-200 border border-red-800/60 font-semibold shadow-sm'
                          : 'text-stone-400 hover:text-white hover:bg-[#131520]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {item.icon && <span>{item.icon}</span>}
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#1e202e] text-stone-400 border border-[#2b2e40]">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Center Main Content Page */}
        <main className="flex-1 min-w-0 py-2">
          <Outlet />
        </main>

        {/* Right Table of Contents ("On this page") */}
        <aside className="w-56 shrink-0 p-6 hidden xl:block sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto text-xs space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-wider text-stone-400 font-bold">
            On this page
          </div>
          <ul className="space-y-2 text-stone-400 border-l border-[#222434] pl-3">
            <li>
              <a href="#overview" className="hover:text-white transition-colors block">
                Overview
              </a>
            </li>
            <li>
              <a href="#preview" className="hover:text-white transition-colors block text-red-400 font-medium">
                Interactive Preview
              </a>
            </li>
            <li>
              <a href="#variants" className="hover:text-white transition-colors block">
                Variants & States
              </a>
            </li>
            <li>
              <a href="#props" className="hover:text-white transition-colors block">
                Props Reference
              </a>
            </li>
          </ul>

          <div className="pt-6 border-t border-[#1f2130] space-y-2">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider block">
              Halloween Lore
            </span>
            <div className="p-3 rounded-xl bg-[#11121a] border border-[#202231] text-[11px] text-stone-400 space-y-1">
              <span className="text-amber-400 font-semibold block">🎃 Pumpkin Mode</span>
              <p className="leading-tight text-[10px]">
                Components designed for gothic graveyards, ancient covens, and eerie folklore.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

