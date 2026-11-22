import { Link } from 'react-router-dom'
import { GhostIcon } from 'groove-ui'

/** What a game's docs page shows in place of its demo, until the games have been found. */
export function LockedGame() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4 rounded-2xl border border-grave-dark-600 bg-grave-dark-950 p-8 text-center">
      <span className="text-grave-mist-400">
        <GhostIcon size="2rem" />
      </span>
      <p className="m-0 font-serif text-xl text-grave-bone-100 italic">This one is still hidden.</p>
      <p className="m-0 max-w-md text-sm text-grave-mist-300">
        Answer one of the riddles in the{' '}
        <Link to="/docs/components/diary" className="text-grave-bone-100 underline decoration-grave-mist-500 underline-offset-4 hover:decoration-grave-bone-100">
          HauntedDiary
        </Link>{' '}
        right, and it will let you play.
      </p>
    </div>
  )
}
