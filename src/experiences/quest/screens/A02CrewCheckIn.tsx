import { motion } from 'motion/react'
import { useSignIn } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ErrorNotice } from '@/ui/Notice'
import { ProgressBar } from '@/ui/ProgressBar'
import { QuestFrame } from '../QuestFrame'

/** A2 · Crew check-in. Face ID first, staff card as fallback, then "Welcome back" and Continue. */
export default function CrewCheckIn() {
  const s = useSignIn()
  if (s.recognised) {
    const { staff } = s.recognised
    const next = s.level.progress
    return (
      <QuestFrame>
        <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl font-bold">
            Welcome back, {staff.name.split(' ')[0]}!
          </motion.h1>
          <Card className="flex min-w-[28rem] items-center gap-5 text-left">
            <span className="grid h-16 w-16 place-items-center rounded-full border-4 border-reward font-display text-2xl font-bold text-reward" aria-label={`Level ${s.level.level}`}>
              {s.level.level}
            </span>
            <div className="flex-1">
              <p className="font-display text-xl font-semibold">{s.level.rank.name}</p>
              {next && (
                <>
                  <p className="text-sm text-ink-muted">{next.target - next.current} XP to {s.level.next?.name}</p>
                  <ProgressBar value={next.current} max={next.target} label="XP to next rank" barClassName="bg-reward" className="mt-2" />
                </>
              )}
            </div>
          </Card>
          <p className="text-ink-muted">{s.recognised.hasOpenLoans ? 'You have open or overdue parts to sort first.' : 'No open parts. Pick your next mission.'}</p>
          <div className="flex gap-4">
            <Button size="lg" onClick={s.proceed} autoFocus>
              Continue
            </Button>
            <Button size="lg" variant="ghost" onClick={s.notMe}>
              Not {staff.name.split(' ')[0]}? Use staff card
            </Button>
          </div>
          <p className="text-sm text-ink-muted" aria-live="polite">
            Continuing in {s.secondsLeft} s…
          </p>
        </div>
      </QuestFrame>
    )
  }
  return (
    <QuestFrame>
      <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
        <motion.div
          aria-hidden="true"
          className="grid h-56 w-56 place-items-center rounded-full border-4 border-accent"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <span className="text-6xl">{s.method === 'card' ? '▭' : '◉'}</span>
        </motion.div>
        <h1 className="font-display text-4xl font-bold" aria-live="polite">
          {s.method === 'card' ? 'Tap your staff card on the reader' : 'Crew check-in: hold still…'}
        </h1>
        {s.error && (
          <div className="w-full max-w-md text-left">
            <ErrorNotice code={s.error} />
          </div>
        )}
        <div className="flex gap-4">
          {s.method === 'face' && (
            <Button variant="secondary" size="lg" onClick={s.useCard}>
              Use staff card
            </Button>
          )}
          {s.error === 'sign-in-unavailable' && (
            <Button size="lg" onClick={s.retry}>
              Try again
            </Button>
          )}
          {s.error === 'card-not-read' && (
            <Button size="lg" onClick={s.useCard}>
              Try card again
            </Button>
          )}
          <Button variant="ghost" size="lg" onClick={s.cancel}>
            Cancel
          </Button>
        </div>
      </div>
    </QuestFrame>
  )
}
