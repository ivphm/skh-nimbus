import { makeLoans, makeWorkOrders, parts, staff, suggestions } from '@/core/domain/fixtures'
import type { Loan, Part, WorkOrder } from '@/core/domain/types'

/** In-memory Local Stock Ledger for the mock API. Reset between tests. */
export const db = {
  staff,
  parts: [] as Part[],
  workOrders: [] as WorkOrder[],
  loans: [] as Loan[],
  suggestions,
  /** Work orders closed locally and not yet pushed to BEMS. */
  bemsPending: new Set<string>(),
  nextLoan: 100,
}

export function resetDb(now = Date.now()) {
  db.parts = structuredClone(parts)
  db.workOrders = makeWorkOrders(now)
  db.loans = makeLoans(now)
  db.bemsPending = new Set()
  db.nextLoan = 100
}

resetDb()
