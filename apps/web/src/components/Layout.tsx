import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
      ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-600/60 shadow-lg shadow-emerald-950/60 font-semibold'
      : 'text-stone-300 hover:bg-[#102219] hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-[#08120e] text-[#e2ede6] flex">
      {/* Vertical Sidebar */}
      <aside className="w-64 bg-[#091510] border-r border-[#162a1f] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#162a1f]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-400 shadow-inner">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2L4 7v10l8 5 8-5V7L12 2z" />
                <path d="M12 6v12M8 10h8" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-serif">
                Grave UI
              </h1>
              <p className="text-[10px] text-emerald-400/80 font-mono uppercase tracking-widest">
                Grave Design System
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[11px] font-semibold text-emerald-500/70 uppercase tracking-wider px-3 py-2 font-mono">
            Showcase
          </div>
          <NavLink to="/primitives" className={navLinkClass}>
            Primitives
          </NavLink>
          <NavLink to="/crypt" className={navLinkClass}>
            Crypt Components
          </NavLink>
          <NavLink to="/tokens" className={navLinkClass}>
            Design Tokens
          </NavLink>
          <NavLink to="/hooks" className={navLinkClass}>
            Hooks & Audio
          </NavLink>
        </nav>

        <div className="p-4 border-t border-[#162a1f] space-y-2">
          <a
            href="https://github.com/yourusername/grave-cast"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center px-4 py-2 bg-[#0c1813] hover:bg-[#12251c] text-stone-300 hover:text-emerald-300 rounded-xl transition-colors text-xs font-medium border border-[#183425]"
          >
            GitHub Repository
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#08120e] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
