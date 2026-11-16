import { useEffect, useState, useSyncExternalStore } from 'react'

const subscribeOnline = (notify: () => void) => {
  window.addEventListener('online', notify)
  window.addEventListener('offline', notify)
  return () => {
    window.removeEventListener('online', notify)
    window.removeEventListener('offline', notify)
  }
}

/** Whether the device says it has a network connection. */
export const useOnline = (): boolean =>
  useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  )

/**
 * `saving` while the guides are being kept on the device, `ready` once they are,
 * `failed` if that didn't work, `unsupported` where the browser can't do it,
 * and `dev` while the app is running from the development server.
 */
export type OfflineState = 'unsupported' | 'dev' | 'saving' | 'ready' | 'failed'

const SERVICE_WORKER_URL = '/emergency/sw.js'
const SERVICE_WORKER_SCOPE = '/emergency/'

const initialOfflineState = (): OfflineState => {
  if (!('serviceWorker' in navigator)) return 'unsupported'
  return import.meta.env.DEV ? 'dev' : 'saving'
}

/** Turns on offline use and reports whether the guides are saved on this device. */
export function useOfflineReady(): OfflineState {
  const [state, setState] = useState<OfflineState>(initialOfflineState)

  useEffect(() => {
    if (state !== 'saving') return
    let live = true
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: SERVICE_WORKER_SCOPE })
      // `ready` waits for the worker to finish saving the files.
      .then(() => navigator.serviceWorker.ready)
      .then(() => live && setState('ready'))
      .catch(() => live && setState('failed'))
    // Ask the browser to keep the guides rather than clear them when space runs low.
    void navigator.storage?.persist?.()
    return () => {
      live = false
    }
  }, [state])

  return state
}