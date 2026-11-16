import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lantern.css'
import { LanternApp } from './LanternApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanternApp />
  </StrictMode>,
)