import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameEvent } from './bus'
import { rewardsFor, type Reward } from './rules'

/** Private per-user stats. Only shown to the signed-in user. */
export interface Progress {
  xp: number
  suns: number
  cleanStreak: number
  /** Consecutive days with at least one on-time action, as ISO dates. */
  activeDays: string[]
  /** Part ids the user has collected at least once (Partdex). */
  collected: string[]
  badges: string[]
}

export const emptyProgress: Progress = { xp: 0, suns: 0, cleanStreak: 0, activeDays: [], collected: [], badges: [] }

interface ProgressStore {
  byStaff: Record<string, Progress>
  /** Rewards from the most recent event, for toasts and success screens. */
  lastRewards: Reward[]
  apply: (event: GameEvent, today?: string) => Reward[]
  reset: () => void
}

export function applyEvent(progress: Progress, event: GameEvent, today: string): { progress: Progress; rewards: Reward[] } {
  const rewards = rewardsFor(event)
  const next: Progress = {
    ...progress,
    xp: progress.xp + rewards.reduce((n, r) => n + r.xp, 0),
    suns: progress.suns + rewards.reduce((n, r) => n + r.suns, 0),
  }
  if (event.type === 'part.scanned') {
    next.cleanStreak = event.cleanStreak
    if (!next.collected.includes(event.partId)) next.collected = [...next.collected, event.partId]
  }
  if (rewards.length > 0 && !next.activeDays.includes(today)) next.activeDays = [...next.activeDays, today]
  if (event.type === 'part.scanned' && !next.badges.includes('first-scan')) next.badges = [...next.badges, 'first-scan']
  if (event.type === 'loan.closed' && event.forTeammate && !next.badges.includes('closer'))
    next.badges = [...next.badges, 'closer']
  return { progress: next, rewards }
}

/** Length of the run of consecutive days ending today. */
export function streakDays(activeDays: string[], today: string): number {
  const days = new Set(activeDays)
  let n = 0
  const d = new Date(`${today}T00:00:00Z`)
  while (days.has(d.toISOString().slice(0, 10))) {
    n++
    d.setUTCDate(d.getUTCDate() - 1)
  }
  return n
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      byStaff: {},
      lastRewards: [],
      apply: (event, today = new Date().toISOString().slice(0, 10)) => {
        const current = get().byStaff[event.staffId] ?? emptyProgress
        const { progress, rewards } = applyEvent(current, event, today)
        set({ byStaff: { ...get().byStaff, [event.staffId]: progress }, lastRewards: rewards })
        return rewards
      },
      reset: () => set({ byStaff: {}, lastRewards: [] }),
    }),
    { name: 'skh-nimbus.progress', partialize: (s) => ({ byStaff: s.byStaff }) },
  ),
)

export function useStaffProgress(staffId: string | undefined): Progress {
  return useProgress((s) => (staffId ? (s.byStaff[staffId] ?? emptyProgress) : emptyProgress))
}
