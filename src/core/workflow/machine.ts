import { addToCart, setCartQty } from '../domain/ledger'
import type { CartLine, Staff } from '../domain/types'

/**
 * The check-out station workflow as a pure state machine.
 *
 * idle → signingIn (recognised → Continue) → reviewingLoans → selectingWorkOrder → drawing → confirming → success → idle
 *                                    ↘ closingJob ↗
 *
 * The machine knows nothing about screens or experiences. The app maps states to
 * experience-neutral routes, and each experience supplies the screens.
 */

export type AuthMethod = 'face' | 'card'
export type AuthError = 'face-not-recognised' | 'card-not-read' | 'sign-in-unavailable'

export type WorkflowState =
  | { name: 'idle' }
  | {
      name: 'signingIn'
      method: AuthMethod
      error?: AuthError
      /** Set once Face ID or the card matches. The user confirms it is them before going on. */
      recognised?: { staff: Staff; hasOpenLoans: boolean }
    }
  | { name: 'reviewingLoans'; staff: Staff }
  | { name: 'selectingWorkOrder'; staff: Staff }
  | { name: 'drawing'; staff: Staff; workOrderId: string; cart: CartLine[]; unconfirmedWarning: boolean }
  | { name: 'confirming'; staff: Staff; workOrderId: string; cart: CartLine[] }
  | { name: 'closingJob'; staff: Staff; workOrderId: string; returnTo: 'reviewingLoans' | 'selectingWorkOrder' }
  | { name: 'success'; staff: Staff; workOrderId: string; kind: 'loan' | 'closed'; loanIds: string[] }

export type WorkflowEvent =
  | { type: 'WAKE' }
  | { type: 'USE_CARD' }
  | { type: 'AUTH_OK'; staff: Staff; hasOpenLoans: boolean }
  | { type: 'AUTH_FAILED'; error: AuthError }
  | { type: 'CONTINUE' }
  | { type: 'NOT_ME' }
  | { type: 'RETRY' }
  | { type: 'LOANS_REVIEWED' }
  | { type: 'SELECT_WORK_ORDER'; workOrderId: string }
  | { type: 'CHANGE_WORK_ORDER' }
  | { type: 'ADD_PART'; partId: string; qty?: number }
  | { type: 'SET_QTY'; partId: string; qty: number }
  | { type: 'REVIEW' }
  | { type: 'BACK' }
  | { type: 'CONFIRMED'; loanIds: string[] }
  | { type: 'CLOSE_JOB'; workOrderId: string }
  | { type: 'JOB_CLOSED'; loanIds: string[] }
  | { type: 'STEP_AWAY' }
  | { type: 'DISMISS_WARNING' }
  | { type: 'SIGN_OUT' }

export type StateName = WorkflowState['name']

export const initialState: WorkflowState = { name: 'idle' }

export function transition(state: WorkflowState, event: WorkflowEvent): WorkflowState {
  // Signing out is always allowed. Unconfirmed items are handled by the caller.
  if (event.type === 'SIGN_OUT') return initialState

  switch (state.name) {
    case 'idle':
      if (event.type === 'WAKE') return { name: 'signingIn', method: 'face' }
      if (event.type === 'USE_CARD') return { name: 'signingIn', method: 'card' }
      return state

    case 'signingIn':
      if (event.type === 'AUTH_OK')
        return { name: 'signingIn', method: state.method, recognised: { staff: event.staff, hasOpenLoans: event.hasOpenLoans } }
      if (event.type === 'CONTINUE' && state.recognised)
        return state.recognised.hasOpenLoans
          ? { name: 'reviewingLoans', staff: state.recognised.staff }
          : { name: 'selectingWorkOrder', staff: state.recognised.staff }
      // Wrong person recognised: scan the staff card instead.
      if (event.type === 'NOT_ME') return { name: 'signingIn', method: 'card' }
      if (event.type === 'RETRY' && !state.recognised) return { name: 'signingIn', method: state.method }
      // Face ID failure falls back to the staff card.
      if (event.type === 'AUTH_FAILED' && !state.recognised)
        return { name: 'signingIn', method: event.error === 'face-not-recognised' ? 'card' : state.method, error: event.error }
      if (event.type === 'USE_CARD') return { name: 'signingIn', method: 'card' }
      if (event.type === 'BACK') return initialState
      return state

    case 'reviewingLoans':
      if (event.type === 'LOANS_REVIEWED') return { name: 'selectingWorkOrder', staff: state.staff }
      if (event.type === 'SELECT_WORK_ORDER') return startDrawing(state.staff, event.workOrderId)
      if (event.type === 'CLOSE_JOB')
        return { name: 'closingJob', staff: state.staff, workOrderId: event.workOrderId, returnTo: 'reviewingLoans' }
      return state

    case 'selectingWorkOrder':
      if (event.type === 'SELECT_WORK_ORDER') return startDrawing(state.staff, event.workOrderId)
      if (event.type === 'BACK') return { name: 'reviewingLoans', staff: state.staff }
      if (event.type === 'CLOSE_JOB')
        return { name: 'closingJob', staff: state.staff, workOrderId: event.workOrderId, returnTo: 'selectingWorkOrder' }
      return state

    case 'drawing':
      switch (event.type) {
        case 'ADD_PART':
          return { ...state, cart: addToCart(state.cart, event.partId, event.qty ?? 1), unconfirmedWarning: false }
        case 'SET_QTY':
          return { ...state, cart: setCartQty(state.cart, event.partId, event.qty) }
        case 'REVIEW':
          return state.cart.length > 0
            ? { name: 'confirming', staff: state.staff, workOrderId: state.workOrderId, cart: state.cart }
            : state
        case 'CHANGE_WORK_ORDER':
          // The screen confirms first when this empties a non-empty list.
          return { name: 'selectingWorkOrder', staff: state.staff }
        case 'STEP_AWAY':
          return state.cart.length > 0 ? { ...state, unconfirmedWarning: true } : initialState
        case 'DISMISS_WARNING':
          return { ...state, unconfirmedWarning: false }
        default:
          return state
      }

    case 'confirming':
      if (event.type === 'BACK')
        return { name: 'drawing', staff: state.staff, workOrderId: state.workOrderId, cart: state.cart, unconfirmedWarning: false }
      if (event.type === 'SET_QTY') {
        const cart = setCartQty(state.cart, event.partId, event.qty)
        return cart.length > 0
          ? { ...state, cart }
          : { name: 'drawing', staff: state.staff, workOrderId: state.workOrderId, cart, unconfirmedWarning: false }
      }
      if (event.type === 'CONFIRMED')
        return { name: 'success', staff: state.staff, workOrderId: state.workOrderId, kind: 'loan', loanIds: event.loanIds }
      return state

    case 'closingJob':
      if (event.type === 'JOB_CLOSED')
        return { name: 'success', staff: state.staff, workOrderId: state.workOrderId, kind: 'closed', loanIds: event.loanIds }
      if (event.type === 'BACK') return { name: state.returnTo, staff: state.staff }
      return state

    case 'success':
      return state
  }
}

function startDrawing(staff: Staff, workOrderId: string): WorkflowState {
  return { name: 'drawing', staff, workOrderId, cart: [], unconfirmedWarning: false }
}

/** Items still in the list when the session ends. They stay flagged as unconfirmed. */
export function unconfirmedCart(state: WorkflowState): CartLine[] {
  return state.name === 'drawing' || state.name === 'confirming' ? state.cart : []
}

export function signedInStaff(state: WorkflowState): Staff | null {
  return 'staff' in state ? state.staff : null
}
