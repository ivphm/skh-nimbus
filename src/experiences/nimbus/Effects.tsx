import { useCallback } from 'react'
import type { GameEvent } from '@/core/gamification/bus'
import type { Reward } from '@/core/gamification/rules'
import { celebrate } from '@/ui/celebrate'
import { RewardToasts } from '@/ui/RewardToasts'

const format = (r: Reward) => (r.suns > 0 ? `+${r.suns} ☀ ${r.reason}` : null)

export function NimbusEffects() {
  const onEvent = useCallback((e: GameEvent) => {
    if (e.type === 'loan.closed' && e.wasOverdue) celebrate('small')
  }, [])
  return <RewardToasts format={format} onEvent={onEvent} />
}
