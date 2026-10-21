import { useParams } from 'react-router'
import { useBackToFlow, useLocate } from '@/app/viewModels'
import { BackButton } from '@/ui/BackButton'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ErrorNotice } from '@/ui/Notice'
import { ShelfMap } from '@/ui/ShelfMap'
import { NimbusFrame } from '../NimbusFrame'

/** B6 · Follow the light (locate, I3c). */
export default function FollowTheLight() {
  const { partId } = useParams()
  const l = useLocate(partId)
  const back = useBackToFlow('cart')
  return (
    <NimbusFrame>
      <BackButton label="My bag" onClick={back} />
      <div className="grid grid-cols-[1.5fr_1fr] gap-6">
        <ShelfMap location={l.part?.location ?? null} strip={l.strip.status} />
        <Card className="space-y-4">
          <h1 className="font-display text-3xl font-extrabold">Follow the light!</h1>
          {l.part?.location && (
            <p className="text-ink-muted">
              The LED strip is glowing under Shelf {l.part.location.shelf}. Your part is {l.part.location.bin ? `in Bin ${l.part.location.bin}` : `on ${l.part.location.slot}`}.
            </p>
          )}
          <p className="font-display text-xl font-bold">{l.part?.name}</p>
          {l.problem && <ErrorNotice code={l.problem} />}
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => void l.lightAgain()}>
              Light again
            </Button>
            <Button variant="ghost" onClick={() => void l.stop()}>
              Stop light
            </Button>
          </div>
          <p className="text-sm text-ink-muted">Scan the part when you have it. It goes straight into your bag.</p>
          <Button onClick={back}>Done, back to my bag</Button>
        </Card>
      </div>
    </NimbusFrame>
  )
}
