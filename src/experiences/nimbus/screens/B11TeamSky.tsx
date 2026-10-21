import { useBackToFlow, useTeamWeek } from '@/app/viewModels'
import { BackButton } from '@/ui/BackButton'
import { Card } from '@/ui/Card'
import { NimbusFrame } from '../NimbusFrame'

/** B11 · Team sky (shared weekly forecast). Team totals only, no personal stats. */
export default function TeamSky() {
  const t = useTeamWeek()
  const back = useBackToFlow()
  return (
    <NimbusFrame>
      <BackButton onClick={back} />
      <h1 className="font-display text-4xl font-extrabold">Team weather this week</h1>
      <div className="mt-6 grid grid-cols-3 gap-5">
        <Card>
          <p className="text-5xl font-extrabold">{t.closedOnTime}</p>
          <p className="text-ink-muted">loans closed</p>
        </Card>
        <Card>
          <p className="text-5xl font-extrabold">{t.overdue}</p>
          <p className="text-ink-muted">rain clouds left</p>
        </Card>
        <Card>
          <p className="text-5xl font-extrabold">{t.health}%</p>
          <p className="text-ink-muted">room health</p>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="font-display text-xl font-bold">Team goal: a sunny week</h2>
        <p className="text-ink-muted">Hit 7 sunny days to unlock the Gold Power sticker pack for everyone.</p>
        <ul className="mt-4 flex gap-2" aria-label="Teammates">
          {t.people.map((p) => (
            <li key={p.id} className={`grid h-12 w-12 place-items-center rounded-full font-bold ${t.helpers.includes(p) ? 'bg-reward text-black' : 'bg-surface-2'}`} title={p.shortName}>
              {p.initials}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-ink-muted">{t.helpers.length} teammates helped keep the room sunny</p>
      </Card>
    </NimbusFrame>
  )
}
