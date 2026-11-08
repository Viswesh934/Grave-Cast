import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-grave-dark-900 flex">
      {/* Vertical Sidebar */}
      <aside className="w-64 bg-grave-dark-950 border-r border-grave-dark-700 flex flex-col">
        <div className="p-6 border-b border-grave-dark-700">
          <h1 className="text-2xl font-bold text-grave-bone-100">
            Groove UI
          </h1>
          <p className="text-sm text-grave-mist-400 mt-1">
            Horror Component Library
          </p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <NavLink
              to="/primitives"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-grave-crimson-500 text-grave-bone-100'
                    : 'text-grave-mist-300 hover:bg-grave-dark-800 hover:text-grave-bone-100'
                }`
              }
            >
              Primitives
            </NavLink>
            <NavLink
              to="/crypt"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-grave-crimson-500 text-grave-bone-100'
                    : 'text-grave-mist-300 hover:bg-grave-dark-800 hover:text-grave-bone-100'
                }`
              }
            >
              Crypt Components
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-grave-dark-700">
          <a
            href="https://www.npmjs.com/package/groove-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center px-4 py-2 bg-grave-crimson-600 hover:bg-grave-crimson-500 text-grave-bone-100 rounded-lg transition-colors text-sm"
          >
            View on npm
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
