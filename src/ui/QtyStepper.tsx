export function QtyStepper({ value, onChange, label, max }: { value: number; onChange: (n: number) => void; label: string; max?: number }) {
  const btn = 'grid h-12 w-12 place-items-center rounded-control bg-surface-2 text-xl font-bold text-ink disabled:opacity-40'
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className={btn} aria-label={`One fewer ${label}`} onClick={() => onChange(value - 1)}>
        −
      </button>
      <output className="w-10 text-center font-display text-lg font-semibold" aria-live="polite">
        ×{value}
      </output>
      <button type="button" className={btn} aria-label={`One more ${label}`} disabled={max !== undefined && value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  )
}
