import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { BoneOssuaryDivider, HorrorBackground, HorrorCursor } from 'groove-ui'

const delay = (seconds: number) => ({ ['--gc-delay' as string]: `${seconds}s` }) as CSSProperties

/**
 * The old technology we had fun bringing back, and where it lives.
 */
const DEAD_TECH: readonly { name: string; era: string; where: string; what: string }[] = [
  {
    name: 'FidoNet echomail',
    era: 'Bulletin boards, over dial-up',
    where: 'Chat',
    what:
      'Long before group chats, bulletin boards traded messages over phone lines. A computer would call, swap what was new, and hang up, and the messages still got everywhere. We loved that it never needed a steady line, so Chat does the same: your phone makes a quick mail run and catches up. Message areas are called echoes, like EMERGENCY, and every message keeps its FidoNet-style headers.',
  },
  {
    name: 'Shortwave radio and radio teletype',
    era: 'Radio nets and RTTY',
    where: 'Radio',
    what:
      'We built a little shortwave set: nine channels, a tuning dial, a volume knob and a soft hiss. Your phone reads each message aloud, or plays it the way radio teletype did, as 5-bit Baudot code at 45.45 baud on two tones, 2125 and 2295 Hz. Switch to Tones once just to hear it.',
  },
  {
    name: 'Morse code',
    era: 'Telegraph and signal lamps',
    where: 'Tools and Access',
    what:
      'The oldest trick in the book still works. SOS goes out in dots and dashes: flashed with the torch or the screen, played as a tone, or buzzed quietly when you need to stay silent.',
  },
  {
    name: 'WHOIS (1982)',
    era: 'ARPANET Directory Era',
    where: 'The link check, on this website',
    what:
      'Our favourite. To tell how old a website is, the link check asks WHOIS, a lookup from 1982. It asks whois.iana.org who looks after the domain’s ending, then asks them, and shows you the creation date straight from the record.',
  },
]

/** The interactive easter eggs hidden across Gravecast */
const EASTER_EGGS: readonly { name: string; badge: string; how: string; detail: string }[] = [
  {
    name: 'Ghost Run',
    badge: 'Arcade Mini-Game',
    how: 'Answer a riddle in the Haunted Diary',
    detail: 'An 8-bit endless runner in the crypt. Leap over crumbling tombstones, harvest floating brass coins, and set persistent high scores in your browser storage.',
  },
  {
    name: 'The Haunted Diary',
    badge: 'Tom Riddle Grimoire',
    how: 'Click "Consult the Diary" or run a scan',
    detail: 'A living grimoire that writes back in dripping ink. It challenges you with folklore riddles, remembers your answers throughout the session, and triggers hidden secrets.',
  },
  {
    name: 'Scribble Cannon',
    badge: 'Drawing Tool',
    how: 'Catch the ghost flying into the pen slot',
    detail: 'The cannon fires a flying phantom across the top bar. Catch it before it docks into its pen slot to unlock freehand gothic drawing tools right across the webpage.',
  },
  {
    name: 'Backwards Typing Rite',
    badge: 'Retro Terminal Game',
    how: 'Hidden in the Component Library / Docs',
    detail: 'A frantic retro terminal challenge where words are typed in reverse order against an unforgiving countdown timer with synthesized mechanical keystroke audio.',
  },
]

