import { useNavigate } from 'react-router'
import { pathFor } from '@/app/routes'
import { useDrawing } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { BackButton } from '@/ui/BackButton'
import { Card } from '@/ui/Card'
import { ConfirmSheet } from '@/ui/ConfirmSheet'
import { timeOfDay } from '@/ui/format'
import { QuestFrame } from '../QuestFrame'

/** A4 · Mission briefing: the work order and its recommended loadout (I3d). */
export default function MissionBriefing() {
  const d = useDrawing()
  const navigate = useNavigate()
  const wo = d.workOrder
  return (
    <QuestFrame>
      <BackButton label="Quest board" onClick={d.changeWorkOrder} />
      {wo && (
        <div className="grid grid-cols-[1.2fr_1fr] gap-8">
          <section className="space-y-4">
            <p className="text-ink-muted">{wo.id}</p>
            <h1 className="font-display text-4xl font-bold">Fix the {wo.equipment.toLowerCase()}</h1>
            <p className="text-xl">“{wo.description}”</p>
            <p className="text-ink-muted">
              – {wo.requester}, {wo.area} · raised {timeOfDay(wo.raisedAt)}
            </p>
            <Card>
              <h2 className="font-display text-lg font-semibold">Objectives</h2>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-ink-muted">
                <li>Collect parts</li>
                <li>Repair the {wo.equipment.toLowerCase()}</li>
                <li>Debrief: close the loan</li>
              </ol>
            </Card>
            <div className="flex gap-3">
              <Button size="lg" onClick={() => navigate(pathFor('cart'))}>
                Open backpack {d.count > 0 && `(${d.count})`}
              </Button>
            </div>
          </section>
          <Card>
            <h2 className="font-display text-lg font-semibold">Recommended loadout</h2>
            <p className="text-sm text-ink-muted">Parts most often used on missions like this.</p>
            <ul className="mt-3 space-y-2">
              {d.suggestions.map((s) => (
                <li key={s.partId} className="flex items-center gap-3 rounded-control bg-surface-2 px-3 py-2">
                  <span className="flex-1">
                    {s.part.name}
                    <span className="block text-sm text-ink-muted">Used in {s.usedIn} of 10 missions</span>
                  </span>
                  <Button variant="secondary" onClick={() => d.add(s.partId)}>
                    {d.qtyOf(s.partId) > 0 ? `×${d.qtyOf(s.partId)}` : 'Add'}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      {d.confirmingChange && (
        <ConfirmSheet title="Pick a different job?" confirmLabel="Empty list and go back" onConfirm={d.confirmChange} onCancel={d.cancelChange}>
          The {d.count} {d.count === 1 ? 'part' : 'parts'} in your list will be removed. Put them back on the shelf.
        </ConfirmSheet>
      )}
    </QuestFrame>
  )
}
