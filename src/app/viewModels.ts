import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { api } from '@/core/api/client'
import { isOverdue, partsOut, roomHealth } from '@/core/domain/ledger'
import type { Loan, LoanOutcome, Part, Staff } from '@/core/domain/types'
import { streakDays, useStaffProgress } from '@/core/gamification/progress'
import { levelFor } from '@/core/gamification/rules'
import { signedInStaff } from '@/core/workflow/machine'
import { useWorkflow, useWorkflowIn } from '@/core/workflow/store'
import * as actions from './actions'
import { useLedStrip, useNow, usePartsById, useResource } from './hooks'
import { pathFor, primaryScreen, type ScreenId } from './routes'

/**
 * Experience-neutral view models. Each screen in Quest and Nimbus renders one of these,
 * so the two experiences differ only in presentation.
 */

export function useStaffById(): Map<string, Staff> {
  const { data } = useResource(() => api.staffList(), 'staff')
  return useMemo(() => new Map((data ?? []).map((s) => [s.id, s])), [data])
}

export function useSignedInStaff(): Staff | null {
  return useWorkflow((s) => signedInStaff(s.state))
}

/**
 * I1/I2: runs Face ID, with the card as fallback. Once someone is recognised the station
 * greets them and waits for Continue, so a wrong match can be corrected with "Not you?".
 */
export function useSignIn() {
  const state = useWorkflowIn('signingIn')
  const method = state?.method
  const recognised = state?.recognised
  useEffect(() => {
    if (!method || recognised) return
    const ctrl = new AbortController()
    const run = method === 'face' ? actions.signInWithFace : actions.signInWithCard
    run(ctrl.signal).catch(() => undefined)
    return () => ctrl.abort()
  }, [method, state?.error, recognised])
  const send = useWorkflow((s) => s.send)
  const progress = useStaffProgress(recognised?.staff.id)
  return {
    method,
    error: state?.error,
    recognised,
    progress,
    level: levelFor(progress.xp),
    proceed: () => send({ type: 'CONTINUE' }),
    notMe: () => send({ type: 'NOT_ME' }),
    useCard: () => send({ type: 'USE_CARD' }),
    cancel: () => send({ type: 'SIGN_OUT' }),
  }
}

/**
 * Back for screens outside the main path (stats, team, locate, scan): returns to the screen
 * the user came from. With no in-app history (opened directly), goes to `to` while drawing,
 * or to the screen for the current workflow step. Route guards catch a stale previous screen.
 */
export function useBackToFlow(to?: ScreenId) {
  const navigate = useNavigate()
  const location = useLocation()
  const state = useWorkflow((s) => s.state)
  return () => {
    if (location.key !== 'default') navigate(-1)
    else navigate(pathFor(to && state.name === 'drawing' ? to : primaryScreen(state)), { replace: true })
  }
}

export function useWake() {
  const send = useWorkflow((s) => s.send)
  return { wake: () => send({ type: 'WAKE' }), tapCard: () => send({ type: 'USE_CARD' }) }
}

/** I2a: the user's own open loans, plus everyone's overdue ones. */
export function useLoanReview() {
  const staff = useSignedInStaff()
  const now = useNow()
  const parts = usePartsById()
  const people = useStaffById()
  const { data, reload } = useResource(() => api.loans(), 'loans')
  const send = useWorkflow((s) => s.send)
  const active = data ?? []
  const mine = active.filter((l) => l.drawnBy === staff?.id)
  const overdueOthers = active.filter((l) => l.drawnBy !== staff?.id && isOverdue(l, now))
  return {
    staff,
    mine,
    overdueOthers,
    parts,
    people,
    now,
    isOverdue: (l: Loan) => isOverdue(l, now),
    /** Keep leaves the loan open. Used and Returned close it. */
    reconcile: async (loan: Loan, choice: 'keep' | LoanOutcome) => {
      if (choice !== 'keep') await actions.closeLoan(loan, choice)
      reload()
    },
    closeJob: (workOrderId: string) => send({ type: 'CLOSE_JOB', workOrderId }),
    done: () => send({ type: 'LOANS_REVIEWED' }),
  }
}

