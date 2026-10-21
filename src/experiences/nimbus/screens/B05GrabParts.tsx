import { Link } from 'react-router'
import { pathFor } from '@/app/routes'
import { useLastScan } from '@/app/scan'
import { useDrawing } from '@/app/viewModels'
import type { Part } from '@/core/domain/types'
import { services } from '@/core/services'
import { BackButton } from '@/ui/BackButton'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ConfirmSheet } from '@/ui/ConfirmSheet'
import { partNo } from '@/ui/format'
import { ErrorNotice } from '@/ui/Notice'
import { QtyStepper } from '@/ui/QtyStepper'
import { NimbusFrame } from '../NimbusFrame'

function Sticker({ part, onAdd, inBag }: { part: Part; onAdd: () => void; inBag: number }) {
  return (
    <li>
      <Card className="flex h-full flex-col gap-2">
        <span className="text-sm text-ink-muted">{partNo(part.number)}</span>
        <span className="font-display font-bold">{part.name}</span>
        <span className="text-sm text-ink-muted">{part.stock} in stock</span>
        <div className="mt-auto flex gap-2">
          <Button className="flex-1" onClick={onAdd} disabled={part.stock <= inBag}>
            {inBag > 0 ? `In bag ×${inBag}` : 'Add'}
          </Button>
          <Link to={pathFor('locate', { partId: part.id })} className="min-h-12 content-center px-2 text-sm font-semibold underline">
            Find
          </Link>
        </div>
      </Card>
    </li>
  )
}

/** B5 · Grab parts (Partdex). Suggested parts, search, browse by machine and scan in one place (I3, I3a, I3b, I3d). */
export default function GrabParts() {
  const d = useDrawing()
  const scan = useLastScan((s) => s.outcome)
  const suggestedIds = new Set(d.suggestions.map((s) => s.partId))
  return (
    <NimbusFrame>
      <BackButton label="Pick another job" onClick={d.changeWorkOrder} />
      <div className="grid grid-cols-[1.6fr_1fr] gap-6">
        <section>
          <h1 className="font-display text-4xl font-extrabold">Grab your parts</h1>
          <p className="text-ink-muted">
            {d.workOrder?.id} · {d.workOrder?.equipment}. Scan any part, or pick from the suggestions.
          </p>
          <h2 className="mt-4 font-display text-lg font-bold">Suggested for this job</h2>
          <ul className="mt-2 grid grid-cols-3 gap-4">
            {d.suggestions.map((s) => (
              <Sticker key={s.partId} part={s.part} inBag={d.qtyOf(s.partId)} onAdd={() => d.add(s.partId)} />
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <input
              type="search"
              value={d.search}
              onChange={(e) => d.setSearch(e.target.value)}
              placeholder="Search name, number or machine"
              aria-label="Search parts"
              className="min-h-12 flex-1 rounded-control border border-border bg-surface px-5"
            />
            <select
              aria-label="Browse by machine"
              value={d.machine ?? ''}
              onChange={(e) => d.setMachine(e.target.value || null)}
              className="min-h-12 rounded-control border border-border bg-surface px-4"
            >
              <option value="">All machines</option>
              {d.machines.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          {(d.search || d.machine) && (
            <ul className="mt-4 grid grid-cols-3 gap-4">
              {d.results
                .filter((p) => !suggestedIds.has(p.id))
                .map((p) => (
                  <Sticker key={p.id} part={p} inBag={d.qtyOf(p.id)} onAdd={() => d.add(p.id)} />
                ))}
            </ul>
          )}
        </section>
        <Card className="flex flex-col gap-3 self-start">
          <h2 className="font-display text-xl font-bold">Your bag</h2>
          {scan && !scan.ok && <ErrorNotice code={scan.error} />}
          {d.lines.length === 0 && <p className="text-ink-muted">Empty. Scan a part to add it.</p>}
          <ul className="space-y-2">
            {d.lines.map((l) => (
              <li key={l.partId} className="flex items-center gap-2">
                <span className="flex-1">{l.part.name}</span>
                <QtyStepper value={l.qty} label={l.part.name} max={l.part.stock} onChange={(n) => d.setQty(l.partId, n)} />
              </li>
            ))}
          </ul>
          <Button size="lg" onClick={d.review} disabled={d.count === 0}>
            Seal the loan
          </Button>
          <details className="text-sm text-ink-muted">
            <summary>Demo: simulate a scan</summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {d.suggestions.map((s) => (
                <Button key={s.partId} variant="ghost" onClick={() => services.scanner.simulate(s.part.barcode)}>
                  {s.part.name}
                </Button>
              ))}
            </div>
          </details>
        </Card>
      </div>
      {d.confirmingChange && (
        <ConfirmSheet title="Pick a different job?" confirmLabel="Empty list and go back" onConfirm={d.confirmChange} onCancel={d.cancelChange}>
          The {d.count} {d.count === 1 ? 'part' : 'parts'} in your list will be removed. Put them back on the shelf.
        </ConfirmSheet>
      )}
    </NimbusFrame>
  )
}
