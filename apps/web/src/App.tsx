/**
 * Grave-UI Showcase Application
 * Interactive demonstration of all Grave-UI components
 */

import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { PrimitivesShowcase } from './pages/PrimitivesShowcase';
import { CryptShowcase } from './pages/CryptShowcase';
import { TokensShowcase } from './pages/TokensShowcase';
import { HooksShowcase } from './pages/HooksShowcase';
import { Welcome } from './pages/Welcome';

export type Page = 'welcome' | 'tokens' | 'hooks' | 'primitives' | 'crypt';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');

  console.log('App rendering, currentPage:', currentPage);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div style={{ border: '2px solid red', padding: '20px' }}>
          <p style={{ color: 'yellow', fontSize: '24px' }}>Current page: {currentPage}</p>
          {currentPage === 'welcome' && <Welcome onNavigate={setCurrentPage} />}
          {currentPage === 'tokens' && <TokensShowcase />}
          {currentPage === 'hooks' && <HooksShowcase />}
          {currentPage === 'primitives' && <PrimitivesShowcase />}
          {currentPage === 'crypt' && <CryptShowcase />}
        </div>
      </main>

      <footer className="border-t border-stone-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-stone-600 text-sm">
          <p>🎃 Grave-UI v0.1.0 - A horror-themed component library</p>
          <p className="mt-2">Built for Gravecast</p>
        </div>
      </footer>
    </div>
  );
}
