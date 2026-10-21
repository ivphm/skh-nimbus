import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useProgress } from '@/core/gamification/progress'
import { useSuccess } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { celebrate } from '@/ui/celebrate'
import { QuestFrame } from '../QuestFrame'

/** A10 · Level up! (success, I5). Signs out automatically. */
export default function LevelUp() {
  const s = useSuccess()
  const rewards = useProgress((p) => p.lastRewards)
  useEffect(() => celebrate('big'), [])
  if (!s.state) return null
  return (
    <QuestFrame>
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <motion.p initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-7xl font-bold text-reward">
          {s.state.kind === 'loan' ? 'LOADOUT LOCKED' : 'MISSION COMPLETE'}
        </motion.p>
        <p className="text-2xl">
          {s.level.rank.name} · Mission {s.state.workOrderId}
        </p>
        <Card className="min-w-96 text-left">
          <ul className="space-y-1">
            {rewards.map((r) => (
              <li key={r.reason} className="flex justify-between">
                <span>{r.reason}</span>
                <span className="font-bold text-reward">+{r.xp} XP</span>
              </li>
            ))}
          </ul>
        </Card>
        <p className="text-ink-muted" aria-live="polite">
          Signing out in {s.secondsLeft} s · light strip cleared
        </p>
        <Button variant="secondary" onClick={() => void s.signOut()}>
          Sign out now
        </Button>
      </div>
    </QuestFrame>
  )
}
