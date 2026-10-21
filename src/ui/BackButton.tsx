/** Consistent back control, top-left of the content on every screen that has somewhere to go back to. */
export function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 inline-flex min-h-12 items-center gap-2 rounded-control pr-4 font-display font-semibold text-ink-muted hover:text-ink"
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  )
}
