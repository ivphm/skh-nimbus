import { motion } from 'motion/react'
import { Link } from 'react-router'
import { usePartsOutBoard, useWake } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { ExperienceToggle } from '@/ui/ExperienceToggle'
import { NimbusFrame } from '../NimbusFrame'

/** B1 · Sky (idle) */
export default function Sky() {
  const { wake, tapCard } = useWake()
  const board = usePartsOutBoard()
  const clouds = board.loans.filter(board.isOverdue).length
  return (
    <NimbusFrame right={<ExperienceToggle />}>
      <div className="relative flex h-full flex-col justify-center gap-6">
        <motion.div
          aria-hidden="true"
          className="absolute top-6 right-16 h-44 w-44 rounded-full bg-reward shadow-[0_0_80px_30px_var(--color-glow)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        <h1 className="font-display text-6xl font-extrabold">Nimbus is napping</h1>
        <p className="max-w-xl text-xl text-ink-muted">The parts room is sunny today. Tap to wake Nimbus and start.</p>
        <div className="flex gap-4">
          <Button size="lg" onClick={wake}>
            Wake Nimbus
          </Button>
          <Button size="lg" variant="secondary" onClick={tapCard}>
            Tap staff card
          </Button>
        </div>
        {clouds > 0 && (
          <p className="text-lg">
            ☁ {clouds} rain {clouds === 1 ? 'cloud' : 'clouds'} waiting: overdue loans to clear
          </p>
        )}
        <Link to="/parts-out" className="text-ink-muted underline">
          View parts out
        </Link>
      </div>
    </NimbusFrame>
  )
}
