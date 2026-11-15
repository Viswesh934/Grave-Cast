import { lazy, Suspense, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import {
  BoneOssuaryDivider,
  HorrorBackground,
  RiteInput,
  RunicButton,
  TombstoneCard,
  useAriaAnnounce,
  useHauntedTyping,
  useHorrorFallback,
  useSpookyAudio,
} from 'groove-ui'
import { fileName, MARKER_MEANING, MARKER_WEATHERING, REPO_NOT_CHECKED, STONES_IN_SCENE } from './markerWords'
import { lineUrl, scanRepo, toRepoUrl, type RepoGraveyard } from './repoScan'

const RepoGraveyard3D = lazy(() => import('./RepoGraveyard3D'))

/** Developer mode: paste a public GitHub repo and see the marker comments in its code as graves. */
export function RepoGraveyardPage() {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [typing, setTyping] = useState(false)
  const [graveyard, setGraveyard] = useState<RepoGraveyard | null>(null)
  const { announce } = useAriaAnnounce()
  const { playSound } = useSpookyAudio()
  const flat = useHorrorFallback()
  const inFlight = useRef<AbortController | null>(null)
  const headingId = useId()
  useHauntedTyping(typing && !busy)

  useEffect(() => () => inFlight.current?.abort(), [])

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const url = toRepoUrl(value)
    if (url === null) {
      setError('Type a repo, such as owner/name.')
      playSound('hollowDenied')
      return
    }
    setError(null)
    setGraveyard(null)
    setBusy(true)
    announce('Reading the repo.')
    inFlight.current?.abort()
    const controller = new AbortController()
    inFlight.current = controller
    const result = await scanRepo(url, controller.signal)
    if (controller.signal.aborted) return
    setBusy(false)
    if (!result.ok) {
      setError(result.reason)
      announce(result.reason, 'assertive')
      playSound('hollowDenied')
      return
    }
    setGraveyard(result.graveyard)
    const count = result.graveyard.markerCount
    announce(`${count} ${count === 1 ? 'grave' : 'graves'} in ${result.graveyard.fullName}.`)
    playSound(count > 0 ? 'shovelScrape' : 'wispBlip')
  }

  return (
    <div className="relative isolate flex-1">
      <HorrorBackground variant="fog" intensity="ghastly" fixed />
      <main className="mx-auto max-w-4xl px-6 pt-20 pb-28">
        <h1 className="m-0 font-serif text-4xl leading-tight text-grave-bone-100 sm:text-5xl">What{'\u2019'}s rotting in your repo?</h1>
        <p className="mt-5 mb-0 max-w-2xl text-lg leading-relaxed text-grave-mist-300">
          Paste a public GitHub repo. Every TODO, FIXME, HACK and XXX left in its code rises as a grave.
        </p>

        <form noValidate onSubmit={onSubmit} aria-label="Read a repo" className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div onFocusCapture={() => setTyping(true)} onBlurCapture={() => setTyping(false)}>
            <RiteInput
              label="Public GitHub repo"
              value={value}
              onChange={(next) => {
                setValue(next)
                if (error) setError(null)
              }}
              placeholder="owner/name"
              error={error}
              errorTone="quiet"
              autoComplete="off"
            />
          </div>
          <RunicButton type="submit" element="bone" className="sm:mt-5" disabled={busy}>
            Raise the graveyard
          </RunicButton>
        </form>
        <p className="mt-5 mb-0 max-w-2xl text-sm leading-relaxed text-grave-mist-400">
          Gravecast{'\u2019'}s server downloads the repo as it is now, reads its source files, then deletes its copy. Nothing in the repo is run.
        </p>

        {busy && (
          <p role="status" className="mt-10 mb-0 font-serif text-lg text-grave-mist-300 italic">
            Digging through the repo. Big repos take a little while.
          </p>
        )}

        {graveyard && (
          <section aria-labelledby={headingId} className="mt-16 space-y-10">
            <BoneOssuaryDivider label="The graveyard" pattern="row" size="md" />

            <div className="space-y-2">
              <h2 id={headingId} className="m-0 font-serif text-2xl text-grave-bone-100">
                {graveyard.markerCount === 0
                  ? `No markers found in ${graveyard.fullName}.`
                  : `${graveyard.markerCount} ${graveyard.markerCount === 1 ? 'grave' : 'graves'} in ${graveyard.fullName}.`}
              </h2>
              <p className="m-0 text-lg text-grave-mist-300">
                Read {graveyard.filesRead} source {graveyard.filesRead === 1 ? 'file' : 'files'} out of {graveyard.filesDiscovered} in the repo
                {graveyard.languages.length > 0 && <> ({graveyard.languages.join(', ')})</>}.
              </p>
              {graveyard.truncated && (
                <p className="m-0 text-grave-mist-400">Showing the first {graveyard.graves.length}, most serious first.</p>
              )}
            </div>

            {graveyard.graves.length > 0 &&
              (flat ? (
                <ul className="m-0 grid list-none items-end gap-x-8 gap-y-16 p-0 pb-6 sm:grid-cols-2">
                  {graveyard.graves.slice(0, STONES_IN_SCENE).map((grave) => (
                    <li key={grave.id}>
                      <TombstoneCard
                        title={grave.kind}
                        subtitle={MARKER_MEANING[grave.kind]}
                        epitaph={grave.note || undefined}
                        weathering={MARKER_WEATHERING[grave.kind]}
                      >
                        <p className="m-0 text-center font-mono text-sm break-all">
                          {fileName(grave.path)}:{grave.line}
                        </p>
                      </TombstoneCard>
                    </li>
                  ))}
                </ul>
              ) : (
                <div aria-hidden="true" className="h-[480px] overflow-hidden rounded-lg border border-grave-dark-700">
                  <Suspense
                    fallback={
                      <p className="m-0 grid h-full place-items-center font-serif text-grave-mist-400 italic">The stones are rising.</p>
                    }
                  >
                    <RepoGraveyard3D graves={graveyard.graves} />
                  </Suspense>
                </div>
              ))}

            {graveyard.graves.length > 0 && (
              <div>
                <h3 className="m-0 text-base font-semibold text-grave-bone-100">Every grave</h3>
                <p className="mt-1 mb-0 text-sm text-grave-mist-400">
                  {flat
                    ? `The ${Math.min(STONES_IN_SCENE, graveyard.graves.length)} most serious are shown above.`
                    : `The ${Math.min(STONES_IN_SCENE, graveyard.graves.length)} most serious stand in the graveyard above. Drag it to look around.`}{' '}
                  Each line opens on GitHub.
                </p>
                <ol className="mt-4 mb-0 list-none space-y-3 p-0">
                  {graveyard.graves.map((grave) => (
                    <li key={grave.id} className="rounded-md border border-grave-dark-700 bg-grave-dark-900/80 px-4 py-3">
                      <p className="m-0 text-grave-bone-100">
                        <span className="font-mono text-sm tracking-wider uppercase">{grave.kind}</span>
                        <span className="text-grave-mist-400"> {'\u00b7'} {MARKER_MEANING[grave.kind]}</span>
                      </p>
                      {grave.note && <p className="mt-1 mb-0 text-grave-mist-300">{grave.note}</p>}
                      <a
                        href={lineUrl(graveyard, grave)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block font-mono text-sm break-all text-grave-mist-300 underline decoration-grave-dark-600 underline-offset-4 hover:text-grave-bone-100"
                      >
                        {grave.path}:{grave.line}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="rounded-lg border border-grave-dark-700 bg-grave-dark-900/80 p-6">
              <h3 className="m-0 text-base font-semibold text-grave-bone-100">Not checked</h3>
              <ul className="mt-3 mb-0 list-disc space-y-1.5 pl-5 text-grave-mist-300">
                {REPO_NOT_CHECKED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
                <li>Files in other languages, and folders such as node_modules and build output</li>
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}