import { usePartsOutBoard } from '@/app/viewModels'
import { Card } from '@/ui/Card'
import { loanAge } from '@/ui/format'
import { NimbusFrame } from '../NimbusFrame'

/** B12 · Cloud board (outside display, O1/O2). View only. */
export default function CloudBoard() {
  const b = usePartsOutBoard()
  return (
    <NimbusFrame health={b.health} right={<span className="text-sm font-semibold text-ink-muted">View only · live</span>}>
      <h1 className="font-display text-4xl font-extrabold">Parts Out · Cloud board</h1>
      <p className="text-lg text-ink-muted">Parts currently out of the room. Grey clouds are overdue.</p>
      {b.loans.length === 0 ? (
        <p className="mt-16 text-center text-3xl font-bold">☀ Nothing checked out</p>
      ) : (
        <ul className="mt-6 grid grid-cols-3 gap-5">
          {b.loans.map((loan) => {
            const late = b.isOverdue(loan)
            return (
              <li key={loan.id}>
                <Card className={late ? 'bg-surface-2 grayscale' : ''}>
                  <p className="font-display text-xl font-bold">
                    <span aria-hidden="true">{late ? '☁ ' : '⛅ '}</span>
                    {b.parts.get(loan.partId)?.name} ×{loan.qty}
                  </p>
                  <p className="text-ink-muted">
                    {b.people.get(loan.drawnBy)?.shortName} · {loan.workOrderId} · {loanAge(loan, b.now)}
                  </p>
                  {late && <p className="font-semibold text-danger">Overdue</p>}
                  {!loan.confirmed && <p className="font-semibold text-warning">Unconfirmed</p>}
                </Card>
              </li>
            )
          })}
        </ul>
      )}
      <p className="mt-8 text-center text-ink-muted">Everything else is back on the shelf</p>
    </NimbusFrame>
  )
}
