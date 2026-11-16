import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatPage } from './chat/ChatPage'
import { KitCardPage } from './KitCardPage'
import { KitIndex } from './KitIndex'
import { Shell } from './Shell'

/** The installable Emergency section. It lives under /emergency and shares no code with the website. */
export function EmergencyApp() {
  return (
    <BrowserRouter basename="/emergency">
      <Shell>
        <Routes>
          <Route index element={<KitIndex />} />
          <Route path="kit/:slug" element={<KitCardPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}