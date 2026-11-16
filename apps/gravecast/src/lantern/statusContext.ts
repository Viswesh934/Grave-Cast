import { createContext, useContext } from 'react'
import type { OfflineState } from './useAppStatus'

/** What every screen needs to know about the app itself: the connection, offline use, and install. */
export interface AppStatus {
  online: boolean
  offline: OfflineState
  installed: boolean
  canPrompt: boolean
  install: () => Promise<void>
}

export const AppStatusContext = createContext<AppStatus | null>(null)

export function useStatus(): AppStatus {
  const status = useContext(AppStatusContext)
  if (!status) throw new Error('useStatus must be used inside StatusProvider')
  return status
}