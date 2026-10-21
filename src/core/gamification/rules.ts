import type { GameEvent } from './bus'

/** One line on a rewards summary, for example "Squad assist +15 XP". */
export interface Reward {
  reason: string
  xp: number
  suns: number
}

/** Tunable reward table. Values follow the Figma screens and are not final. */
export const REWARDS = {
  scan: 5,
  comboBonus: 5,
  confirm: 10,
  returned: 30,
  used: 20,
  squadAssist: 15,
  overdueCleared: 20,
} as const

export function rewardsFor(event: GameEvent): Reward[] {
  switch (event.type) {
    case 'part.scanned': {
      const out: Reward[] = [{ reason: 'Clean scan', xp: REWARDS.scan, suns: 0 }]
      if (event.cleanStreak >= 2) out.push({ reason: `Combo ×${event.cleanStreak}`, xp: REWARDS.comboBonus, suns: 0 })
      return out
    }
    case 'loan.confirmed':
      return [{ reason: 'Loan recorded', xp: REWARDS.confirm, suns: 1 }]
    case 'loan.closed': {
      const out: Reward[] = [
        event.outcome === 'returned'
          ? { reason: 'Loan returned', xp: REWARDS.returned, suns: 1 }
          : { reason: 'Part used on job', xp: REWARDS.used, suns: 1 },
      ]
      if (event.forTeammate) out.push({ reason: 'Squad assist', xp: REWARDS.squadAssist, suns: 1 })
      if (event.wasOverdue) out.push({ reason: 'Overdue cleared', xp: REWARDS.overdueCleared, suns: 1 })
      return out
    }
    case 'session.ended':
      return []
  }
}

export interface Rank {
  name: string
  minXp: number
}

export const RANKS: Rank[] = [
  { name: 'Apprentice', minXp: 0 },
  { name: 'Technician', minXp: 200 },
  { name: 'Senior Technician', minXp: 500 },
  { name: 'Chief Technician', minXp: 900 },
]

export const XP_PER_LEVEL = 100

export function levelFor(xp: number) {
  const index = RANKS.findLastIndex((r) => xp >= r.minXp)
  const rank = RANKS[index]
  const next = RANKS[index + 1] ?? null
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    rank,
    next,
    /** XP towards the next rank, for the "340 / 500 XP" bar. */
    progress: next ? { current: xp, target: next.minXp } : null,
  }
}

/** True when going from `before` to `after` XP crosses a rank boundary. */
export function rankedUp(before: number, after: number): boolean {
  return levelFor(before).rank.name !== levelFor(after).rank.name
}
