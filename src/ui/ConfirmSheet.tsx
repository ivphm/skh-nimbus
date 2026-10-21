import type { ReactNode } from 'react'
import { Button } from './Button'

/** Inline confirmation, for example before closing someone else's loan. */
export function ConfirmSheet({ title, children, confirmLabel, onConfirm, onCancel }: { title: string; children?: ReactNode; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div role="alertdialog" aria-labelledby="confirm-sheet-title" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-6 shadow-2xl">
      <div className="mx-auto flex max-w-4xl items-center gap-6">
        <div className="flex-1">
          <p id="confirm-sheet-title" className="font-display text-xl font-bold">
            {title}
          </p>
          {children && <div className="mt-1 text-ink-muted">{children}</div>}
        </div>
        <Button variant="secondary" size="lg" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="lg" onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </div>
  )
}
