import { useCloseJob } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ConfirmSheet } from '@/ui/ConfirmSheet'
import { ProgressBar } from '@/ui/ProgressBar'
import { NimbusFrame } from '../NimbusFrame'

/** B9 · Clear the clouds (close job, I6). Anyone can help close a loan. */
export default function ClearTheClouds() {
  const j = useCloseJob()
  return (
    <NimbusFrame>
      <h1 className="font-display text-4xl font-extrabold">Clear the clouds on {j.workOrder?.id}</h1>
      <p className="text-lg text-ink-muted">Mark each part as used up or returned. Anyone can help close a loan.</p>
      <ul className="mt-6 space-y-3">
        {j.loans.map((loan) => {
          const choice = j.decisions[loan.id]
          return (
            <li key={loan.id}>
              <Card className="flex items-center gap-4">
                <span className="text-3xl" aria-hidden="true">
                  {choice ? '☀' : '☁'}
                </span>
                <span className="flex-1">
                  <span className="font-semibold">
                    {j.parts.get(loan.partId)?.name} ×{loan.qty}
                  </span>
                  <span className="block text-sm text-ink-muted">
                    Loaned by {loan.drawnBy === j.staff?.id ? 'you' : j.people.get(loan.drawnBy)?.shortName}
                    {j.isOverdue(loan) && ' · overdue'}
                  </span>
                </span>
                {(['used', 'returned'] as const).map((o) => (
                  <Button key={o} variant={choice === o ? 'primary' : 'secondary'} aria-pressed={choice === o} onClick={() => j.decide(loan, o)}>
                    {o === 'used' ? 'Used up' : 'Returned'}
                  </Button>
                ))}
              </Card>
            </li>
          )
        })}
      </ul>
      <div className="mt-6 flex items-center gap-4">
        <div className="w-64">
          <p className="text-sm">
            {j.decidedCount} of {j.loans.length} clouds cleared
          </p>
          <ProgressBar value={j.decidedCount} max={j.loans.length} label="Clouds cleared" barClassName="bg-reward" className="mt-1" />
        </div>
        <Button size="lg" disabled={j.decidedCount === 0 || j.busy} onClick={() => void j.finish()}>
          Close the job
        </Button>
        <Button size="lg" variant="ghost" onClick={j.back}>
          Back
        </Button>
      </div>
      {j.pending && (
        <ConfirmSheet
          title={`Close ${j.people.get(j.pending.loan.drawnBy)?.shortName}’s loan?`}
          confirmLabel={j.pending.outcome === 'used' ? 'Mark used up' : 'Mark returned'}
          onConfirm={j.confirmPending}
          onCancel={j.cancelPending}
        >
          The record keeps who drew it and that you closed it.
        </ConfirmSheet>
      )}
    </NimbusFrame>
  )
}