/** I2b: open work orders. */
export function useWorkOrders() {
  const { data, loading } = useResource(() => api.workOrders(), 'work-orders')
  const { data: loans } = useResource(() => api.loans(), 'loans')
  const send = useWorkflow((s) => s.send)
  const workOrders = useMemo(() => [...(data ?? [])].sort((a, b) => b.urgency - a.urgency || a.raisedAt.localeCompare(b.raisedAt)), [data])
  return {
    workOrders,
    loading,
    openLoansOn: (id: string) => (loans ?? []).filter((l) => l.workOrderId === id),
    select: (workOrderId: string) => send({ type: 'SELECT_WORK_ORDER', workOrderId }),
    closeJob: (workOrderId: string) => send({ type: 'CLOSE_JOB', workOrderId }),
    back: () => send({ type: 'BACK' }),
  }
}

/** I3, I3b, I3d: the current list and ways to add to it. */
export function useDrawing() {
  const state = useWorkflowIn('drawing')
  const send = useWorkflow((s) => s.send)
  const parts = usePartsById()
  const workOrderId = state?.workOrderId ?? ''
  const { data: workOrder } = useResource(() => api.workOrder(workOrderId), `wo:${workOrderId}`)
  const [search, setSearch] = useState('')
  const [machine, setMachine] = useState<string | null>(null)
  const { data: results } = useResource(() => api.parts({ search: search || undefined, machine: machine ?? undefined }), `parts:${search}:${machine}`)
  const { data: machines } = useResource(() => api.machines(), 'machines')
  const cart = state?.cart ?? []
  const [confirmingChange, setConfirmingChange] = useState(false)
  const change = () => send({ type: 'CHANGE_WORK_ORDER' })
  return {
    staff: state?.staff ?? null,
    workOrder,
    cart,
    lines: cart.map((l) => ({ ...l, part: parts.get(l.partId) })).filter((l): l is typeof l & { part: Part } => !!l.part),
    count: cart.reduce((n, l) => n + l.qty, 0),
    suggestions: (workOrder?.suggestions ?? []).map((s) => ({ ...s, part: parts.get(s.partId) })).filter((s): s is typeof s & { part: Part } => !!s.part),
    search,
    setSearch,
    machine,
    setMachine,
    machines: machines ?? [],
    results: results ?? [],
    add: (partId: string, qty = 1) => actions.addPart(partId, qty),
    setQty: (partId: string, qty: number) => send({ type: 'SET_QTY', partId, qty }),
    qtyOf: (partId: string) => cart.find((l) => l.partId === partId)?.qty ?? 0,
    review: () => send({ type: 'REVIEW' }),
    /** Going back to the job list empties the list, so ask first when it has parts. */
    changeWorkOrder: () => (cart.length > 0 ? setConfirmingChange(true) : change()),
    confirmingChange,
    confirmChange: () => {
      setConfirmingChange(false)
      change()
    },
    cancelChange: () => setConfirmingChange(false),
    stepAway: actions.stepAway,
  }
}

/** I3c: lights the strip for one part and clears it on leave. */
export function useLocate(partId: string | undefined) {
  const parts = usePartsById()
  const part = partId ? parts.get(partId) : undefined
  const strip = useLedStrip()
  useEffect(() => {
    if (!part) return
    void actions.locate(part)
    return () => void actions.stopLight()
  }, [part])
  return {
    part,
    strip,
    lightAgain: () => part && actions.locate(part),
    stop: actions.stopLight,
    problem: !part ? null : !part.location ? ('location-unknown' as const) : strip.status === 'not-responding' ? ('strip-not-responding' as const) : null,
  }
}

/** I4: final review before the loan is recorded. */
export function useConfirm() {
  const state = useWorkflowIn('confirming')
  const send = useWorkflow((s) => s.send)
  const parts = usePartsById()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  return {
    staff: state?.staff ?? null,
    workOrderId: state?.workOrderId ?? '',
    lines: (state?.cart ?? []).map((l) => ({ ...l, part: parts.get(l.partId) })),
    setQty: (partId: string, qty: number) => send({ type: 'SET_QTY', partId, qty }),
    back: () => send({ type: 'BACK' }),
    busy,
    error,
    confirm: async () => {
      setBusy(true)
      setError(null)
      try {
        await actions.confirmLoan()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not record the loan')
      } finally {
        setBusy(false)
      }
    },
  }
}

export const SUCCESS_SIGN_OUT_SECONDS = 5

