import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ui } from '../ui'
import { TOOLS, TOOLS_NOTICE } from './tools'

/** Every tool, one tap away. They all work with no internet. */
export function ToolsPage() {
  useEffect(() => {
    document.title = 'Tools \u00b7 Gravecast Lantern'
  }, [])
  return (
    <>
      <h1 className={ui.h1}>Tools</h1>
      <p className={ui.lead}>They all work with no internet.</p>
      <ul className="mt-5 mb-0 grid list-none gap-2 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <li key={tool.slug}>
            <Link to={`/tools/${tool.slug}`} className={`${ui.cardLink} h-full`}>
              <span className="min-w-0">
                <span className="block text-base font-semibold">{tool.name}</span>
                <span className={`${ui.muted} block`}>{tool.summary}</span>
              </span>
              <span aria-hidden className={ui.arrow}>
                {'\u203a'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className={`${ui.muted} mt-6 mb-0`}>{TOOLS_NOTICE}</p>
    </>
  )
}
