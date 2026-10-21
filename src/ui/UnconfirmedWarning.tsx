import { useEffect, useRef } from 'react'
import { Button } from './Button'

export interface UnconfirmedWarningProps {
  open: boolean
  count: number
  onContinue: () => void
  onLeave: () => void
}

/** I7: shown when the user steps away with an unconfirmed list. There is no gate, so this is the only cue. */
export function UnconfirmedWarning({ open, count, onContinue, onLeave }: UnconfirmedWarningProps) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal?.()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      aria-labelledby="unconfirmed-title"
      onCancel={(e) => {
        e.preventDefault()
        onContinue()
      }}
      className="m-auto max-w-lg rounded-card border-2 border-warning bg-surface p-8 text-ink backdrop:bg-black/50"
    >
      <h2 id="unconfirmed-title" className="font-display text-2xl font-bold">
        You have {count} {count === 1 ? 'part' : 'parts'} not confirmed
      </h2>
      <p className="mt-2 text-ink-muted">
        Confirm the loan before you go. If you leave now, the parts stay flagged as unconfirmed on the ledger and on Parts Out.
      </p>
      <div className="mt-6 flex gap-3">
        <Button size="lg" onClick={onContinue} autoFocus>
          Back to my list
        </Button>
        <Button size="lg" variant="secondary" onClick={onLeave}>
          Leave unconfirmed
        </Button>
      </div>
    </dialog>
  )
}
