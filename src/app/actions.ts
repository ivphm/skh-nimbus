import { api, ApiError } from '@/core/api/client'
import { isOverdue } from '@/core/domain/ledger'
import type { Loan, LoanOutcome, Part } from '@/core/domain/types'
import { gameBus } from '@/core/gamification/bus'
import { useProgress } from '@/core/gamification/progress'
import { services } from '@/core/services'
import type { AuthResult } from '@/core/services'
import { signedInStaff, unconfirmedCart } from '@/core/workflow/machine'
import { useWorkflow } from '@/core/workflow/store'

/**
 * Side effects of the workflow: hardware, API and game events.
 * Screens call these instead of talking to services directly, so both experiences behave the same.
 */

const send = (...args: Parameters<ReturnType<typeof useWorkflow.getState>['send']>) => useWorkflow.getState().send(...args)
const current = () => useWorkflow.getState().state

// Every game event updates the signed-in user's private progress.
gameBus.onAny((event) => useProgress.getState().apply(event))

let cleanStreak = 0

async function finishAuth(result: AuthResult) {
  if (!result.ok) {
    send({ type: 'AUTH_FAILED', error: result.error })
    return
  }
  const [staff, active] = await Promise.all([api.staff(result.staffId), api.loans()])
  const now = new Date()
  const hasOpenLoans = active.some((l) => l.drawnBy === staff.id || isOverdue(l, now))
  cleanStreak = 0
  send({ type: 'AUTH_OK', staff, hasOpenLoans })
}

export async function signInWithFace(signal?: AbortSignal) {
  await finishAuth(await services.faceId.scan(signal))
}

export async function signInWithCard(signal?: AbortSignal) {
  await finishAuth(await services.cardReader.waitForTap(signal))
}

export function addPart(partId: string, qty = 1) {
  send({ type: 'ADD_PART', partId, qty })
}

export type ScanOutcome = { ok: true; part: Part } | { ok: false; error: 'part-not-found' | 'out-of-stock' }

/** Handles one barcode read during drawing: adds the part, confirms with tick/sound/vibration, clears the light. */
export async function scanBarcode(barcode: string): Promise<ScanOutcome> {
  const state = current()
  const staff = signedInStaff(state)
  if (state.name !== 'drawing' || !staff) return { ok: false, error: 'part-not-found' }
  try {
    const part = await api.partByBarcode(barcode)
    const inCart = state.cart.find((l) => l.partId === part.id)?.qty ?? 0
    if (part.stock <= inCart) {
      cleanStreak = 0
      return { ok: false, error: 'out-of-stock' }
    }
    addPart(part.id)
    cleanStreak++
    services.feedback.confirm()
    void services.ledStrip.clear()
    gameBus.emit({ type: 'part.scanned', staffId: staff.id, partId: part.id, cleanStreak })
    return { ok: true, part }
  } catch (e) {
    cleanStreak = 0
    if (e instanceof ApiError && e.code === 'part-not-found') return { ok: false, error: 'part-not-found' }
    throw e
  }
}

export function locate(part: Part) {
  if (!part.location) return Promise.resolve(services.ledStrip.getState())
  return services.ledStrip.light(part.location.ledSegment)
}

export function stopLight() {
  return services.ledStrip.clear()
}

export async function confirmLoan() {
  const state = current()
  if (state.name !== 'confirming') return
  const loans = await api.createLoans({ workOrderId: state.workOrderId, staffId: state.staff.id, lines: state.cart })
  services.feedback.confirm()
  void services.ledStrip.clear()
  send({ type: 'CONFIRMED', loanIds: loans.map((l) => l.id) })
  gameBus.emit({ type: 'loan.confirmed', staffId: state.staff.id, workOrderId: state.workOrderId, partCount: loans.length })
}

/** Closes one loan as Used or Returned. Anyone can close anyone's loan. */
export async function closeLoan(loan: Loan, outcome: LoanOutcome) {
  const staff = signedInStaff(current())
  if (!staff) return
  const wasOverdue = isOverdue(loan, new Date())
  const closed = await api.closeLoan(loan.id, { outcome, staffId: staff.id })
  if (outcome === 'returned') void locate((await api.parts()).find((p) => p.id === loan.partId)!)
  gameBus.emit({ type: 'loan.closed', staffId: staff.id, loanId: loan.id, partId: loan.partId, outcome, forTeammate: loan.drawnBy !== staff.id, wasOverdue })
  return closed
}

export function finishClosingJob(loanIds: string[]) {
  send({ type: 'JOB_CLOSED', loanIds })
}

export function stepAway() {
  const next = send({ type: 'STEP_AWAY' })
  if (next.name === 'drawing' && next.unconfirmedWarning) services.feedback.warn()
}

/** Ends the session. Anything still in the list is recorded as unconfirmed on the ledger. */
export async function signOut() {
  const state = current()
  const staff = signedInStaff(state)
  const left = unconfirmedCart(state)
  if (staff && left.length > 0 && 'workOrderId' in state) {
    await api.createLoans({ workOrderId: state.workOrderId, staffId: staff.id, lines: left, confirmed: false }).catch(() => undefined)
  }
  if (staff) gameBus.emit({ type: 'session.ended', staffId: staff.id, unconfirmed: left.length > 0 })
  void services.ledStrip.clear()
  cleanStreak = 0
  send({ type: 'SIGN_OUT' })
}
