import { loanAgeHours } from '@/core/domain/ledger'
import type { Loan } from '@/core/domain/types'

export const partNo = (n: number) => `#${String(n).padStart(3, '0')}`

export function loanAge(loan: Loan, now: Date): string {
  const h = Math.floor(loanAgeHours(loan, now))
  if (h < 1) return 'just now'
  if (h < 24) return `${h} h`
  const d = Math.floor(h / 24)
  return `${d} ${d === 1 ? 'day' : 'days'}`
}

export const timeOfDay = (iso: string) => new Date(iso).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false })
