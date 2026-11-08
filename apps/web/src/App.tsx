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

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {currentPage === 'welcome' && <Welcome onNavigate={setCurrentPage} />}
        {currentPage === 'tokens' && <TokensShowcase />}
        {currentPage === 'hooks' && <HooksShowcase />}
        {currentPage === 'primitives' && <PrimitivesShowcase />}
        {currentPage === 'crypt' && <CryptShowcase />}
      </main>
    </div>
  );
}
