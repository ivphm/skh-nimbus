import { Link } from 'react-router'
import { usePartsOutBoard } from '@/app/viewModels'
import { Card } from '@/ui/Card'
import { loanAge } from '@/ui/format'
import { QuestFrame } from '../QuestFrame'

/** A12 · Out on missions (outside board, O1/O2). View only. */
export default function OutOnMissions() {
  const b = usePartsOutBoard()
  return (
    <QuestFrame right={<span className="text-sm text-ink-muted">View only · live</span>}>
      <Link to="/" className="mb-3 inline-flex min-h-12 items-center gap-2 font-display font-semibold text-ink-muted hover:text-ink">
        <span aria-hidden="true">←</span> Station
      </Link>
      <h1 className="font-display text-4xl font-bold">Out on missions</h1>
      {b.loans.length === 0 ? (
        <p className="mt-10 text-center text-2xl text-ink-muted">Nothing checked out</p>
      ) : (
        <ul className="mt-6 grid grid-cols-3 gap-4">
          {b.loans.map((loan) => (
            <li key={loan.id}>
              <Card className={b.isOverdue(loan) ? 'border-danger' : ''}>
                <p className="font-display text-xl font-semibold">
                  {b.parts.get(loan.partId)?.name} ×{loan.qty}
                </p>
                <p className="text-ink-muted">
                  {loan.workOrderId} · {b.people.get(loan.drawnBy)?.shortName} · {loanAge(loan, b.now)}
                </p>
                {b.isOverdue(loan) && <p className="mt-1 font-semibold text-danger">Overdue</p>}
                {!loan.confirmed && <p className="mt-1 font-semibold text-warning">Unconfirmed</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-center text-ink-muted">Scan your face at the station to start a mission.</p>
    </QuestFrame>
  )
}
