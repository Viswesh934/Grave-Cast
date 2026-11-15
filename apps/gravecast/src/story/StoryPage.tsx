import type { CSSProperties } from 'react'
import { BoneOssuaryDivider, DoodleStrip, HorrorBackground } from 'groove-ui'
import { KIT_PROTOTYPE_NOTICE, recoveryPosition } from '../kit/recoveryPosition'

const delay = (seconds: number) => ({ ['--gc-delay' as string]: `${seconds}s` }) as CSSProperties

/** The story, told in the maker's words, one line at a time. */
const STORY: readonly string[] = [
  'I was stuck in a power cut for about two days. No electricity, no internet, no phone signal.',
  'My survival skills are about as good as a mosquito\u2019s. There was nothing much I could do, and nothing I could look up.',
  'And a power cut isn\u2019t the worst that can happen. One day it could be a war.',
  'So we built something that keeps working on limited internet, and holds the common emergency know-how for when there is none at all.',
]

/** What the Emergency section will hold, from the vision doc. It is being built now. */
const PARTS: readonly { name: string; what: string }[] = [
  { name: 'Board', what: 'Plain-text updates, such as shelters and helplines, kept on your phone so they open offline.' },
  { name: 'Chat', what: 'Messages wait in an outbox and send in one small burst when the line comes back.' },
  { name: 'Radio', what: 'Public radio stations that play over a weak connection.' },
  { name: 'Survival kit', what: 'First aid and survival guides that work with no internet at all, each drawn as a short comic and taken from a recognised source.' },
]

/** Why Gravecast has an Emergency section: the story first, then what it holds. */
export function StoryPage() {
  return (
    <div className="relative isolate flex-1">
      <HorrorBackground variant="fog" intensity="ghastly" fixed />
      <main className="mx-auto max-w-2xl px-6 pt-20 pb-32">
        <p className="gc-reveal m-0 text-xs tracking-[0.3em] text-grave-mist-400 uppercase" style={delay(0.2)}>
          Our story
        </p>
        <h1 className="gc-reveal mt-4 mb-0 font-serif text-5xl leading-tight text-grave-bone-100 italic sm:text-6xl" style={delay(0.5)}>
          Two days in the dark.
        </h1>

        <div className="mt-12 space-y-7">
          {STORY.map((line, i) => (
            <p key={line} className="gc-reveal m-0 text-xl leading-relaxed text-grave-mist-200" style={delay(1.1 + i * 0.9)}>
              {line}
            </p>
          ))}
        </div>

        <div className="gc-reveal mt-16" style={delay(1.1 + STORY.length * 0.9)}>
          <BoneOssuaryDivider label="The Emergency section" pattern="row" size="md" />
          <p className="mt-8 mb-0 text-lg leading-relaxed text-grave-mist-300">
            It will install on your phone like an app, so it is already there when the lights go out. It is being built now, and holds four things:
          </p>
          <dl className="mt-8 mb-0 space-y-5">
            {PARTS.map((part) => (
              <div key={part.name} className="border-l-2 border-grave-dark-600 pl-5">
                <dt className="font-serif text-xl text-grave-bone-100">{part.name}</dt>
                <dd className="m-0 mt-1 text-grave-mist-300">{part.what}</dd>
              </div>
            ))}
          </dl>
        </div>

        <section aria-labelledby="kit-preview" className="gc-reveal mt-20" style={delay(1.6 + STORY.length * 0.9)}>
          <h2 id="kit-preview" className="m-0 font-serif text-3xl text-grave-bone-100 italic">
            A guide you can follow in the dark
          </h2>
          <p className="mt-4 mb-0 text-lg leading-relaxed text-grave-mist-300">
            Each survival kit guide is a comic: stick figures show every step at once, and each step is also written out in words. This
            is one of them.
          </p>
          <div className="mt-8">
            <DoodleStrip strip={recoveryPosition} headingLevel={3} showSource />
          </div>
          <p className="mt-4 mb-0 text-sm text-grave-mist-400">{KIT_PROTOTYPE_NOTICE}</p>
        </section>

        <div className="gc-reveal mt-16" style={delay(2 + STORY.length * 0.9)}>
          <p className="m-0 text-grave-mist-400">Install it before you need it. In an emergency, there may be no internet to download it.</p>
        </div>
      </main>
    </div>
  )
}