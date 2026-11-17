import { Link } from 'react-router-dom'

/**
 * The standard back arrow, with no word beside it. It goes to the page one level
 * up, so it works the same when the page was opened from a link. Its name is
 * spoken by screen readers.
 */
export function BackButton({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-grave-dark-600 bg-grave-dark-850 text-grave-bone-100 no-underline hover:border-grave-mist-300 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M11 18l-6-6 6-6" />
      </svg>
    </Link>
  )
}
