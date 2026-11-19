import { lazy, Suspense, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BitingFrame,
  BloodVialProgress,
  HauntedDiary,
  HorrorBackground,
  RiteInput,
  RunicButton,
  HorrorCursor,
  ScribbleCannon,
  useAriaAnnounce,
  useHauntedTyping,
  useHorrorFallback,
  useMediaQuery,
  useReducedMotion,
  useSpookyAudio,
  zLayers,
} from 'groove-ui'
import { DIARY_ENTRIES, DIARY_SILENT_TEXT, DIARY_STORAGE_KEY, DIARY_WRONG_REPLIES } from '../diary/entries'
import { checkLinkOnDevice, SEVERITY_ORDER, type Grave, type LinkSummary } from '../linkscan/deviceChecks'
import { scanOnServer } from '../linkscan/serverScan'
import { checkRepoInput, scanRepo } from '../repograve/repoScan'
import { SoundStatus } from '../site/SoundStatus'
import { issueVoices, useAmbience, type AmbienceState } from '../site/useAmbience'
import { useSmoothScroll } from '../site/useSmoothScroll'
import { GravePreview } from './GravePreview'
import { GraveRow } from './GraveRow'
import { GraveyardWalkView } from './GraveyardWalkView'
import { summariseLink, summariseRepo, type CheckedLink, type Mode, type ScanSummary } from './graves'
import { Ritual } from './Ritual'
import { RITUAL, type RitualStep } from './ritualSteps'
import { useDiaryRitual } from './useDiaryRitual'

const HeroScene = lazy(() => import('./HeroScene'))

type Outcome = { ok: true; summary: ScanSummary } | { ok: false; reason: string }

const COPY: Record<Mode, { lead: string; accent: string; sub: string; label: string; placeholder: string; action: string; busy: string; thing: string }> = {
  link: {
    lead: 'Every danger leaves a',
    accent: 'grave.',
    sub: 'Paste a link. Whatever it hides rises as a grave.',
    label: 'Link',
    placeholder: 'https://',
    action: 'Check',
    busy: 'Still checking the link. The graves rise when the site answers.',
    thing: 'link',
  },
  dev: {
    lead: 'Every TODO leaves a',
    accent: 'grave.',
    sub: 'Paste a public GitHub repo. Every TODO and FIXME rises as a grave.',
    label: 'Public GitHub repo',
    placeholder: 'owner/name',
    action: 'Dig',
    busy: 'Still digging through the repo. Big repos take a little while.',
    thing: 'repo',
  },
}

const delay = (seconds: number) => ({ ['--gc-delay' as string]: `${seconds}s` }) as CSSProperties

/** Adds the server's findings to the device's, most serious first. */
async function checkLink(link: LinkSummary, deviceGraves: Grave[], signal: AbortSignal): Promise<CheckedLink> {
  const result = await scanOnServer(link.href, signal)
  const graves = result.ok ? [...deviceGraves, ...result.scan.graves] : deviceGraves
  graves.sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
  return { link, graves, server: result.ok ? result.scan : null, serverProblem: result.ok ? null : result.reason }
}

/** The vial at the top: how far the ritual has come, in words and in ectoplasm. */
function vialStatus(steps: readonly RitualStep[], step: number, busy: boolean, summary: ScanSummary | null, failed: boolean, thing: string) {
  if (summary) {
    const n = summary.graves.length
    return { value: 100, label: n === 0 ? 'The yard is quiet' : `${n} ${n === 1 ? 'grave' : 'graves'} risen` }
  }
  if (busy) {
    const current = steps[Math.min(step, steps.length - 1)]
    return { value: ((step + 1) / steps.length) * 100, label: `${current.label} \u00b7 ${current.where}` }
  }
  if (failed) return { value: 0, label: 'The ritual broke off' }
  return { value: 0, label: `Waiting for a ${thing}` }
}

