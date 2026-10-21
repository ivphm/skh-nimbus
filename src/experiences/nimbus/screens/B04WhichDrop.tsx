import { useWorkOrders } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { NimbusFrame } from '../NimbusFrame'

/** B4 · Which drop? (pick a work order, I2b). */
export default function WhichDrop() {
  const { workOrders, select, closeJob, openLoansOn } = useWorkOrders()
  return (
    <NimbusFrame>
      <h1 className="font-display text-4xl font-extrabold">Which job are you helping?</h1>
      <p className="text-lg text-ink-muted">Each work order is a drop. The more drops, the more urgent.</p>
      <ul className="mt-6 grid grid-cols-3 gap-5">
        {workOrders.map((wo) => (
          <li key={wo.id}>
            <Card className="flex h-full flex-col gap-2">
              <span className="text-2xl text-accent" aria-label={`Urgency ${wo.urgency} of 3`}>
                {'💧'.repeat(wo.urgency)}
              </span>
              <h2 className="font-display text-xl font-bold">
                {wo.equipment} · {wo.area}
              </h2>
              <p className="flex-1 text-ink-muted">“{wo.description}” – {wo.requester}</p>
              <p className="text-sm font-semibold text-reward">+{wo.urgency} sun on close</p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => select(wo.id)}>
                  Help with this
                </Button>
                {openLoansOn(wo.id).length > 0 && (
                  <Button variant="secondary" onClick={() => closeJob(wo.id)}>
                    Close job
                  </Button>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </NimbusFrame>
  )
}
