import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useLastScan } from '@/app/scan'
import { useBackToFlow, useDrawing } from '@/app/viewModels'
import { BackButton } from '@/ui/BackButton'
import { services } from '@/core/services'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ErrorNotice } from '@/ui/Notice'
import { QuestFrame } from '../QuestFrame'
import { useStaffProgress } from '@/core/gamification/progress'

/** A7 · Collect (scan with combo, I3a). Camera assist: type the number if the barcode will not read. */
export default function Collect() {
  const d = useDrawing()
  const { outcome, at } = useLastScan()
  const progress = useStaffProgress(d.staff?.id)
  const [manual, setManual] = useState('')
  const back = useBackToFlow('cart')
  return (
    <QuestFrame>
      <BackButton label="Backpack" onClick={back} />
      <div className="grid grid-cols-[1.3fr_1fr] gap-8">
        <section className="relative grid aspect-video place-items-center rounded-card border border-border bg-black/60">
          <div aria-hidden="true" className="h-40 w-72 rounded-card border-4 border-dashed border-accent" />
          <p className="absolute bottom-4 text-ink-muted">Hold the barcode inside the box</p>
          <AnimatePresence>
            {outcome?.ok && (
              <motion.div
                key={at}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-6 rounded-card bg-success px-6 py-3 font-display text-xl font-bold text-black"
              >
                ✓ +1 {outcome.part.name} collected
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <Card className="space-y-4">
          <h1 className="font-display text-2xl font-bold">Collecting</h1>
          <p aria-live="polite" className="text-xl">
            {d.lines.length} / 6 slots filled
            {progress.cleanStreak >= 2 && <span className="ml-2 font-bold text-reward">COMBO ×{progress.cleanStreak}</span>}
          </p>
          {outcome && !outcome.ok && <ErrorNotice code={outcome.error} />}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (manual) services.scanner.simulate(manual)
              setManual('')
            }}
          >
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              inputMode="numeric"
              aria-label="Barcode number"
              placeholder="Type barcode number"
              className="min-h-12 flex-1 rounded-control border border-border bg-surface-2 px-4"
            />
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
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
          <div className="flex gap-3">
            <Button size="lg" onClick={d.review} disabled={d.count === 0}>
              Lock in loadout
            </Button>
          </div>
        </Card>
      </div>
    </QuestFrame>
  )
}
