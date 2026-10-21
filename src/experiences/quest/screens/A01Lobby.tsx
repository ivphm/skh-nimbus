import { motion } from 'motion/react'
import { Link } from 'react-router'
import { useTeamWeek, useWake } from '@/app/viewModels'
import { ExperienceToggle } from '@/ui/ExperienceToggle'
import { ProgressBar } from '@/ui/ProgressBar'
import { QuestCore } from '../QuestCore'
import { QuestFrame } from '../QuestFrame'

const SQUAD_GOAL = 20

/**
 * A1 · Lobby (idle). Same centred layout as Nimbus: tapping the core starts Face ID
 * straight away; the check-in screen offers the staff card as the fallback.
 */
export default function Lobby() {
  const { wake } = useWake()
  const team = useTeamWeek()
  return (
    <QuestFrame right={<ExperienceToggle />}>
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <motion.button
          type="button"
          onClick={wake}
          aria-label="Tap the core to start"
          className="rounded-full"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          <QuestCore size={280} />
        </motion.button>
        <motion.p
          aria-hidden="true"
          className="rounded-control border border-accent bg-surface px-5 py-2 font-display font-semibold tracking-wide text-reward"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          ▶ Tap the core to start
        </motion.p>
        <h1 className="mt-3 font-display text-5xl font-bold">Parts Quest</h1>
        <p className="max-w-xl text-lg text-ink-muted">
          Every part you take and return powers up the squad. Look at the camera after you tap, or use your staff card.
        </p>
        <div className="mt-1 flex items-center gap-4 rounded-control border border-border bg-surface px-5 py-3 text-sm">
          <span className="font-semibold">Squad goal</span>
          <ProgressBar value={team.closedOnTime} max={SQUAD_GOAL} label="Squad goal" barClassName="bg-success" className="w-40" />
          <span className="text-ink-muted">
            {team.closedOnTime} / {SQUAD_GOAL} jobs on time
          </span>
          {team.overdue > 0 && (
            <span className="text-warning">
              ⚔ {team.overdue} overdue side {team.overdue === 1 ? 'quest' : 'quests'}
            </span>
          )}
        </div>
        <Link
          to="/parts-out"
          className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-6 font-display font-semibold text-ink hover:border-accent"
        >
          View parts out <span aria-hidden="true">→</span>
        </Link>
      </div>
    </QuestFrame>
  )
}
