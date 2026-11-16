import { useCallback, useEffect, useState } from 'react'
import { createEcho, fetchEchoList, type EchoInfo } from '../../shared/channel'
import { BUILTIN_ECHOES, ECHO_NAME_PATTERN, MAX_FOLLOWED_ECHOES, META_KEYS } from '../../shared/channelContract'
import { getMeta, setMeta } from './db'

/** What the built-in echoes are for, until the server's list arrives. */
const BUILTIN_LIST: EchoInfo[] = [
  { name: 'EMERGENCY', about: 'For real warnings and help.', builtin: true, createdAt: null },
  { name: 'DEMO', about: 'For testing. Say hello here.', builtin: true, createdAt: null },
]

const isBuiltin = (name: string) => (BUILTIN_ECHOES as readonly string[]).includes(name)

interface CachedList {
  echoes: EchoInfo[]
  room: number
}

/**
 * Chat's channels: the server's list (kept on the phone for offline use), the
 * ones this phone follows, and joining, leaving and creating. Following a
 * channel is what makes mail runs fetch it.
 */
export function useChannels() {
  const [list, setList] = useState<EchoInfo[]>(BUILTIN_LIST)
  const [room, setRoom] = useState<number | null>(null)
  const [joined, setJoined] = useState<string[]>([])
  const [listError, setListError] = useState<string | null>(null)

  const refreshList = useCallback(async () => {
    const result = await fetchEchoList()
    if (!result.ok) {
      setListError(navigator.onLine ? result.reason : null)
      return
    }
    setListError(null)
    setList(result.value.echoes)
    setRoom(result.value.room)
    await setMeta(META_KEYS.echoList, result.value satisfies CachedList)
  }, [])

  useEffect(() => {
    let live = true
    void (async () => {
      const [cached, saved] = await Promise.all([getMeta<CachedList>(META_KEYS.echoList), getMeta<string[]>(META_KEYS.joined)])
      if (!live) return
      if (cached?.echoes?.length) {
        setList(cached.echoes)
        setRoom(cached.room)
      }
      setJoined(saved ?? [])
      if (navigator.onLine) void refreshList()
    })()
    return () => {
      live = false
    }
  }, [refreshList])

  const saveJoined = useCallback(async (next: string[]) => {
    setJoined(next)
    await setMeta(META_KEYS.joined, next)
  }, [])

  /** Follows a channel, so mail runs fetch it. The built-in echoes are always followed. */
  const join = useCallback(
    async (name: string): Promise<string | null> => {
      if (isBuiltin(name) || joined.includes(name)) return null
      if (BUILTIN_ECHOES.length + joined.length >= MAX_FOLLOWED_ECHOES) return `You can follow up to ${MAX_FOLLOWED_ECHOES} channels. Leave one first.`
      await saveJoined([...joined, name])
      return null
    },
    [joined, saveJoined],
  )

  const leave = useCallback(async (name: string) => saveJoined(joined.filter((n) => n !== name)), [joined, saveJoined])

  /** Creates a channel and follows it. Returns the channel's name, or why it couldn't be made. */
  const create = useCallback(
    async (rawName: string, about: string): Promise<{ ok: true; name: string } | { ok: false; reason: string }> => {
      const name = rawName.trim().toUpperCase()
      if (!ECHO_NAME_PATTERN.test(name)) return { ok: false, reason: 'Use 2 to 20 capital letters, digits, dashes or underscores, starting with a letter.' }
      if (!navigator.onLine) return { ok: false, reason: 'Creating a channel needs a connection. Try again when you are online.' }
      const result = await createEcho(name, about.trim())
      if (!result.ok) return { ok: false, reason: result.reason }
      setList((now) => (now.some((e) => e.name === result.value.name) ? now : [...now, result.value]))
      setRoom((now) => (now === null ? now : Math.max(0, now - 1)))
      const problem = await join(result.value.name)
      void refreshList()
      return problem ? { ok: false, reason: problem } : { ok: true, name: result.value.name }
    },
    [join, refreshList],
  )

  const followed = [...BUILTIN_ECHOES, ...joined]
  return { list, room, joined, followed, listError, isBuiltin, join, leave, create, refreshList }
}
