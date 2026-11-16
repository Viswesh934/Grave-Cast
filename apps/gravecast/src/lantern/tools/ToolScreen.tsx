import { useEffect, type ReactNode } from 'react'
import { ui } from '../ui'
import { TOOLS_NOTICE, type ToolInfo } from './tools'

/** One tool's screen: its name, what it does, the tool itself, and the draft notice. */
export function ToolScreen({ tool, children }: { tool: ToolInfo; children: ReactNode }) {
  useEffect(() => {
    document.title = `${tool.name} \u00b7 Gravecast Lantern`
  }, [tool.name])
  return (
    <>
      <p className={ui.eyebrow}>Tools</p>
      <h1 className={`${ui.h1} mt-2`}>{tool.name}</h1>
      <p className={ui.lead}>{tool.summary}</p>
      <div className="mt-5">{children}</div>
      <p className={`${ui.muted} mt-8 mb-0`}>{TOOLS_NOTICE}</p>
    </>
  )
}
