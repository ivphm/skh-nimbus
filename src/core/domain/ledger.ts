import type { CartLine, Loan, Location, Part, ReorderFlag } from './types'

/**
 * How long a loan stays open before it counts as overdue.
 * Open point in the plan: may later vary by part type or work order priority.
 */
export const OVERDUE_AFTER_HOURS = 48

const HOUR = 60 * 60 * 1000

export function loanAgeHours(loan: Loan, now: Date): number {
  return (now.getTime() - new Date(loan.drawnAt).getTime()) / HOUR
}

export function isOverdue(loan: Loan, now: Date): boolean {
  return loan.status === 'active' && loanAgeHours(loan, now) >= OVERDUE_AFTER_HOURS
}

/** Active loans, oldest first, as the Parts Out board lists them. */
export function partsOut(loans: Loan[]): Loan[] {
  return loans
    .filter((l) => l.status === 'active')
    .sort((a, b) => a.drawnAt.localeCompare(b.drawnAt))
}

/** Share of active loans that are on time, 0 to 100. 100 when nothing is out. */
export function roomHealth(loans: Loan[], now: Date): number {
  const active = loans.filter((l) => l.status === 'active')
  if (active.length === 0) return 100
  const late = active.filter((l) => isOverdue(l, now)).length
  return Math.round(((active.length - late) / active.length) * 100)
}

export type StockProblem = { partId: string; reason: 'unknown-part' | 'out-of-stock' }

/** Checks a draw against live stock. Returns the first problem, or null. */
export function checkDraw(parts: Part[], lines: CartLine[]): StockProblem | null {
  for (const line of lines) {
    const part = parts.find((p) => p.id === line.partId)
    if (!part) return { partId: line.partId, reason: 'unknown-part' }
    if (part.stock < line.qty) return { partId: line.partId, reason: 'out-of-stock' }
  }
  return null
}

export function reorderFlags(parts: Part[], pendingBems: Set<string> = new Set()): ReorderFlag[] {
  return parts
    .filter((p) => p.stock < p.threshold)
    .map((p) => ({ partId: p.id, stock: p.stock, threshold: p.threshold, bemsSyncPending: pendingBems.has(p.id) }))
}

/** Location label, so the LED strip is never the only cue. */
export function locationLabel(location: Location | null): string {
  if (!location) return 'Location unknown'
  return location.bin ? `Shelf ${location.slot} · Bin ${location.bin}` : `Shelf ${location.slot}`
}

export function addToCart(cart: CartLine[], partId: string, qty = 1): CartLine[] {
  const existing = cart.find((l) => l.partId === partId)
  if (existing) return cart.map((l) => (l.partId === partId ? { ...l, qty: l.qty + qty } : l))
  return [...cart, { partId, qty }]
}

export function setCartQty(cart: CartLine[], partId: string, qty: number): CartLine[] {
  if (qty <= 0) return cart.filter((l) => l.partId !== partId)
  return cart.map((l) => (l.partId === partId ? { ...l, qty } : l))
}
