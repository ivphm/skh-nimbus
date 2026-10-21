import { motion } from 'motion/react'
import { Link } from 'react-router'
import { usePartsOutBoard, useWake } from '@/app/viewModels'
import { ExperienceToggle } from '@/ui/ExperienceToggle'
import { NimbusFrame } from '../NimbusFrame'
import { Sun } from '../Sun'

/**
 * B1 · Sky (idle). Tapping the sun wakes Nimbus and starts Face ID straight away;
 * the sign-in screen offers the staff card as the fallback.
 */
export default function Sky() {
  const { wake } = useWake()
  const board = usePartsOutBoard()
  const clouds = board.loans.filter(board.isOverdue).length
  return (
    <NimbusFrame right={<ExperienceToggle />}>
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <motion.button
          type="button"
          onClick={wake}
          aria-label="Tap the sun to start"
          className="rounded-full"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sun mood="sleepy" size={300} />
        </motion.button>
        <motion.p
          aria-hidden="true"
          className="rounded-full bg-surface px-5 py-2 font-display font-bold text-accent shadow-sm"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          ☝ Tap the sun to start
        </motion.p>
        <h1 className="mt-3 font-display text-5xl font-extrabold">Nimbus is napping</h1>
        <p className="max-w-xl text-xl text-ink-muted">The parts room is sunny today. Look at the camera after you tap, or use your staff card.</p>
        {clouds > 0 && (
          <p className="text-lg">
            ☁ {clouds} rain {clouds === 1 ? 'cloud' : 'clouds'} waiting: overdue loans to clear
          </p>
        )}
        <Link
          to="/parts-out"
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-6 font-display font-bold text-ink shadow-sm hover:border-accent"
        >
          View parts out <span aria-hidden="true">→</span>
        </Link>
      </div>
    </NimbusFrame>
  )
}
