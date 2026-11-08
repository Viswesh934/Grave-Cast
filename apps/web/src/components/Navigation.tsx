import { type Page } from '../App';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const pages: { id: Page; label: string }[] = [
    { id: 'welcome', label: '🏠 Welcome' },
    { id: 'tokens', label: '🎨 Tokens' },
    { id: 'hooks', label: '🪝 Hooks' },
    { id: 'primitives', label: '🧱 Primitives' },
    { id: 'crypt', label: '⚰️ Crypt' },
  ];

  return (
    <nav className="border-b border-stone-800 bg-stone-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold">
            <span className="text-stone-100">Grave-UI</span>
            <span className="text-stone-600 text-sm ml-2">v0.1.0</span>
          </h1>
          <div className="flex gap-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => onPageChange(page.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page.id
                    ? 'bg-stone-800 text-stone-100'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/50'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
