import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { GRIMOIRE_PATH, documentedRites, ritePath } from '../../pages/docs/grimoire/paths';

interface NavItem {
  title: string;
  path: string;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'GETTING STARTED',
    items: [
      { title: 'Introduction', path: '/docs/introduction' },
      { title: 'Installation', path: '/docs/installation' },
      { title: 'Design Tokens', path: '/docs/tokens' },
    ],
  },
  {
    title: 'PRIMITIVES',
    items: [
      { title: 'Button', path: '/docs/components/button' },
      { title: 'Card', path: '/docs/components/card' },
      { title: 'Badge', path: '/docs/components/badge' },
    ],
  },
  {
    title: 'CRYPT COMPONENTS',
    items: [
      { title: 'TombstoneCard', path: '/docs/components/tombstone', badge: 'Core' },
      { title: 'CoffinAccordion', path: '/docs/components/coffin-accordion' },
      { title: 'MausoleumDrawer', path: '/docs/components/mausoleum' },
      { title: 'BoneOssuaryDivider', path: '/docs/components/ossuary' },
      { title: 'ExcavationLoader', path: '/docs/components/excavation' },
      { title: 'CauldronBrew', path: '/docs/components/cauldron', badge: '3D' },
      { title: 'RunicButton', path: '/docs/components/runic-button', badge: '3D' },
      { title: 'BloodVialProgress', path: '/docs/components/blood-vial', badge: '3D' },
      { title: 'LunarPhaseSelector', path: '/docs/components/lunar-phase', badge: '3D' },
      { title: 'WitchOnBroom', path: '/docs/components/chicken-legs', badge: 'New' },
      { title: 'CobwebCorner', path: '/docs/components/cobweb', badge: '3D' },
    ],
  },
  {
    title: 'EFFECTS & FX',
    items: [
      { title: 'HorrorCursor', path: '/docs/components/horror-cursor', badge: 'New' },
      { title: 'HauntedKeyboard', path: '/docs/components/haunted-keyboard', badge: 'New' },
      { title: 'SoundLibrary', path: '/docs/components/sound-library', badge: 'New' },
      { title: 'HorrorBackground', path: '/docs/components/horror-background', badge: 'New' },
      { title: 'SoundTrigger', path: '/docs/components/sound-trigger', badge: 'New' },
      { title: 'ASCII', path: '/docs/components/ascii', badge: 'New' },
      { title: 'SurveillanceCam', path: '/docs/components/surveillance-cam', badge: 'New' },
      { title: 'Voice', path: '/docs/components/voice', badge: 'New' },
      { title: 'Scribble', path: '/docs/components/scribble', badge: 'New' },
      { title: 'Doodle', path: '/docs/components/doodle', badge: 'New' },
    ],
  },
  {
    title: 'THE GRIMOIRE',
    items: [
      { title: 'Overview', path: GRIMOIRE_PATH, badge: 'New' },
      ...documentedRites.map((rite) => ({ title: rite.name, path: ritePath(rite.id) })),
    ],
  },
];

const BESTIARY_CREATURES: { id: string; name: string; path: string }[] = [
  { id: 'ghost', name: 'Wisp (Ghost)', path: '/docs/components/bestiary/ghost' },
  { id: 'pumpkin', name: 'Jack (Pumpkin)', path: '/docs/components/bestiary/pumpkin' },
  { id: 'vampire', name: 'Lord Alucard', path: '/docs/components/bestiary/vampire' },
  { id: 'bat', name: 'Vesper (Bat)', path: '/docs/components/bestiary/bat' },
  { id: 'frankenstein', name: 'Patchwork Man', path: '/docs/components/bestiary/frankenstein' },
  { id: 'goblin', name: 'Snagtooth (Goblin)', path: '/docs/components/bestiary/goblin' },
  { id: 'mummy', name: 'Ankhef (Mummy)', path: '/docs/components/bestiary/mummy' },
  { id: 'snowman', name: 'Mr. Frost', path: '/docs/components/bestiary/snowman' },
  { id: 'yeti', name: 'Himal (Yeti)', path: '/docs/components/bestiary/yeti' },
  { id: 'candyman', name: 'The Candyman', path: '/docs/components/bestiary/candyman' },
];

export function DocsLayout() {
  const location = useLocation();

  const [bestiaryExpanded, setBestiaryExpanded] = useState(true);

  return (
    <div className="grave-docs flex-1 bg-[#08120e] text-[#e2ede6] flex flex-col font-sans selection:bg-emerald-900 selection:text-emerald-100">

      {/* Main Layout Body: Left Sidebar + Centered Spacious Content */}
      <div className="max-w-[1600px] mx-auto w-full flex flex-1 px-4 sm:px-8">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border-r border-[#162a1f] p-5 hidden md:block overflow-y-auto max-h-[calc(100vh-3.5rem)] sticky top-14 space-y-6 select-none">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <h3 className="text-[11px] font-mono font-bold tracking-wider text-emerald-500/70 px-3 uppercase">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item, iIdx) => (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-600/60 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.18)]'
                          : 'text-stone-300 hover:text-white hover:bg-[#0e1d15]'
                      }`
                    }
                  >
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#102119] text-emerald-400 border border-[#1b3a2a]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* THE BESTIARY: Clean Collapsible Subsection with Overview & 10 3D Models */}
          <div className="space-y-1.5 pt-2 border-t border-[#162a1f]">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-[11px] font-mono font-bold tracking-wider text-emerald-500/70 uppercase">
                THE BESTIARY
              </h3>
              <button
                type="button"
                onClick={() => setBestiaryExpanded(!bestiaryExpanded)}
                className="text-[10px] font-mono text-stone-500 hover:text-emerald-400 transition-colors cursor-pointer"
                title={bestiaryExpanded ? 'Collapse creatures' : 'Expand creatures'}
              >
                {bestiaryExpanded ? '▾ 10 3D' : '▸ 10 3D'}
              </button>
            </div>

            <div className="space-y-0.5">
              {/* Bestiary Overview Gallery */}
              <NavLink
                to="/docs/components/bestiary"
                end
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-600/60 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.18)]'
                      : 'text-stone-300 hover:text-white hover:bg-[#0e1d15]'
                  }`
                }
              >
                <span>Overview & Gallery</span>
              </NavLink>

              {/* 10 Dedicated 3D Showcases Sub-menu */}
              {bestiaryExpanded && (
                <div className="pt-1 pl-2 space-y-0.5 border-l border-[#183425] ml-3">
                  {BESTIARY_CREATURES.map((creature) => {
                    const isCreatureActive =
                      location.pathname === creature.path ||
                      (creature.id === 'ghost' && location.pathname === '/docs/components/bestiary/wisp');
                    return (
                      <NavLink
                        key={creature.id}
                        to={creature.path}
                        className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                          isCreatureActive
                            ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-600/60 font-bold shadow-sm shadow-cyan-950/40'
                            : 'text-stone-400 hover:text-stone-200 hover:bg-[#0d1d16]'
                        }`}
                      >
                        <span className="truncate">{creature.name}</span>
                        <span className="text-[9px] font-sans px-1 py-0.2 rounded bg-[#0a1811] text-teal-400 border border-[#132c20]">
                          3D
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Center Main Content Page (Unobstructed, full breathing room) */}
        <main className="flex-1 min-w-0 py-8 px-4 sm:px-10 max-w-5xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
