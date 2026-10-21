import { Link } from 'react-router'
import { useTeamWeek, useWake } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { ExperienceToggle } from '@/ui/ExperienceToggle'
import { ProgressBar } from '@/ui/ProgressBar'
import { QuestFrame } from '../QuestFrame'

const SQUAD_GOAL = 20

/** A1 · Lobby (idle) */
export default function Lobby() {
  const { wake, tapCard } = useWake()
  const team = useTeamWeek()
  return (
    <QuestFrame right={<ExperienceToggle />}>
      <div className="grid h-full grid-cols-[1.4fr_1fr] gap-8">
        <section className="flex flex-col justify-center gap-6">
          <h1 className="font-display text-6xl font-bold">Parts Quest</h1>
          <p className="max-w-xl text-xl text-ink-muted">Every part you take and return powers up the squad. SKH Biomedical Engineering parts room.</p>
          <div className="flex gap-4">
            <Button size="lg" onClick={wake}>
              Look at the camera to start
            </Button>
            <Button size="lg" variant="secondary" onClick={tapCard}>
              Tap staff card
            </Button>
          </div>
          <Link to="/parts-out" className="text-ink-muted underline">
            View parts out
          </Link>
        </section>
        <aside className="flex flex-col justify-center gap-4">
          <Card>
            <h2 className="font-display text-lg font-semibold">Squad goal this week</h2>
            <p className="mt-2 text-3xl font-bold">
              {team.closedOnTime} / {SQUAD_GOAL} <span className="text-base font-normal text-ink-muted">jobs on time</span>
            </p>
            <ProgressBar value={team.closedOnTime} max={SQUAD_GOAL} label="Squad goal" barClassName="bg-success" className="mt-3" />
            <p className="mt-2 text-sm text-ink-muted">Hit {SQUAD_GOAL} to unlock a squad badge for everyone.</p>
          </Card>
          <Card>
            <h2 className="font-display text-lg font-semibold">Today’s quests</h2>
            <ul className="mt-2 space-y-2 text-ink-muted">
              <li>{team.overdue > 0 ? `Return ${team.overdue} overdue ${team.overdue === 1 ? 'part' : 'parts'}` : '✓ No overdue parts'}</li>
              <li>Close 2 jobs on time</li>
              <li>Scan every part, no typing</li>
            </ul>
          </Card>
        </aside>
      </div>
    </QuestFrame>
  )
}
