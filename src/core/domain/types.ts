/** Domain model for the SKH Nimbus check-out station. Experience-neutral. */

export type Role = 'staff' | 'lead'

export interface Staff {
  id: string
  name: string
  shortName: string
  initials: string
  role: Role
  cardId: string
}

export type PartCategory = 'Sensor' | 'Power' | 'Cable' | 'Electrical' | 'Mechanical'

/** A shelf slot, optionally a bin, mapped to a segment of the LED strip. */
export interface Location {
  shelf: string
  slot: string
  bin?: number
  ledSegment: number
}

export interface Part {
  id: string
  /** Catalogue number shown as #012 in the Partdex. */
  number: number
  name: string
  barcode: string
  category: PartCategory
  /** Machines this part fits, used for Browse by machine. */
  machines: string[]
  location: Location | null
  /** Live count from the Local Stock Ledger. */
  stock: number
  /** Reorder threshold set by a lead. */
  threshold: number
}

export type Urgency = 1 | 2 | 3

export interface WorkOrder {
  id: string
  equipment: string
  area: string
  description: string
  requester: string
  raisedAt: string
  urgency: Urgency
  status: 'open' | 'closed'
}

export interface PartSuggestion {
  partId: string
  /** How many of the last 10 similar jobs used this part. */
  usedIn: number
}

export type LoanStatus = 'active' | 'used' | 'returned'
export type LoanOutcome = 'used' | 'returned'

export interface Loan {
  id: string
  partId: string
  qty: number
  workOrderId: string
  drawnBy: string
  drawnAt: string
  status: LoanStatus
  /** False when the user walked away without confirming the list. */
  confirmed: boolean
  closedBy?: string
  closedAt?: string
}

export interface CartLine {
  partId: string
  qty: number
}

export interface ReorderFlag {
  partId: string
  stock: number
  threshold: number
  bemsSyncPending: boolean
}
