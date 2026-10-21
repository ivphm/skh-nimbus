import { describe, expect, it, vi } from 'vitest'
import { createEventBus } from './bus'
import { applyEvent, emptyProgress, streakDays } from './progress'
import { levelFor, rankedUp, rewardsFor } from './rules'

describe('event bus', () => {
  it('delivers typed events and unsubscribes', () => {
    const bus = createEventBus()
    const scanned = vi.fn()
    const any = vi.fn()
    const off = bus.on('part.scanned', scanned)
    bus.onAny(any)
    bus.emit({ type: 'part.scanned', staffId: 's', partId: 'p', cleanStreak: 1 })
    off()
    bus.emit({ type: 'part.scanned', staffId: 's', partId: 'p', cleanStreak: 2 })
    expect(scanned).toHaveBeenCalledTimes(1)
    expect(any).toHaveBeenCalledTimes(2)
  })
})

describe('rules', () => {
  it('adds a combo bonus from the second clean scan', () => {
    expect(rewardsFor({ type: 'part.scanned', staffId: 's', partId: 'p', cleanStreak: 1 })).toHaveLength(1)
    expect(rewardsFor({ type: 'part.scanned', staffId: 's', partId: 'p', cleanStreak: 2 })).toHaveLength(2)
  })

  it('rewards closing a teammate’s overdue loan', () => {
    const r = rewardsFor({ type: 'loan.closed', staffId: 's', loanId: 'L', partId: 'p', outcome: 'returned', forTeammate: true, wasOverdue: true })
    expect(r.map((x) => x.reason)).toEqual(['Loan returned', 'Squad assist', 'Overdue cleared'])
    expect(r.reduce((n, x) => n + x.suns, 0)).toBe(3)
  })

  it('maps XP to ranks', () => {
    expect(levelFor(340)).toMatchObject({ level: 4, rank: { name: 'Technician' }, progress: { current: 340, target: 500 } })
    expect(levelFor(2000).next).toBeNull()
    expect(rankedUp(490, 520)).toBe(true)
    expect(rankedUp(300, 320)).toBe(false)
  })
})

describe('progress', () => {
  it('accumulates XP, suns, Partdex and badges', () => {
    let p = emptyProgress
    p = applyEvent(p, { type: 'part.scanned', staffId: 's', partId: 'p-012', cleanStreak: 1 }, '2026-10-21').progress
    p = applyEvent(p, { type: 'loan.confirmed', staffId: 's', workOrderId: 'WO', partCount: 1 }, '2026-10-21').progress
    expect(p).toMatchObject({ xp: 15, suns: 1, collected: ['p-012'], badges: ['first-scan'], activeDays: ['2026-10-21'] })
  })

  it('counts consecutive active days', () => {
    expect(streakDays(['2026-10-19', '2026-10-20', '2026-10-21'], '2026-10-21')).toBe(3)
    expect(streakDays(['2026-10-18', '2026-10-21'], '2026-10-21')).toBe(1)
    expect(streakDays([], '2026-10-21')).toBe(0)
  })
})
