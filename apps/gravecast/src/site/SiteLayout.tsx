import { Outlet } from 'react-router-dom'
import { HauntedScrollbar } from 'groove-ui'
import { SiteHeader } from './SiteHeader'

/** Every page: the shared top bar, then the page. */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <Outlet />
      <HauntedScrollbar variant="ectoplasm" />
    </div>
  )
}