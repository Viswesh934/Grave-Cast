import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, PumpkinIcon } from './DocsIcons';

interface SearchItem {
  id: string;
  title: string;
  category: string;
  path: string;
  icon: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Getting started
  { id: 'intro', title: 'Introduction', category: 'Getting Started', path: '/docs/introduction', icon: '📖' },
  { id: 'install', title: 'Installation & Setup', category: 'Getting Started', path: '/docs/installation', icon: '⚡' },
  { id: 'tokens', title: 'Design Tokens', category: 'Getting Started', path: '/docs/tokens', icon: '🎨' },
  { id: 'audio', title: 'Web Audio Synth', category: 'Getting Started', path: '/docs/audio', icon: '🔊' },

  // Primitives
  { id: 'btn', title: 'Button', category: 'Primitives', path: '/docs/components/button', icon: '🔘' },
  { id: 'card', title: 'Card', category: 'Primitives', path: '/docs/components/card', icon: '🃏' },
  { id: 'badge', title: 'Badge', category: 'Primitives', path: '/docs/components/badge', icon: '🏷️' },

  // The Crypt
  { id: 'tombstone', title: 'TombstoneCard', category: 'The Crypt', path: '/docs/components/tombstone', icon: '🪦' },
  { id: 'excavation', title: 'ExcavationLoader', category: 'The Crypt', path: '/docs/components/excavation', icon: '🦴' },
  { id: 'ossuary', title: 'BoneOssuaryDivider', category: 'The Crypt', path: '/docs/components/ossuary', icon: '💀' },
  { id: 'drawer', title: 'MausoleumDrawer', category: 'The Crypt', path: '/docs/components/mausoleum', icon: '🚪' },
  { id: 'coffin', title: 'CoffinAccordion', category: 'The Crypt', path: '/docs/components/coffin-accordion', icon: '⚰️' },

  // The Coven
  { id: 'cauldron', title: 'CauldronBrew', category: 'The Coven', path: '/docs/components/cauldron', icon: '🧪' },
  { id: 'runic', title: 'RunicButton', category: 'The Coven', path: '/docs/components/runic-button', icon: 'ᚦ' },

  // The Sanguine
  { id: 'blood', title: 'BloodVialProgress', category: 'The Sanguine', path: '/docs/components/blood-vial', icon: '🩸' },

  // The Lycan
  { id: 'lunar', title: 'LunarPhaseSelector', category: 'The Lycan', path: '/docs/components/lunar-phase', icon: '🌕' },

  // The Slavic
  { id: 'chicken', title: 'ChickenLegStepper', category: 'The Slavic', path: '/docs/components/chicken-legs', icon: '🏚️' },

  // The Arachnid
  { id: 'cobweb', title: 'CobwebCorner', category: 'The Arachnid', path: '/docs/components/cobweb', icon: '🕸️' },
];

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  const filtered = SEARCH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-[#11121b] border border-[#2b2d3d] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#222434] bg-[#141622]">
          <SearchIcon size={18} className="text-red-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spooky components, folklore archetypes..."
            className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-stone-500 outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1c1e2d] border border-[#313548] text-stone-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-stone-400">
              No forbidden components found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.path)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1a1c29] cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-grave-bone-100 group-hover:text-red-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-grave-mist-400">
                      {item.category}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono text-stone-500 group-hover:text-stone-300">
                  Jump →
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#1f2130] bg-[#0c0d13] flex items-center justify-between text-[11px] font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <PumpkinIcon size={14} />
            <span>Grave UI Command Search</span>
          </div>
          <span>Navigation: Click or Enter</span>
        </div>
      </div>
    </div>
  );
}

