import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PrimitivesPage } from './pages/PrimitivesPage';
import { CryptPage } from './pages/CryptPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/primitives" replace />} />
          <Route path="primitives" element={<PrimitivesPage />} />
          <Route path="crypt" element={<CryptPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
