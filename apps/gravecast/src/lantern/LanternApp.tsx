import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatPage } from './chat/ChatPage'
import { HelpPage } from './help/HelpPage'
import { KitCardPage } from './KitCardPage'
import { KitPage } from './KitPage'
import { Shell } from './Shell'
import { StatusProvider } from './StatusProvider'
import { ToolPage } from './tools/ToolPage'
import { ToolsPage } from './tools/ToolsPage'

/** The installable Lantern: the survival kit, tools, help near you, and Chat. It shares no code with the website's pages. */
export function LanternApp() {
  return (
    <BrowserRouter basename="/lantern">
      <StatusProvider>
        <Shell>
          <Routes>
            <Route index element={<Navigate to="/kit" replace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="kit" element={<KitPage />} />
            <Route path="kit/:slug" element={<KitCardPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="tools/:slug" element={<ToolPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </StatusProvider>
    </BrowserRouter>
  )
}