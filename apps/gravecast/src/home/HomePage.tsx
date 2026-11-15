import { HorrorBackground } from 'groove-ui'
import { LinkCheck } from './LinkCheck'

export function HomePage() {
  return (
    <div className="relative isolate flex-1">
      <HorrorBackground variant="fog" intensity="ghastly" fixed />

      <main className="mx-auto max-w-3xl px-6 pt-20 pb-28">
        <h1 className="m-0 font-serif text-4xl leading-tight text-grave-bone-100 sm:text-5xl">Check a link before you open it.</h1>
        <p className="mt-5 mb-0 max-w-xl text-lg leading-relaxed text-grave-mist-300">
          Paste a link someone sent you. Every problem it hides rises from the ground as a grave.
        </p>
        <LinkCheck />
      </main>
    </div>
  )
}