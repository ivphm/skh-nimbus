import { useCloseJob } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ConfirmSheet } from '@/ui/ConfirmSheet'
import { QuestFrame } from '../QuestFrame'

/** A9 · Mission debrief (close job, I6). Anyone can close anyone's loan. */
export default function Debrief() {
  const j = useCloseJob()
  return (
    <QuestFrame>
      <div className="grid grid-cols-[1.4fr_1fr] gap-8">
        <section>
          <h1 className="font-display text-3xl font-bold">Mission debrief · {j.workOrder?.id}</h1>
          <p className="text-ink-muted">Report what happened to each part taken for this job.</p>
          <ul className="mt-4 space-y-3">
            {j.loans.map((loan) => {
              const choice = j.decisions[loan.id]
              const mine = loan.drawnBy === j.staff?.id
              return (
                <li key={loan.id}>
                  <Card className="flex items-center gap-4">
                    <span className="flex-1">
                      <span className="font-semibold">{j.parts.get(loan.partId)?.name}</span> · Took ×{loan.qty}
                      <span className="block text-sm text-ink-muted">
                        {mine ? 'Your loan' : `Loaned by ${j.people.get(loan.drawnBy)?.shortName}`}
                        {j.isOverdue(loan) && ' · overdue'}
                      </span>
                    </span>
                    {(['used', 'returned'] as const).map((o) => (
                      <Button key={o} variant={choice === o ? 'primary' : 'secondary'} aria-pressed={choice === o} onClick={() => j.decide(loan, o)}>
                        {o === 'used' ? 'Used' : 'Returned'}
                      </Button>
                    ))}
                  </Card>
                </li>
              )
            })}
          </ul>
          <div className="mt-6 flex gap-3">
            <Button size="lg" disabled={j.decidedCount === 0 || j.busy} onClick={() => void j.finish()}>
              Complete debrief
            </Button>
            <Button size="lg" variant="ghost" onClick={j.back}>
              Back
            </Button>
          </div>
        </section>
        <Card>
          <h2 className="font-display text-lg font-semibold">Rewards waiting</h2>
          <ul className="mt-2 space-y-1 text-ink-muted">
            <li>Loan returned +30 XP</li>
            <li>Squad assist +15 XP</li>
            <li>Overdue cleared +20 XP</li>
          </ul>
          <p className="mt-3 text-sm text-ink-muted">Squad assist: closing a teammate’s loan earns bonus XP.</p>
        </Card>
      </div>
      {j.pending && (
        <ConfirmSheet
          title={`Close ${j.people.get(j.pending.loan.drawnBy)?.shortName}’s loan?`}
          confirmLabel={`Mark ${j.pending.outcome}`}
          onConfirm={j.confirmPending}
          onCancel={j.cancelPending}
        >
          The record keeps who drew it and that you closed it.
        </ConfirmSheet>
      )}
    </QuestFrame>
  )
}
