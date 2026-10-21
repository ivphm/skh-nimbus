import { Link } from 'react-router'
import { usePartsOutBoard, useWake } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { ExperienceToggle } from '@/ui/ExperienceToggle'
import { NimbusFrame } from '../NimbusFrame'
import { Sun } from '../Sun'

/** B1 · Sky (idle) */
export default function Sky() {
  const { wake, tapCard } = useWake()
  const board = usePartsOutBoard()
  const clouds = board.loans.filter(board.isOverdue).length
  return (
    <NimbusFrame right={<ExperienceToggle />}>
      <div className="grid h-full grid-cols-[1.2fr_1fr] items-center gap-8">
        <div className="flex flex-col gap-6">
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
        <div className="grid place-items-center">
          <Sun mood="sleepy" size={340} />
        </div>
      </div>
    </NimbusFrame>
  )
}
