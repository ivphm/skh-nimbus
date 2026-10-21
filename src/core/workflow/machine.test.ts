import { describe, expect, it } from 'vitest'
import { staff } from '../domain/fixtures'
import { initialState, transition, unconfirmedCart, type WorkflowEvent, type WorkflowState } from './machine'

const alex = staff[0]
const run = (events: WorkflowEvent[], from: WorkflowState = initialState) => events.reduce(transition, from)

describe('workflow machine', () => {
  it('walks the happy path from idle to success', () => {
    const end = run([
      { type: 'WAKE' },
      { type: 'AUTH_OK', staff: alex, hasOpenLoans: true },
      { type: 'LOANS_REVIEWED' },
      { type: 'SELECT_WORK_ORDER', workOrderId: 'WO-2041' },
      { type: 'ADD_PART', partId: 'p-012' },
      { type: 'ADD_PART', partId: 'p-013', qty: 2 },
      { type: 'REVIEW' },
      { type: 'CONFIRMED', loanIds: ['L-9', 'L-10'] },
    ])
    expect(end).toMatchObject({ name: 'success', kind: 'loan', workOrderId: 'WO-2041', loanIds: ['L-9', 'L-10'] })
  })

  it('skips the loan review when the user has nothing open', () => {
    expect(run([{ type: 'WAKE' }, { type: 'AUTH_OK', staff: alex, hasOpenLoans: false }]).name).toBe('selectingWorkOrder')
  })

  it('falls back to the staff card when Face ID fails', () => {
    const s = run([{ type: 'WAKE' }, { type: 'AUTH_FAILED', error: 'face-not-recognised' }])
    expect(s).toEqual({ name: 'signingIn', method: 'card', error: 'face-not-recognised' })
  })

  it('works end to end with card-only login', () => {
    const s = run([{ type: 'USE_CARD' }, { type: 'AUTH_OK', staff: alex, hasOpenLoans: false }])
    expect(s.name).toBe('selectingWorkOrder')
  })

  it('does not review an empty list', () => {
    const drawing = run([{ type: 'WAKE' }, { type: 'AUTH_OK', staff: alex, hasOpenLoans: false }, { type: 'SELECT_WORK_ORDER', workOrderId: 'WO-2041' }])
    expect(transition(drawing, { type: 'REVIEW' })).toBe(drawing)
  })

  it('warns instead of signing out when the user steps away with an open list', () => {
    const drawing = run([
      { type: 'USE_CARD' },
      { type: 'AUTH_OK', staff: alex, hasOpenLoans: false },
      { type: 'SELECT_WORK_ORDER', workOrderId: 'WO-2041' },
      { type: 'ADD_PART', partId: 'p-012' },
    ])
    const warned = transition(drawing, { type: 'STEP_AWAY' })
    expect(warned).toMatchObject({ name: 'drawing', unconfirmedWarning: true })
    expect(unconfirmedCart(warned)).toEqual([{ partId: 'p-012', qty: 1 }])
    expect(transition(warned, { type: 'SIGN_OUT' })).toEqual(initialState)
  })

  it('returns to drawing when the last line is removed on review', () => {
    const confirming = run([
      { type: 'USE_CARD' },
      { type: 'AUTH_OK', staff: alex, hasOpenLoans: false },
      { type: 'SELECT_WORK_ORDER', workOrderId: 'WO-2041' },
      { type: 'ADD_PART', partId: 'p-012' },
      { type: 'REVIEW' },
    ])
    expect(transition(confirming, { type: 'SET_QTY', partId: 'p-012', qty: 0 }).name).toBe('drawing')
  })

  it('closes a job and returns where it started on back', () => {
    const reviewing = run([{ type: 'USE_CARD' }, { type: 'AUTH_OK', staff: alex, hasOpenLoans: true }])
    const closing = transition(reviewing, { type: 'CLOSE_JOB', workOrderId: 'WO-2038' })
    expect(closing.name).toBe('closingJob')
    expect(transition(closing, { type: 'BACK' }).name).toBe('reviewingLoans')
    expect(transition(closing, { type: 'JOB_CLOSED', loanIds: ['L-1'] })).toMatchObject({ name: 'success', kind: 'closed' })
  })

  it('ignores events that do not apply', () => {
    expect(transition(initialState, { type: 'REVIEW' })).toBe(initialState)
  })
})
