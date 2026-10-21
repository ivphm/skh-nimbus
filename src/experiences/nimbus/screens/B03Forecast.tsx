import { useLoanReview } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { loanAge } from '@/ui/format'
import { NimbusFrame } from '../NimbusFrame'

/** B3 · Today’s forecast (overdue and open loans, I2a). */
export default function Forecast() {
  const r = useLoanReview()
  const clouds = [...r.mine.filter(r.isOverdue), ...r.overdueOthers]
  const sunny = r.mine.filter((l) => !r.isOverdue(l))
  return (
    <NimbusFrame>
      <h1 className="font-display text-4xl font-extrabold">
        Morning, {r.staff?.name.split(' ')[0]}. {clouds.length > 0 ? `${clouds.length} rain ${clouds.length === 1 ? 'cloud' : 'clouds'}!` : 'Clear skies!'}
      </h1>
      <p className="text-lg text-ink-muted">Clear them to bring the sun back. Each cloud cleared earns a sun.</p>
      <div className="mt-6 grid grid-cols-2 gap-6">
        <section aria-labelledby="clouds">
          <h2 id="clouds" className="font-display text-xl font-bold">
            Overdue (anyone)
          </h2>
          <ul className="mt-3 space-y-3">
            {clouds.map((loan) => (
              <li key={loan.id}>
                <Card className="flex items-center gap-3 bg-surface-2">
                  <span className="text-3xl" aria-hidden="true">
                    ☁
                  </span>
                  <span className="flex-1">
                    <span className="font-semibold">
                      {r.parts.get(loan.partId)?.name} ×{loan.qty}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {loan.drawnBy === r.staff?.id ? 'Yours' : r.people.get(loan.drawnBy)?.shortName} · {loan.workOrderId} · {loanAge(loan, r.now)}
                    </span>
                  </span>
                  <Button variant="secondary" onClick={() => r.closeJob(loan.workOrderId)}>
                    Clear
                  </Button>
                </Card>
              </li>
            ))}
            {clouds.length === 0 && <p className="text-ink-muted">No rain clouds.</p>}
          </ul>
        </section>
        <section aria-labelledby="yours">
          <h2 id="yours" className="font-display text-xl font-bold">
            Yours, still on schedule
          </h2>
          <ul className="mt-3 space-y-3">
            {sunny.map((loan) => (
              <li key={loan.id}>
                <Card className="flex items-center gap-2">
                  <span className="flex-1">
                    {r.parts.get(loan.partId)?.name} ×{loan.qty} · {loan.workOrderId}
                    <span className="block text-sm text-ink-muted">Out {loanAge(loan, r.now)}</span>
                  </span>
                  <Button variant="ghost" onClick={() => void r.reconcile(loan, 'keep')}>
                    Keep
                  </Button>
                  <Button variant="secondary" onClick={() => void r.reconcile(loan, 'used')}>
                    Used
                  </Button>
                  <Button variant="secondary" onClick={() => void r.reconcile(loan, 'returned')}>
                    Returned
                  </Button>
                </Card>
              </li>
            ))}
            {sunny.length === 0 && <p className="text-ink-muted">Nothing else open.</p>}
          </ul>
        </section>
      </div>
      <Button size="lg" className="mt-8" onClick={r.done}>
        Continue
      </Button>
    </NimbusFrame>
  )
}
