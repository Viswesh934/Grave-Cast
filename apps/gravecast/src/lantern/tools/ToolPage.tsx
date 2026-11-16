import type { ComponentType } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CompassTool } from './CompassTool'
import { CprBeatTool } from './CprBeatTool'
import { HelpMessageTool } from './HelpMessageTool'
import { LightningTool } from './LightningTool'
import { SosLightTool } from './SosLightTool'
import { SosSoundTool } from './SosSoundTool'
import { ToolScreen } from './ToolScreen'
import { findTool, type ToolSlug } from './tools'

const BODIES: Record<ToolSlug, ComponentType> = {
  'sos-light': SosLightTool,
  'sos-sound': SosSoundTool,
  'cpr-beat': CprBeatTool,
  'help-message': HelpMessageTool,
  compass: CompassTool,
  lightning: LightningTool,
}

/** /tools/:slug: one tool. An unknown address goes back to the list. */
export function ToolPage() {
  const tool = findTool(useParams().slug)
  if (!tool) return <Navigate to="/tools" replace />
  const Body = BODIES[tool.slug]
  return (
    <ToolScreen tool={tool}>
      <Body key={tool.slug} />
    </ToolScreen>
  )
}
