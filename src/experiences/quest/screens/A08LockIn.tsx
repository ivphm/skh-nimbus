import { useConfirm } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { HoldButton } from '@/ui/HoldButton'
import { Notice } from '@/ui/Notice'
import { QtyStepper } from '@/ui/QtyStepper'
import { QuestFrame } from '../QuestFrame'

/** A8 · Lock in loadout (hold to confirm, I4). */
export default function LockIn() {
  const c = useConfirm()
  return (
    <QuestFrame>
      <div className="grid grid-cols-[1.2fr_1fr] gap-8">
        <Card>
          <h1 className="font-display text-2xl font-bold">Your loadout · {c.workOrderId}</h1>
          <ul className="mt-4 space-y-2">
            {c.lines.map((l) => (
              <li key={l.partId} className="flex items-center gap-3 rounded-control bg-surface-2 px-3 py-2">
                <span className="flex-1">{l.part?.name}</span>
                <QtyStepper value={l.qty} label={l.part?.name ?? l.partId} max={l.part?.stock} onChange={(n) => c.setQty(l.partId, n)} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-ink-muted">Locking records the loan on your name. You or a teammate can close it later.</p>
          <Button variant="ghost" className="mt-2" onClick={c.back}>
            Back to backpack
          </Button>
        </Card>
        <section className="flex flex-col items-center justify-center gap-4 text-center">
          <HoldButton label="Hold to lock in loadout" onComplete={() => void c.confirm()} disabled={c.busy}>
            Hold to lock in
          </HoldButton>
          <p className="text-ink-muted">Press and hold the circle for 1.5 seconds.</p>
          {c.error && <Notice tone="danger" title="Could not lock in">{c.error}</Notice>}
        </section>
      </div>
    </QuestFrame>
  )
}
