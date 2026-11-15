import { useEffect, useRef, useState, type FormEvent } from 'react'
import { HauntedDiary, RiteInput, RunicButton, useAriaAnnounce, useHauntedTyping, useSpookyAudio } from 'groove-ui'
import { DIARY_ENTRIES, DIARY_SILENT_TEXT, DIARY_STORAGE_KEY, DIARY_WRONG_REPLIES } from '../diary/entries'
import { checkLinkOnDevice, SEVERITY_ORDER, verdictFor, type Grave, type LinkSummary } from '../linkscan/deviceChecks'
import { hostOf, scanOnServer, type ServerScan } from '../linkscan/serverScan'
import { Graveyard } from './Graveyard'

export interface CheckedLink {
  link: LinkSummary
  graves: Grave[]
  /** What the server found, or null when it couldn't check. */
  server: ServerScan | null
  /** Why the server couldn't check, in plain words. */
  serverProblem: string | null
}

/** Adds the server's findings to the device's, most serious first. */
const scanLink = async (link: LinkSummary, deviceGraves: Grave[], signal: AbortSignal): Promise<CheckedLink> => {
  const result = await scanOnServer(link.href, signal)
  const graves = result.ok ? [...deviceGraves, ...result.scan.graves] : deviceGraves
  graves.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
  return {
    link,
    graves,
    server: result.ok ? result.scan : null,
    serverProblem: result.ok ? null : result.reason,
  }
}

/**
 * The main action: paste a link and check it. While the scan runs, the diary
 * wakes and holds one exchange. Once the scan is done and the diary has had its
 * say (or has been closed), the book vanishes and the graveyard rises.
 */
export function LinkCheck() {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CheckedLink | null>(null)
  const [diaryOpen, setDiaryOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [typing, setTyping] = useState(false)
  const { announce } = useAriaAnnounce()
  const { playSound } = useSpookyAudio()
  useHauntedTyping(typing && !busy)

  // One check at a time: the scan's result, and whether each side is finished.
  const scanned = useRef<CheckedLink | null>(null)
  const settled = useRef(false)
  const vanished = useRef(false)
  const inFlight = useRef<AbortController | null>(null)

  // Stop a scan that is still running when the page closes.
  useEffect(() => () => inFlight.current?.abort(), [])

  const reveal = (checked: CheckedLink) => {
    setResult(checked)
    setBusy(false)
    const ends = checked.server ? hostOf(checked.server.finalUrl) : checked.link.displayHost
    announce(`${verdictFor(checked.graves)} The link ends on ${ends}.`)
    playSound(checked.graves.length > 0 ? 'shovelScrape' : 'wispBlip')
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const checked = checkLinkOnDevice(value)
    if (!checked.ok) {
      setError(checked.reason)
      announce(checked.reason, 'assertive')
      playSound('hollowDenied')
      return
    }
    setError(null)
    setResult(null)
    setBusy(true)
    scanned.current = null
    settled.current = false
    vanished.current = false
    setDiaryOpen(true)

    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller
    const finished = await scanLink(checked.link, checked.graves, controller.signal)
    if (controller.signal.aborted) return
    scanned.current = finished
    if (vanished.current) reveal(finished)
    else if (settled.current) setDiaryOpen(false)
  }

  return (
    <>
      <form noValidate onSubmit={onSubmit} aria-label="Check a link" className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div onFocusCapture={() => setTyping(true)} onBlurCapture={() => setTyping(false)}>
        <RiteInput
          label="Link"
          type="url"
          value={value}
          onChange={(next) => {
            setValue(next)
            if (error) setError(null)
          }}
          placeholder="https://"
          error={error}
          errorTone="quiet"
          autoComplete="off"
        />
        </div>
        <RunicButton type="submit" element="bone" className="sm:mt-5" disabled={busy}>
          Check link
        </RunicButton>
      </form>
      <p className="mt-5 mb-0 max-w-xl text-sm leading-relaxed text-grave-mist-400">
        The address is read on this device first. Then Gravecast’s server opens the link once, the way a browser would, to see where it
        leads and how the site protects its visitors. Nothing on the page is run.
      </p>

      <HauntedDiary
        open={diaryOpen}
        entries={DIARY_ENTRIES}
        wrongReplies={DIARY_WRONG_REPLIES}
        silentText={DIARY_SILENT_TEXT}
        storageKey={DIARY_STORAGE_KEY}
        onSettled={() => {
          settled.current = true
          if (scanned.current) setDiaryOpen(false)
        }}
        onRequestClose={() => setDiaryOpen(false)}
        onVanished={() => {
          vanished.current = true
          if (scanned.current) reveal(scanned.current)
        }}
      />

      {busy && !diaryOpen && (
        <p role="status" className="mt-10 mb-0 font-serif text-lg text-grave-mist-300 italic">
          Still checking the link. The graveyard rises when the site answers.
        </p>
      )}

      {result && <Graveyard result={result} />}
    </>
  )
}