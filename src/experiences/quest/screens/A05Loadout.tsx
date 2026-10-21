import { Link, useNavigate } from 'react-router'
import { pathFor } from '@/app/routes'
import { useDrawing } from '@/app/viewModels'
import { BackButton } from '@/ui/BackButton'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { QtyStepper } from '@/ui/QtyStepper'
import { QuestFrame } from '../QuestFrame'

const SLOTS = 6

/** A5 · Loadout (backpack): the current list plus search, browse by machine and scan (I3, I3b). */
export default function Loadout() {
  const d = useDrawing()
  const navigate = useNavigate()
  return (
    <QuestFrame>
      <BackButton label="Mission briefing" onClick={() => navigate(pathFor('briefing'))} />
      <div className="grid grid-cols-[1fr_1.1fr] gap-8">
        <section>
          <h1 className="font-display text-3xl font-bold">Backpack</h1>
          <p className="text-ink-muted">
            {d.workOrder?.id} · Fill the slots with parts for the job. Each part you scan or add fills a slot.
          </p>
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {Array.from({ length: SLOTS }, (_, i) => d.lines[i]).map((line, i) => (
              <li key={line?.partId ?? `empty-${i}`} className={`flex min-h-32 flex-col justify-between rounded-card border p-3 ${line ? 'border-accent bg-surface' : 'border-dashed border-border'}`}>
                {line ? (
                  <>
                    <span className="font-semibold">{line.part.name}</span>
                    <QtyStepper value={line.qty} label={line.part.name} max={line.part.stock} onChange={(n) => d.setQty(line.partId, n)} />
                  </>
                ) : (
                  <span className="m-auto text-3xl text-ink-muted" aria-hidden="true">
                    +
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <Button size="lg" onClick={d.review} disabled={d.count === 0}>
              Lock in loadout
            </Button>
            <Link to={pathFor('scan')} className="inline-flex min-h-16 items-center rounded-control border border-border px-6 font-display font-semibold">
              Scan a part
            </Link>
          </div>
        </section>
        <Card>
          <h2 className="font-display text-lg font-semibold">Find parts</h2>
          <input
            type="search"
            value={d.search}
            onChange={(e) => d.setSearch(e.target.value)}
            placeholder="Name, part number or machine"
            aria-label="Search parts"
            className="mt-2 min-h-12 w-full rounded-control border border-border bg-surface-2 px-4"
          />
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Browse by machine">
            {d.machines.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={d.machine === m}
                onClick={() => d.setMachine(d.machine === m ? null : m)}
                className={`min-h-10 rounded-control border px-3 text-sm ${d.machine === m ? 'border-accent bg-accent text-accent-ink' : 'border-border'}`}
              >
                {m}
              </button>
            ))}
          </div>
          <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
            {d.results.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-control bg-surface-2 px-3 py-2">
                <span className="flex-1">
                  {p.name}
                  <span className="block text-sm text-ink-muted">{p.stock} in stock</span>
                </span>
                <Link to={pathFor('locate', { partId: p.id })} className="min-h-12 content-center px-3 text-sm underline">
                  Locate
                </Link>
                <Button variant="secondary" disabled={p.stock <= d.qtyOf(p.id)} onClick={() => d.add(p.id)}>
                  Add
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </QuestFrame>
  )
}
