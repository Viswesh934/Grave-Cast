import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './emergency.css'
import { EmergencyApp } from './EmergencyApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmergencyApp />
  </StrictMode>,
)