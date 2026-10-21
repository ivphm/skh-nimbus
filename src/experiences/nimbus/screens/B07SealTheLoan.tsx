import { locationLabel } from '@/core/domain/ledger'
import { useConfirm } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { HoldButton } from '@/ui/HoldButton'
import { Notice } from '@/ui/Notice'
import { QtyStepper } from '@/ui/QtyStepper'
import { NimbusFrame } from '../NimbusFrame'

/** B7 · Seal the loan (press and hold, I4). */
export default function SealTheLoan() {
  const c = useConfirm()
  return (
    <NimbusFrame>
      <div className="grid grid-cols-[1.2fr_1fr] gap-8">
        <Card>
          <h1 className="font-display text-3xl font-extrabold">Your loan · {c.workOrderId}</h1>
          <ul className="mt-4 space-y-3">
            {c.lines.map((l) => (
              <li key={l.partId} className="flex items-center gap-3">
                <span className="flex-1">
                  <span className="font-semibold">{l.part?.name}</span>
                  <span className="block text-sm text-ink-muted">{locationLabel(l.part?.location ?? null)}</span>
                </span>
                <QtyStepper value={l.qty} label={l.part?.name ?? l.partId} max={l.part?.stock} onChange={(n) => c.setQty(l.partId, n)} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-ink-muted">Sealing records the loan on your name. You or a teammate can close it later.</p>
          <Button variant="ghost" className="mt-2" onClick={c.back}>
            Back to my bag
          </Button>
        </Card>
        <section className="flex flex-col items-center justify-center gap-4 text-center">
          <HoldButton label="Hold to seal the loan" onComplete={() => void c.confirm()} disabled={c.busy}>
            Hold
          </HoldButton>
          <p className="font-display text-lg font-bold">to seal the loan</p>
          <p className="text-ink-muted">Press and hold the circle. Nimbus seals it with a little sunshine.</p>
          {c.error && <Notice tone="danger" title="Could not seal the loan">{c.error}</Notice>}
        </section>
      </div>
    </NimbusFrame>
  )
}
