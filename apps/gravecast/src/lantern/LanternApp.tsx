import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AccessPage } from './access/AccessPage'
import { BlindPage } from './access/BlindPage'
import { DeafPage } from './access/DeafPage'
import { DistressSignal } from './access/DistressSignal'
import { ChatPage } from './chat/ChatPage'
import { HelpPage } from './help/HelpPage'
import { KitCardPage } from './KitCardPage'
import { KitPage } from './KitPage'
import { RadioPage } from './radio/RadioPage'
import { Shell } from './Shell'
import { StatusProvider } from './StatusProvider'
import { ToolPage } from './tools/ToolPage'
import { ToolsPage } from './tools/ToolsPage'

/** The installable Lantern: the survival kit, tools, help near you, Chat, Radio, Access (small aids) and Help near you. It shares no code with the website's pages. */
export function LanternApp() {
  return (
    <BrowserRouter basename="/lantern">
      <StatusProvider>
        <Shell>
          <Routes>
            <Route index element={<Navigate to="/kit" replace />} />
            <Route path="access" element={<AccessPage />} />
            <Route path="access/blind" element={<BlindPage />} />
            <Route path="access/deaf" element={<DeafPage />} />
            <Route path="access/braille" element={<Navigate to="/access/blind" replace />} />
            <Route path="access/talk" element={<Navigate to="/access/deaf" replace />} />
            <Route path="access/phrases" element={<Navigate to="/access/deaf" replace />} />
            <Route path="board/*" element={<Navigate to="/access" replace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="kit" element={<KitPage />} />
            <Route path="kit/:slug" element={<KitCardPage />} />
            <Route path="radio" element={<RadioPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="tools/:slug" element={<ToolPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <DistressSignal />
        </Shell>
      </StatusProvider>
    </BrowserRouter>
  )
}