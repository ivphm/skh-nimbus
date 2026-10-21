import { Link, useParams } from 'react-router'
import { pathFor } from '@/app/routes'
import { useBackToFlow, useLocate } from '@/app/viewModels'
import { BackButton } from '@/ui/BackButton'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ErrorNotice } from '@/ui/Notice'
import { ShelfMap } from '@/ui/ShelfMap'
import { QuestFrame } from '../QuestFrame'

/** A6 · Treasure map (locate part, I3c). */
export default function TreasureMap() {
  const { partId } = useParams()
  const l = useLocate(partId)
  const back = useBackToFlow('cart')
  return (
    <QuestFrame>
      <BackButton label="Backpack" onClick={back} />
      <div className="grid grid-cols-[1.5fr_1fr] gap-8">
        <ShelfMap location={l.part?.location ?? null} strip={l.strip.status} />
        <Card className="space-y-4">
          <h1 className="font-display text-2xl font-bold">Find the loot</h1>
          {l.part && (
            <p className="text-xl">
              {l.part.name}
              <span className="block text-base text-ink-muted">{l.part.stock} in stock</span>
            </p>
          )}
          {l.problem && <ErrorNotice code={l.problem} />}
          <ol className="list-inside list-decimal space-y-1 text-ink-muted">
            <li>Walk to shelf {l.part?.location?.shelf ?? '?'}</li>
            <li>Follow the glowing strip</li>
            <li>Scan the bin tag to collect</li>
          </ol>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => void l.lightAgain()}>
              Light again
            </Button>
            <Button variant="ghost" onClick={() => void l.stop()}>
              Stop light
            </Button>
            <Link to={pathFor('scan')} className="inline-flex min-h-12 items-center rounded-control bg-accent px-5 font-display font-semibold text-accent-ink">
              Scan to add
            </Link>
          </div>
        </Card>
      </div>
    </QuestFrame>
  )
}
