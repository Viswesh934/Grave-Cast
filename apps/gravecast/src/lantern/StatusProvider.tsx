import type { ReactNode } from 'react'
import { AppStatusContext } from './statusContext'
import { useOfflineReady, useOnline } from './useAppStatus'
import { useInstall } from './useInstall'

/** Starts offline use once, and shares the app's status with every screen. */
export function StatusProvider({ children }: { children: ReactNode }) {
  const online = useOnline()
  const offline = useOfflineReady()
  const { installed, canPrompt, install } = useInstall()
  return <AppStatusContext.Provider value={{ online, offline, installed, canPrompt, install }}>{children}</AppStatusContext.Provider>
}