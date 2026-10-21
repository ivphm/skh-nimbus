import { useWorkflowIn } from '@/core/workflow/store'
import { useLoanReview, useWorkOrders } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { loanAge } from '@/ui/format'
import { QuestFrame } from '../QuestFrame'

function SideQuest() {
  const review = useLoanReview()
  const loans = [...review.mine, ...review.overdueOthers]
  if (loans.length === 0) return null
  return (
    <Card className="border-warning">
      <h2 className="font-display text-lg font-semibold text-warning">
        Side quest: {loans.length} open {loans.length === 1 ? 'part' : 'parts'} to sort
      </h2>
      <p className="text-sm text-ink-muted">Keep, mark used or return each one. +20 XP for each overdue part cleared.</p>
      <ul className="mt-3 space-y-2">
        {loans.map((loan) => (
          <li key={loan.id} className="flex items-center gap-3 rounded-control bg-surface-2 px-3 py-2">
            <span className="flex-1">
              {review.parts.get(loan.partId)?.name} ×{loan.qty} · {loan.workOrderId}
              <span className="ml-2 text-sm text-ink-muted">
                {loan.drawnBy === review.staff?.id ? 'Yours' : review.people.get(loan.drawnBy)?.shortName} · {loanAge(loan, review.now)}
                {review.isOverdue(loan) && ' · overdue'}
              </span>
            </span>
            {loan.drawnBy === review.staff?.id && (
              <Button variant="ghost" onClick={() => void review.reconcile(loan, 'keep')}>
                Keep
              </Button>
            )}
            <Button variant="secondary" onClick={() => void review.reconcile(loan, 'used')}>
              Used
            </Button>
            <Button variant="secondary" onClick={() => void review.reconcile(loan, 'returned')}>
              Returned
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/** A3 · Quest board (pick a work order). Also hosts the overdue side quest (I2a). */
export default function QuestBoard() {
  const reviewing = useWorkflowIn('reviewingLoans')
  const { workOrders, select, closeJob, openLoansOn } = useWorkOrders()
  return (
    <QuestFrame>
      <h1 className="font-display text-3xl font-bold">Quest board</h1>
      <p className="text-ink-muted">Pick a mission. Work orders come from nurses and staff.</p>
      <div className="mt-4 space-y-4">
        {reviewing && <SideQuest />}
        <ul className="grid grid-cols-3 gap-4">
          {workOrders.map((wo) => (
            <li key={wo.id}>
              <Card className="flex h-full flex-col gap-2">
                <div className="text-sm text-ink-muted">
                  {wo.id} · Difficulty {wo.urgency}/3
                </div>
                <h2 className="font-display text-xl font-semibold">
                  {wo.equipment} · {wo.area}
                </h2>
                <p className="flex-1 text-ink-muted">“{wo.description}” – {wo.requester}</p>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => select(wo.id)}>
                    Accept mission
                  </Button>
                  {openLoansOn(wo.id).length > 0 && (
                    <Button variant="secondary" onClick={() => closeJob(wo.id)}>
                      Debrief
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </QuestFrame>
  )
}
