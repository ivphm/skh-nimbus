import { RANKS } from '@/core/gamification/rules'
import { useBackToFlow, useMyStats } from '@/app/viewModels'
import { BackButton } from '@/ui/BackButton'
import { Card } from '@/ui/Card'
import { ProgressBar } from '@/ui/ProgressBar'
import { QuestFrame } from '../QuestFrame'

const BADGES: Record<string, string> = { 'first-scan': 'First scan', closer: 'Closer', 'night-owl': 'Night owl', 'perfect-week': 'Perfect week' }

/** A11 · Profile & rank ladder (private stats, I9). */
export default function Profile() {
  const m = useMyStats()
  const back = useBackToFlow()
  return (
    <QuestFrame>
      <BackButton onClick={back} />
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <h1 className="font-display text-2xl font-bold">{m.staff?.name}</h1>
          <p className="text-ink-muted">
            {m.level.rank.name} · {m.progress.xp} XP · {m.streak}-day streak
          </p>
          {m.level.progress && <ProgressBar value={m.level.progress.current} max={m.level.progress.target} label="XP to next rank" className="mt-3" barClassName="bg-reward" />}
          <p className="mt-3 text-sm text-ink-muted">Only you can see this.</p>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-semibold">Rank ladder</h2>
          <ol className="mt-2 space-y-2">
            {RANKS.map((r) => (
              <li key={r.name} className={r.name === m.level.rank.name ? 'font-bold text-reward' : 'text-ink-muted'}>
                {r.name} · {r.minXp} XP{r.name === m.level.rank.name && ' · you are here'}
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-semibold">Badges</h2>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {Object.entries(BADGES).map(([id, name]) => (
              <li key={id} className={`rounded-control px-3 py-2 text-center ${m.progress.badges.includes(id) ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-ink-muted'}`}>
                {name}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </QuestFrame>
  )
}
