import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useSuccess } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { celebrate } from '@/ui/celebrate'
import { NimbusFrame } from '../NimbusFrame'
import { Sun } from '../Sun'

/** B8 · Sunny success (+1 sun, I5). Signs out automatically. */
export default function SunnySuccess() {
  const s = useSuccess()
  useEffect(() => celebrate('small'), [])
  if (!s.state) return null
  const n = s.state.loanIds.length
  return (
    <NimbusFrame>
      <div className="grid h-full grid-cols-[1.2fr_1fr] items-center gap-8">
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
          <p className="text-ink-muted">You’re still signed in.</p>
          <div className="flex gap-4">
            <Button size="lg" onClick={s.nextTask} autoFocus>
              Start another job
            </Button>
            <Button size="lg" variant="secondary" onClick={() => void s.signOut()}>
              Sign out
            </Button>
          </div>
        </div>
        <motion.div className="grid place-items-center" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }}>
          <Sun mood="happy" size={360} />
        </motion.div>
      </div>
    </NimbusFrame>
  )
}
