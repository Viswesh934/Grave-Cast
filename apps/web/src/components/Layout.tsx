import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
      ? 'bg-grave-crimson-600 text-grave-bone-100 shadow-lg shadow-red-950/60 font-semibold'
      : 'text-grave-mist-300 hover:bg-grave-dark-800 hover:text-grave-bone-100'
    }`;

  return (
    <div className="min-h-screen bg-grave-dark-900 text-grave-bone-200 flex">
      {/* Vertical Sidebar */}
      <aside className="w-64 bg-grave-dark-950 border-r border-grave-dark-700 flex flex-col shrink-0">
        <div className="p-6 border-b border-grave-dark-700">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label="Grave">⚰️</span>
            <div>
              <h1 className="text-xl font-bold text-grave-bone-100 tracking-tight">
                Grave UI
              </h1>
              <p className="text-xs text-grave-mist-400 mt-0.5 font-mono uppercase tracking-wider">
                Spooky Design System
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-semibold text-grave-mist-500 uppercase tracking-wider px-4 py-2">
            Showcase
          </div>
          <NavLink to="/primitives" className={navLinkClass}>
            🧱 Primitives
          </NavLink>
          <NavLink to="/crypt" className={navLinkClass}>
            🪦 Crypt Components
          </NavLink>
          <NavLink to="/tokens" className={navLinkClass}>
            🎨 Design Tokens
          </NavLink>
          <NavLink to="/hooks" className={navLinkClass}>
            🪝 Hooks & Audio
          </NavLink>
        </nav>

        <div className="p-4 border-t border-grave-dark-700/80 space-y-2">          <a
          href="https://github.com/yourusername/grave-cast"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center px-4 py-2 bg-grave-dark-800 hover:bg-grave-dark-700 text-grave-bone-200 rounded-lg transition-colors text-xs font-medium border border-grave-dark-700"
        >
          GitHub Repository
        </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-grave-dark-900 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
