/**
 * A small square refresh button: a circular arrow with a spoken label, for "check for
 * new messages now". It stays in place while a check runs (disabled, no spinning),
 * so the layout never jumps and nothing moves.
 */
export function RefreshButton({ onClick, busy, label = 'Check for new messages' }: { onClick: () => void; busy: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={busy ? `${label} (checking)` : label}
      title={label}
      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-grave-dark-600 bg-grave-dark-850 text-grave-mist-100 hover:border-grave-mist-300 hover:text-grave-bone-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-grave-bone-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 11a8 8 0 1 0-2.34 5.66" />
        <path d="M20 4v7h-7" />
      </svg>
    </button>
  )
}
