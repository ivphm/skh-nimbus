import { useCallback } from 'react'
import type { GameEvent } from '@/core/gamification/bus'
import type { Reward } from '@/core/gamification/rules'
import { celebrate } from '@/ui/celebrate'
import { RewardToasts } from '@/ui/RewardToasts'

const format = (r: Reward) => (r.xp > 0 ? `+${r.xp} XP · ${r.reason}` : null)

export function QuestEffects() {
  const onEvent = useCallback((e: GameEvent) => {
    if (e.type === 'loan.confirmed') celebrate('small')
  }, [])
  return <RewardToasts format={format} onEvent={onEvent} />
}
