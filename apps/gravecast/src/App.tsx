import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AudioProvider } from 'groove-ui'
import { DocsLayout } from './docs/components/docs/DocsLayout'
import { docsRoutes } from './docs/routes/DocsRoutes'
import { HomePage } from './home/HomePage'
import { RepoGraveyardPage } from './repograve/RepoGraveyardPage'
import { SiteLayout } from './site/SiteLayout'

/** Sound is on from the start. Browsers hold it until the visitor's first click or key. */
export function App() {
  return (
    <AudioProvider initialEnabled>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="dev" element={<RepoGraveyardPage />} />
            <Route element={<DocsLayout />}>{docsRoutes()}</Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AudioProvider>
  )
}