/** I5: summary, then automatic sign-out. */
export function useSuccess() {
  const state = useWorkflowIn('success')
  const [left, setLeft] = useState(SUCCESS_SIGN_OUT_SECONDS)
  const progress = useStaffProgress(state?.staff.id)
  useEffect(() => {
    if (!state) return
    const t = setInterval(() => setLeft((n) => n - 1), 1000)
    return () => clearInterval(t)
  }, [state])
  useEffect(() => {
    if (left <= 0) void actions.signOut()
  }, [left])
  return { state, secondsLeft: Math.max(0, left), progress, level: levelFor(progress.xp), signOut: actions.signOut }
}

/** I6: every open loan on a work order, including other people's. */
export function useCloseJob() {
  const state = useWorkflowIn('closingJob')
  const send = useWorkflow((s) => s.send)
  const workOrderId = state?.workOrderId ?? ''
  const parts = usePartsById()
  const people = useStaffById()
  const now = useNow()
  const { data: workOrder } = useResource(() => api.workOrder(workOrderId), `wo:${workOrderId}`)
  const { data: loans } = useResource(() => api.loans({ workOrderId }), `loans:${workOrderId}`)
  const [decisions, setDecisions] = useState<Record<string, LoanOutcome>>({})
  const [pending, setPending] = useState<{ loan: Loan; outcome: LoanOutcome } | null>(null)
  const [busy, setBusy] = useState(false)
  const me = state?.staff
  const apply = (loan: Loan, outcome: LoanOutcome) => setDecisions((d) => ({ ...d, [loan.id]: outcome }))
  const list = loans ?? []
  return {
    staff: me ?? null,
    workOrder,
    loans: list,
    parts,
    people,
    isOverdue: (l: Loan) => isOverdue(l, now),
    decisions,
    decidedCount: Object.keys(decisions).length,
    /** Closing someone else's loan asks for a short confirmation first. */
    decide: (loan: Loan, outcome: LoanOutcome) => (loan.drawnBy !== me?.id && !decisions[loan.id] ? setPending({ loan, outcome }) : apply(loan, outcome)),
    pending,
    confirmPending: () => {
      if (pending) apply(pending.loan, pending.outcome)
      setPending(null)
    },
    cancelPending: () => setPending(null),
    busy,
    finish: async () => {
      setBusy(true)
      const closed: string[] = []
      for (const loan of list) {
        const outcome = decisions[loan.id]
        if (outcome && (await actions.closeLoan(loan, outcome))) closed.push(loan.id)
      }
      setBusy(false)
      actions.finishClosingJob(closed)
    },
    back: () => send({ type: 'BACK' }),
  }
}

/** O1/O2: the view-only outside board. Polls the ledger. */
export function usePartsOutBoard(pollMs = 15_000) {
  const now = useNow(pollMs)
  const parts = usePartsById()
  const people = useStaffById()
  const { data } = useResource(() => api.loans(), `board:${now.getTime()}`)
  const loans = partsOut(data ?? [])
  return { loans, parts, people, now, health: roomHealth(loans, now), isOverdue: (l: Loan) => isOverdue(l, now) }
}

/** I9: private stats for the signed-in user only. */
export function useMyStats() {
  const staff = useSignedInStaff()
  const progress = useStaffProgress(staff?.id)
  const today = useNow().toISOString().slice(0, 10)
  const { data: catalogue } = useResource(() => api.parts(), 'parts')
  return {
    staff,
    progress,
    level: levelFor(progress.xp),
    streak: streakDays(progress.activeDays, today),
    catalogue: [...(catalogue ?? [])].sort((a, b) => a.number - b.number),
    signOut: actions.signOut,
  }
}

/** Shared team weather: everyone's closed loans this week. */
export function useTeamWeek() {
  const now = useNow()
  const { data } = useResource(() => api.loans({ status: 'all' }), 'loans:all')
  const people = useStaffById()
  const loans = data ?? []
  const active = loans.filter((l) => l.status === 'active')
  const closed = loans.filter((l) => l.status !== 'active')
  return {
    closedOnTime: closed.length,
    overdue: active.filter((l) => isOverdue(l, now)).length,
    health: roomHealth(active, now),
    helpers: [...new Set(closed.map((l) => l.closedBy).filter(Boolean))].map((id) => people.get(id!)).filter(Boolean) as Staff[],
    people: [...people.values()],
  }
}

export function useRoomHealth() {
  const now = useNow()
  const { data } = useResource(() => api.loans(), 'loans')
  return roomHealth(data ?? [], now)
}

export { actions }
