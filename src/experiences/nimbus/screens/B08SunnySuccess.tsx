import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useSuccess } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { celebrate } from '@/ui/celebrate'
import { NimbusFrame } from '../NimbusFrame'

/** B8 · Sunny success (+1 sun, I5). Signs out automatically. */
export default function SunnySuccess() {
  const s = useSuccess()
  useEffect(() => celebrate('small'), [])
  if (!s.state) return null
  const n = s.state.loanIds.length
  return (
    <NimbusFrame>
      <div className="flex h-full items-center gap-12">
        <motion.div
          aria-hidden="true"
          className="h-72 w-72 shrink-0 rounded-full bg-reward shadow-[0_0_100px_40px_var(--color-glow)]"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 120 }}
        />
        <div className="space-y-4">
          <h1 className="font-display text-5xl font-extrabold">{s.state.kind === 'loan' ? 'Sealed! Sunny skies' : 'Clouds cleared!'}</h1>
          <p className="text-xl">
            {n} {n === 1 ? 'part' : 'parts'} {s.state.kind === 'loan' ? 'out on' : 'closed on'} {s.state.workOrderId}. Thanks, {s.state.staff.name.split(' ')[0]}.
          </p>
          <Card>
            <p className="font-semibold">
              ☀ {s.progress.suns} {s.progress.suns === 1 ? 'sun' : 'suns'} collected
            </p>
            <p className="text-sm text-ink-muted">Everyone’s loans on time keep the room sunny.</p>
          </Card>
          <p className="text-ink-muted" aria-live="polite">
            Signing out in {s.secondsLeft} s
          </p>
          <Button variant="secondary" onClick={() => void s.signOut()}>
            Sign out now
          </Button>
        </div>
      </div>
    </NimbusFrame>
  )
}
