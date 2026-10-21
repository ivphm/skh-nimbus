import { describe, expect, it } from 'vitest'
import { makeLoans, parts } from './fixtures'
import { addToCart, checkDraw, isOverdue, locationLabel, partsOut, reorderFlags, roomHealth, setCartQty } from './ledger'

const now = new Date('2026-10-21T09:00:00Z')

describe('ledger', () => {
  it('marks loans older than the threshold as overdue', () => {
    const [mine, priyas, meis] = makeLoans(now.getTime())
    expect(isOverdue(mine, now)).toBe(true)
    expect(isOverdue(priyas, now)).toBe(true)
    expect(isOverdue(meis, now)).toBe(false)
  })

  it('lists parts out oldest first and ignores closed loans', () => {
    const loans = makeLoans(now.getTime())
    loans[2].status = 'returned'
    expect(partsOut(loans).map((l) => l.id)).toEqual(['L-2', 'L-1'])
  })

  it('computes room health from overdue share', () => {
    expect(roomHealth([], now)).toBe(100)
    expect(roomHealth(makeLoans(now.getTime()), now)).toBe(33)
  })

  it('rejects draws above live stock', () => {
    expect(checkDraw(parts, [{ partId: 'p-012', qty: 2 }])).toBeNull()
    expect(checkDraw(parts, [{ partId: 'p-004', qty: 3 }])).toEqual({ partId: 'p-004', reason: 'out-of-stock' })
    expect(checkDraw(parts, [{ partId: 'nope', qty: 1 }])?.reason).toBe('unknown-part')
  })

  it('flags parts below their threshold', () => {
    expect(reorderFlags(parts).map((f) => f.partId)).toEqual(['p-004'])
  })

  it('labels locations with a text fallback', () => {
    expect(locationLabel(parts[0].location)).toBe('Shelf B3 · Bin 12')
    expect(locationLabel(null)).toBe('Location unknown')
  })

  it('merges and removes cart lines', () => {
    let cart = addToCart([], 'p-012')
    cart = addToCart(cart, 'p-012', 2)
    expect(cart).toEqual([{ partId: 'p-012', qty: 3 }])
    expect(setCartQty(cart, 'p-012', 0)).toEqual([])
  })
})
