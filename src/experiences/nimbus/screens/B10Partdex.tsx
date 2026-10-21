import { useMyStats } from '@/app/viewModels'
import { Card } from '@/ui/Card'
import { partNo } from '@/ui/format'
import { NimbusFrame } from '../NimbusFrame'

/** B10 · Partdex (sticker book, private stats I9). */
export default function Partdex() {
  const m = useMyStats()
  const got = new Set(m.progress.collected)
  return (
    <NimbusFrame>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl font-extrabold">Partdex</h1>
          <p className="text-lg text-ink-muted">
            {got.size} of {m.catalogue.length} collected · ☀ {m.progress.suns} suns · {m.streak} sunny {m.streak === 1 ? 'day' : 'days'} in a row
          </p>
        </div>
        <p className="text-sm text-ink-muted">Only you can see this.</p>
      </div>
      <ul className="mt-6 grid grid-cols-6 gap-4">
        {m.catalogue.map((p) => (
          <li key={p.id}>
            <Card className={`flex aspect-square flex-col items-center justify-center text-center ${got.has(p.id) ? '' : 'opacity-50'}`}>
              <span className="text-sm text-ink-muted">{partNo(p.number)}</span>
              <span className="font-display font-bold">{got.has(p.id) ? p.name : '?'}</span>
              {!got.has(p.id) && <span className="text-xs text-ink-muted">Not found yet</span>}
            </Card>
          </li>
        ))}
      </ul>
    </NimbusFrame>
  )
}