export function StoryPage() {
  return (
    <div className="relative isolate flex-1">
      {/* Background ambiance */}
      <HorrorBackground variant="fog" intensity="ghastly" fixed />

      {/* Haunted cursor scoped specifically to Our Story: high-voltage electric crackle */}
      <HorrorCursor variant="electric-zap" clickSound="terminalBell" />

      <main className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-12 pt-20 pb-36">

        {/* Editorial Signature Header matching the reference styling */}
        <header className="gc-reveal mb-12 sm:mb-16" style={delay(0.2)}>
          <div className="flex items-baseline gap-3 sm:gap-4 select-none">
            <span className="font-serif italic font-bold text-5xl sm:text-7xl lg:text-8xl text-grave-bone-100 lowercase">
              our
            </span>
            <span className="font-serif italic font-extrabold text-6xl sm:text-8xl lg:text-9xl text-red-500/90 tracking-tighter -rotate-3 scale-105 drop-shadow-[0_0_35px_rgba(239,68,68,0.35)]">
              story
            </span>
          </div>
        </header>

        {/* Narrative Section in Editorial All-Caps Tracked Typography */}
        <section aria-label="Our Origin Story" className="gc-reveal max-w-3xl space-y-7 text-xs sm:text-sm font-sans font-medium text-grave-mist-300 uppercase tracking-widest leading-relaxed sm:leading-loose" style={delay(0.5)}>
          <p className="text-grave-bone-100 font-semibold tracking-[0.2em]">
            OUR STORY STARTED THE WAY MOST CHAOTIC CREATIVE PROJECTS START: WITH POWER LINES SNAPPING AND TREES FLYING THROUGH THE AIR.
          </p>

          <p>
            ONE OF US LIVES IN A CYCLONE REGION. IN ONE PARTICULARLY SAVAGE STORM, THE ENTIRE CITY WENT COMPLETELY DARK: NO ELECTRICITY, NO INTERNET, AND ZERO CELL SIGNAL FOR ABOUT TWO SOLID DAYS. WITH THE NATURAL SURVIVAL SKILLS OF A TIRED MOSQUITO, THERE WASN’T MUCH TO DO, AND ABSOLUTELY NOTHING TO LOOK UP.
          </p>

          <p>
            ANOTHER OF US IS FROM LEBANON, WHERE WAR AND INFRASTRUCTURE CUTS CAN STRIP COMMUNICATIONS IN MINUTES. FOR BOTH OF US, AN EMERGENCY HAS NEVER BEEN A THEORETICAL ABSTRACT — IT IS ALWAYS AN IMPENDING REALITY.
          </p>

          <p>
            SO WE BUILT SOMETHING THAT DOESN’T SURRENDER WHEN THE LINES DROP. WE BUILT LANTERN — AN OFFLINE-FIRST COMPANION THAT RUNS DIRECTLY IN THE BROWSER WITH ZERO NETWORK, PACKED WITH PEER CHAT, SHORTWAVE RADIO, EMERGENCY TOOLS, AND ACCESSIBILITY PADS.
          </p>

          <p>
            ABOUT HALFWAY THROUGH BUILDING IT, WE REALIZED HOW POWERFUL MODERN WEB PLATFORMS AND CHROME DEVTOOLS CAN BE WHEN YOU RESURRECT DEAD PROTOCOLS. WE DIDN’T WANT JUST ANOTHER DRY SURVIVAL UTILITY — WE WANTED TO MAKE EXPLORING SECURITY, CRYPTOGRAPHY, AND CODE AUDITING RADICALLY ENGAGING.
          </p>

          <p className="text-cyan-400 font-semibold tracking-[0.22em]">
            AND THAT’S WHAT BROUGHT US HERE.
          </p>
        </section>

        {/* Section Divider */}
        <div className="gc-reveal mt-20 sm:mt-24" style={delay(1)}>
          <BoneOssuaryDivider label="The Foundation" pattern="row" size="lg" />
        </div>

        {/* The Docs & Component Library Section */}
        <section aria-labelledby="docs-lib" className="gc-reveal mt-16" style={delay(1.2)}>
          <div className="max-w-3xl">
            <p className="m-0 text-xs tracking-[0.3em] text-cyan-400/90 uppercase font-mono">
              Radical Web Primitives · Chrome Platform Mastery
            </p>
            <h2 id="docs-lib" className="mt-3 mb-0 font-serif text-3xl sm:text-4xl text-grave-bone-100 italic">
              We accidentally built an entire horror design system.
            </h2>
            <p className="mt-4 mb-0 text-base leading-relaxed text-grave-mist-300">
              To make Gravecast alive, standard UI kits weren’t going to cut it. We needed tombstones that weather under security CVEs, living blob scrollbars that stick like ectoplasm, and audio synthesized on the fly with zero media assets.
            </p>
            <p className="mt-3 mb-0 text-base leading-relaxed text-grave-mist-300">
              So we built <span className="font-mono text-cyan-300">groove-ui</span>: a standalone 30+ component library that pushes Chrome and modern web APIs to their absolute limits:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-grave-dark-700/80 bg-grave-dark-950/80 p-6 backdrop-blur-sm">
              <span className="text-2xl">⚡</span>
              <h3 className="mt-3 mb-1 font-serif text-xl text-grave-bone-100">Zero-Asset Web Audio</h3>
              <p className="m-0 text-xs text-grave-mist-300 leading-relaxed">
                Every stone grind, bone crack, witch giggle, and electric zap is synthesized in real time via Web Audio API oscillators and biquad filters. Zero MP3 downloads.
              </p>
            </div>

            <div className="rounded-xl border border-grave-dark-700/80 bg-grave-dark-950/80 p-6 backdrop-blur-sm">
              <span className="text-2xl">🕸️</span>
              <h3 className="mt-3 mb-1 font-serif text-xl text-grave-bone-100">Chrome DevTools & DOM</h3>
              <p className="m-0 text-xs text-grave-mist-300 leading-relaxed">
                Engineered with accessibility-first ARIA announcements, reduced-motion fallbacks, touch device detection, and dev inspection hooks that give developers complete control.
              </p>
            </div>

            <div className="rounded-xl border border-grave-dark-700/80 bg-grave-dark-950/80 p-6 backdrop-blur-sm">
              <span className="text-2xl">🔮</span>
              <h3 className="mt-3 mb-1 font-serif text-xl text-grave-bone-100">Three.js 3D Graveyard</h3>
              <p className="m-0 text-xs text-grave-mist-300 leading-relaxed">
                Procedural 3D fog, gravestone positioning algorithms, and a third-person flight camera that turns security findings into an immersive, interactive walk.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/docs/"
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-5 py-2.5 font-mono text-sm text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-900/60 hover:text-white"
            >
              <span>Explore the Component Docs (30+ Primitives)</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* Section Divider */}
        <div className="gc-reveal mt-20 sm:mt-24" style={delay(1.3)}>
          <BoneOssuaryDivider label="Hidden Secrets" pattern="row" size="lg" />
        </div>

        {/* Easter Eggs & Mini-Games Section */}
        <section aria-labelledby="easter-eggs" className="gc-reveal mt-16" style={delay(1.4)}>
          <div className="max-w-3xl">
            <p className="m-0 text-xs tracking-[0.3em] text-cyan-400/90 uppercase font-mono">
              Interactive Curiosities · Fun Built In
            </p>
            <h2 id="easter-eggs" className="mt-3 mb-0 font-serif text-3xl sm:text-4xl text-grave-bone-100 italic">
              The easter eggs and games we hid.
            </h2>
            <p className="mt-4 mb-0 text-base leading-relaxed text-grave-mist-300">
              Security tools are notorious for being grim and boring. We think auditing should be rewarding, playful, and mysterious. Scattered throughout Gravecast are secret arcade games and interactive easter eggs:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {EASTER_EGGS.map((egg) => (
              <div
                key={egg.name}
                className="group flex flex-col justify-between rounded-2xl border border-grave-dark-700/80 bg-grave-dark-950/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:bg-grave-dark-900/95"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-serif text-2xl text-grave-bone-100 group-hover:text-cyan-200 transition-colors">
                      {egg.name}
                    </span>
                    <span className="rounded-md border border-grave-dark-700 bg-grave-dark-900 px-2 py-0.5 text-[11px] font-mono text-cyan-400">
                      {egg.badge}
                    </span>
                  </div>
                  <p className="m-0 text-xs font-mono text-grave-mist-400">
                    <span className="text-grave-grove-glow">How to find:</span> {egg.how}
                  </p>
                  <p className="mt-3 mb-0 text-sm leading-relaxed text-grave-mist-300">
                    {egg.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section Divider */}
        <div className="gc-reveal mt-20 sm:mt-24" style={delay(1.5)}>
          <BoneOssuaryDivider label="Resilient Roots" pattern="row" size="lg" />
        </div>

        {/* Dead Tech Section */}
        <section aria-labelledby="dead-tech" className="gc-reveal mt-16" style={delay(1.6)}>
          <div className="max-w-3xl">
            <p className="m-0 text-xs tracking-[0.3em] text-cyan-400/90 uppercase font-mono">
              Old Ideas for Broken Lines
            </p>
            <h2 id="dead-tech" className="mt-3 mb-0 font-serif text-3xl sm:text-4xl text-grave-bone-100 italic">
              Dead tech, brought back.
            </h2>
            <p className="mt-4 mb-0 text-base leading-relaxed text-grave-mist-300">
              Long before high-speed broadband, people chatted across oceans over radio nets and intermittent wire. Those protocols were built from day one to survive dropped lines and zero connectivity. We brought four of our favorites back into Lantern:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEAD_TECH.map((tech) => (
              <div
                key={tech.name}
                className="group flex flex-col justify-between rounded-2xl border border-grave-dark-700/80 bg-grave-dark-950/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:bg-grave-dark-900/95"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-md border border-grave-dark-700 bg-grave-dark-900 px-2 py-0.5 text-xs font-mono text-grave-mist-300">
                      {tech.era}
                    </span>
                    <span className="rounded-md border border-cyan-900/60 bg-cyan-950/40 px-2 py-0.5 text-xs font-mono text-cyan-400">
                      In {tech.where}
                    </span>
                  </div>
                  <h3 className="m-0 font-serif text-2xl text-grave-bone-100 group-hover:text-cyan-200 transition-colors">
                    {tech.name}
                  </h3>
                  <p className="mt-3 mb-0 text-sm leading-relaxed text-grave-mist-300">
                    {tech.what}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action footer banner */}
        <footer className="gc-reveal mt-24 rounded-2xl border border-cyan-900/40 bg-gradient-to-r from-grave-dark-950 via-cyan-950/20 to-grave-dark-950 p-8 sm:p-12 text-center" style={delay(1.8)}>
          <h3 className="m-0 font-serif text-3xl text-grave-bone-100 italic">
            Install it before the lights go out.
          </h3>
          <p className="mx-auto mt-4 mb-0 max-w-xl text-base text-grave-mist-300">
            In a real emergency, there may be no signal to download it. Save Lantern to your home screen now so its offline survival tools and radio replicas work forever.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/lantern/"
              className="inline-flex items-center gap-3 rounded-xl border border-cyan-400/60 bg-cyan-950/60 px-6 py-3 font-serif text-lg text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all hover:border-cyan-300 hover:bg-cyan-900/80 hover:text-white hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
            >
              <span>Launch Lantern</span>
              <span aria-hidden="true">→</span>
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-grave-dark-600 bg-grave-dark-900 px-6 py-3 font-serif text-lg text-grave-bone-200 transition-all hover:border-grave-grove-glow hover:text-white"
            >
              <span>Enter the Graveyard</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 border-t border-grave-dark-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-grave-mist-400">
            <span className="tracking-widest uppercase">
              Built with <span className="text-grave-bone-100 font-bold">Kiro</span>
            </span>
            <span className="text-grave-mist-500">
              Gravecast · The Spooky Scanner
            </span>
          </div>
        </footer>

      </main>
    </div>
  )
}