function SideNotes({ ambience, onToggle }: { ambience: AmbienceState; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-6 lg:flex-col lg:items-end">
      <p className="m-0 text-xs tracking-[0.3em] text-grave-mist-400 uppercase">Move the cursor. The yard looks back.</p>
      <SoundStatus state={ambience} onToggle={onToggle} />
    </div>
  )
}

/**
 * The one page: check a link, or switch on dev mode and read a repo. The diary
 * keeps you company while it runs, then the graveyard rises in the left
 * column, right under the form, and opens as a walk through the yard.
 */
export function HomePage() {
  const [params, setParams] = useSearchParams()
  const mode: Mode = params.get('mode') === 'dev' ? 'dev' : 'link'
  const copy = COPY[mode]
  const steps = RITUAL[mode]

  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [typing, setTyping] = useState(false)
  const [step, setStep] = useState(0)
  const [summary, setSummary] = useState<ScanSummary | null>(null)
  const [walkOpen, setWalkOpen] = useState(false)
  /** The last scan started but couldn't finish. */
  const [brokeOff, setBrokeOff] = useState(false)

  const reduced = useReducedMotion()
  const flat = useHorrorFallback()
  // Two columns with the panel scrolling on its own only on wide screens. Phones get a normal page.
  const wide = useMediaQuery('(min-width: 1024px)')
  const { announce } = useAriaAnnounce()
  const { playSound } = useSpookyAudio()
  const switchId = useId()

  const inFlight = useRef<AbortController | null>(null)
  const scroll = useRef(0)
  const panel = useRef<HTMLElement>(null)
  const panelContent = useRef<HTMLDivElement>(null)
  const results = useRef<HTMLElement>(null)
  const opener = useRef<HTMLButtonElement>(null)

  useHauntedTyping(typing && !busy)
  const ambience = useAmbience(summary?.mode === 'dev' ? issueVoices(summary.openIssues ?? 0) : 0)

  const diary = useDiaryRitual<Outcome>((outcome) => {
    setBusy(false)
    if (!outcome.ok) {
      setError(outcome.reason)
      setBrokeOff(true)
      setStep(0)
      announce(outcome.reason, 'assertive')
      playSound('hollowDenied')
      return
    }
    const done = outcome.summary
    setSummary(done)
    setStep(RITUAL[done.mode].length - 1)
    announce(`${done.verdict} ${done.subject}. The graveyard is under the form.`)
    playSound(done.graves.length > 0 ? 'shovelScrape' : 'wispBlip')
  })
  // Scrolling the panel walks the camera into the yard.
  const { scrollTo } = useSmoothScroll(panel, panelContent, wide, diary.open || walkOpen, (p) => {
    scroll.current = p
  })

  useEffect(() => () => inFlight.current?.abort(), [])

  useEffect(() => {
    if (summary && results.current) scrollTo(results.current)
  }, [summary, scrollTo])

  const changeMode = (next: Mode) => {
    if (busy || next === mode) return
    setParams(next === 'dev' ? { mode: 'dev' } : {}, { replace: true })
    setValue('')
    setError(null)
    setSummary(null)
    setBrokeOff(false)
    setStep(0)
    playSound('lockClick', 0.3)
  }

  const fail = (reason: string) => {
    setError(reason)
    announce(reason, 'assertive')
    playSound('hollowDenied')
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    inFlight.current?.abort()
    const controller = new AbortController()
    let pending: Promise<Outcome>

    if (mode === 'link') {
      const checked = checkLinkOnDevice(value)
      if (!checked.ok) return fail(checked.reason)
      setStep(2)
      pending = checkLink(checked.link, checked.graves, controller.signal).then((c) => ({ ok: true, summary: summariseLink(c) }))
    } else {
      const input = checkRepoInput(value)
      if (!input.ok) return fail(input.reason)
      setStep(1)
      pending = scanRepo(input.url, controller.signal).then((r): Outcome => (r.ok ? { ok: true, summary: summariseRepo(r.graveyard) } : r))
    }

    inFlight.current = controller
    setError(null)
    setBrokeOff(false)
    setSummary(null)
    setBusy(true)
    diary.start()
    const outcome = await pending
    if (controller.signal.aborted) return
    diary.finish(outcome)
  }

  const closeWalk = () => {
    setWalkOpen(false)
    opener.current?.focus()
  }

  const vial = vialStatus(steps, step, busy, summary, brokeOff, copy.thing)
  const ritual = <Ritual steps={steps} active={step} onSelect={setStep} running={busy} />

  return (
    <div className="grave-grove relative isolate flex-1">
      {/* The yard, behind everything, darker on the left where the words are. */}
      <div aria-hidden="true" className="gc-fade-in pointer-events-none fixed inset-0" style={{ zIndex: zLayers.behind }}>
        {flat || !wide ? (
          <HorrorBackground variant="fog" intensity="ghastly" />
        ) : (
          <Suspense fallback={null}>
            <HeroScene focus={steps[Math.min(step, steps.length - 1)].pose} getScroll={() => scroll.current} still={reduced} paused={walkOpen} />
          </Suspense>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,transparent_35%,var(--color-grave-dark-950)_100%)]" />
      </div>

      <div className="relative grid lg:h-[calc(100svh-3.5rem)] lg:grid-cols-[minmax(0,46rem)_1fr]">
        <section
          ref={panel}
          aria-label={mode === 'dev' ? 'Read a repo' : 'Check a link'}
          className="border-grave-dark-700/70 lg:h-full lg:overflow-y-auto bg-gradient-to-r from-grave-dark-950/95 via-grave-dark-950/85 to-grave-dark-950/60 backdrop-blur-[2px] lg:border-r"
        >
          <div ref={panelContent} className="space-y-10 px-6 pt-10 pb-16 sm:px-12">
            <div className="gc-reveal" style={delay(0.4)}>
              <BloodVialProgress value={vial.value} label={vial.label} liquid="blood" showPercentage={false} />
            </div>


            <div>
              <h1
                className={`gc-reveal m-0 font-serif leading-[1.05] text-grave-bone-100 italic transition-[font-size] duration-700 ${
                  summary ? 'text-4xl' : 'text-5xl sm:text-6xl'
                }`}
                style={delay(1)}
              >
                {copy.lead} <span className="text-grave-grove-glow">{copy.accent}</span>
              </h1>
              {!summary && (
                <p className="gc-reveal mt-4 mb-0 text-lg leading-relaxed text-grave-mist-300" style={delay(1.25)}>
                  {copy.sub}
                </p>
              )}
            </div>

            <div className="gc-reveal space-y-4" style={delay(1.45)}>
              <div className="flex items-center gap-3">
                <button
                  id={switchId}
                  type="button"
                  role="switch"
                  aria-checked={mode === 'dev'}
                  disabled={busy}
                  onClick={() => changeMode(mode === 'dev' ? 'link' : 'dev')}
                  className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full border border-grave-mist-500 bg-grave-dark-700 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 aria-checked:border-grave-grove-glow aria-checked:bg-grave-grove-glow"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-0.5 left-0.5 size-[22px] rounded-full shadow transition-transform duration-300 ${
                      mode === 'dev' ? 'translate-x-5 bg-grave-dark-950' : 'bg-grave-mist-300'
                    }`}
                  />
                </button>
                <label htmlFor={switchId} className="cursor-pointer text-xs tracking-[0.3em] text-grave-mist-300 uppercase">
                  Dev mode
                </label>
              </div>

              {/* The jaws close on the form while the scan runs. */}
              <BitingFrame biting={busy}>
              <form
                noValidate
                onSubmit={onSubmit}
                className="grid grid-cols-[1fr_auto] items-end gap-3 rounded-2xl border-2 border-grave-grove-glow/60 bg-grave-dark-900/90 px-5 py-7"
              >
                <div onFocusCapture={() => setTyping(true)} onBlurCapture={() => setTyping(false)}>
                  <RiteInput
                    key={mode}
                    label={copy.label}
                    type={mode === 'link' ? 'url' : 'text'}
                    value={value}
                    onChange={(next) => {
                      setValue(next)
                      if (error) setError(null)
                    }}
                    placeholder={copy.placeholder}
                    error={error}
                    errorTone="quiet"
                    autoComplete="off"
                    size="lg"
                  />
                </div>
                <RunicButton type="submit" element="bone" sigils={'\u16b2'} className="min-h-[3.4rem] gap-2! px-3!" disabled={busy}>
                  {copy.action}
                </RunicButton>
              </form>
              </BitingFrame>

              {busy && !diary.open && (
                <p role="status" className="m-0 font-serif text-lg text-grave-mist-300 italic">
                  {copy.busy}
                </p>
              )}
            </div>

            {summary && (
              <section ref={results} aria-labelledby="graveyard-heading" className="gc-story-in space-y-6">
                <h2 id="graveyard-heading" className="m-0 text-xs tracking-[0.3em] text-grave-grove-glow uppercase">
                  The graveyard
                </h2>
                <GravePreview ref={opener} summary={summary} onOpen={() => setWalkOpen(true)} />
                <ul className="m-0 list-none space-y-1 p-0 text-sm text-grave-mist-300">
                  {summary.facts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>

                {summary.graves.length > 0 && (
                  <ol className="m-0 list-none space-y-3 p-0" aria-label="Every grave">
                    {summary.graves.map((grave, i) => (
                      <GraveRow key={grave.id} grave={grave} index={i} />
                    ))}
                  </ol>
                )}

                <div className="rounded-xl border border-grave-dark-700 bg-grave-dark-900/80 p-5">
                  <h3 className="m-0 text-sm font-semibold text-grave-bone-100">Not checked</h3>
                  <ul className="mt-3 mb-0 list-disc space-y-1 pl-5 text-sm text-grave-mist-300">
                    {summary.notChecked.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {summary.note && <p className="mt-3 mb-0 text-sm text-grave-mist-400">{summary.note}</p>}
                </div>
              </section>
            )}

            <div className="space-y-8 lg:hidden">
              {ritual}
              <SideNotes ambience={ambience.state} onToggle={ambience.toggle} />
            </div>
          </div>
        </section>

        <div className="pointer-events-none hidden flex-col justify-end gap-8 p-10 lg:flex">
          <div className="pointer-events-auto flex items-end justify-between gap-10">
            {ritual}
            <div className="gc-reveal" style={delay(2)}>
              <SideNotes ambience={ambience.state} onToggle={ambience.toggle} />
            </div>
          </div>
        </div>
      </div>

      <HauntedDiary
        {...diary.diaryProps}
        entries={DIARY_ENTRIES}
        wrongReplies={DIARY_WRONG_REPLIES}
        silentText={DIARY_SILENT_TEXT}
        storageKey={DIARY_STORAGE_KEY}
      />

      {walkOpen && summary && <GraveyardWalkView summary={summary} onClose={closeWalk} />}

      {/* A pen fired across the screen: catch it to draw on the page. */}
      {/* The home page's cursor is a skeletal hand that grips on click. Every other page keeps the normal cursor. */}
      <HorrorCursor variant="skeletal-hand" />
      {/* It lands at the right end of the top bar: 40px ball centred in the 56px (3.5rem) bar. It is fired on every visit, can't be turned off, and stays on screen, even while drawing. */}
      <ScribbleCannon
        paused={diary.open || walkOpen}
        dockInset={{ x: 24, y: 8 }}
        dismissible={false}
        stayVisible
        scribbleProps={{ storageKey: 'gravecast-scribble' }}
      />
    </div>
  )
}