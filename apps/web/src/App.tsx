import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DocsLayout } from './components/docs/DocsLayout';
import { docsRoutes } from './routes/DocsRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DocsLayout />}>
          {docsRoutes()}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
