import { checkDraw, reorderFlags } from '@/core/domain/ledger'
import type { CartLine, LoanOutcome } from '@/core/domain/types'
import { delay, http, HttpResponse } from 'msw'
import { db } from './db'

const fail = (status: number, code: string, message: string) => HttpResponse.json({ code, message }, { status })
const latency = () => delay(import.meta.env.MODE === 'test' ? 0 : 150)

export const handlers = [
  http.get('/api/staff', () => HttpResponse.json(db.staff)),

  http.get('/api/staff/:id', ({ params }) => {
    const s = db.staff.find((x) => x.id === params.id)
    return s ? HttpResponse.json(s) : fail(404, 'staff-not-found', 'Staff not found')
  }),

  http.get('/api/machines', () => HttpResponse.json([...new Set(db.parts.flatMap((p) => p.machines))].sort())),

  http.get('/api/parts', async ({ request }) => {
    await latency()
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase()
    const machine = url.searchParams.get('machine')
    let list = db.parts
    if (machine) list = list.filter((p) => p.machines.includes(machine))
    if (q)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.number).padStart(3, '0').includes(q) ||
          p.machines.some((m) => m.toLowerCase().includes(q)),
      )
    return HttpResponse.json(list)
  }),

  http.get('/api/parts/barcode/:code', ({ params }) => {
    const p = db.parts.find((x) => x.barcode === params.code)
    return p ? HttpResponse.json(p) : fail(404, 'part-not-found', 'Part not found')
  }),

  http.put('/api/parts/:id/threshold', async ({ params, request }) => {
    const p = db.parts.find((x) => x.id === params.id)
    if (!p) return fail(404, 'part-not-found', 'Part not found')
    p.threshold = ((await request.json()) as { threshold: number }).threshold
    return HttpResponse.json(p)
  }),

  http.get('/api/work-orders', async () => {
    await latency()
    return HttpResponse.json(db.workOrders.filter((w) => w.status === 'open'))
  }),

  http.get('/api/work-orders/:id', ({ params }) => {
    const wo = db.workOrders.find((w) => w.id === params.id)
    if (!wo) return fail(404, 'work-order-not-found', 'Work order not found')
    return HttpResponse.json({ ...wo, suggestions: db.suggestions[wo.equipment] ?? [] })
  }),

  http.get('/api/loans', async ({ request }) => {
    await latency()
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const workOrderId = url.searchParams.get('workOrderId')
    const staffId = url.searchParams.get('staffId')
    return HttpResponse.json(
      db.loans.filter(
        (l) =>
          (!status || status === 'all' || l.status === status) &&
          (!workOrderId || l.workOrderId === workOrderId) &&
          (!staffId || l.drawnBy === staffId),
      ),
    )
  }),

  http.post('/api/loans', async ({ request }) => {
    await latency()
    const body = (await request.json()) as { workOrderId: string; staffId: string; lines: CartLine[]; confirmed?: boolean }
    if (!db.workOrders.some((w) => w.id === body.workOrderId && w.status === 'open'))
      return fail(404, 'work-order-not-found', 'Work order not found')
    const problem = checkDraw(db.parts, body.lines)
    if (problem) return fail(409, problem.reason, `Cannot draw ${problem.partId}`)
    const now = new Date().toISOString()
    const created = body.lines.map((line) => {
      db.parts.find((p) => p.id === line.partId)!.stock -= line.qty
      return {
        id: `L-${db.nextLoan++}`,
        partId: line.partId,
        qty: line.qty,
        workOrderId: body.workOrderId,
        drawnBy: body.staffId,
        drawnAt: now,
        status: 'active' as const,
        confirmed: body.confirmed ?? true,
      }
    })
    db.loans.push(...created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.post('/api/loans/:id/close', async ({ params, request }) => {
    const loan = db.loans.find((l) => l.id === params.id)
    if (!loan) return fail(404, 'loan-not-found', 'Loan not found')
    if (loan.status !== 'active') return fail(409, 'loan-closed', 'Loan already closed')
    const body = (await request.json()) as { outcome: LoanOutcome; staffId: string }
    loan.status = body.outcome
    loan.closedBy = body.staffId
    loan.closedAt = new Date().toISOString()
    if (body.outcome === 'returned') db.parts.find((p) => p.id === loan.partId)!.stock += loan.qty
    // When every loan on the work order is closed, the job closes and BEMS gets the record.
    const open = db.loans.some((l) => l.workOrderId === loan.workOrderId && l.status === 'active')
    if (!open) {
      const wo = db.workOrders.find((w) => w.id === loan.workOrderId)
      if (wo) wo.status = 'closed'
      db.bemsPending.add(loan.workOrderId)
    }
    return HttpResponse.json(loan)
  }),

  http.get('/api/reorder-flags', () => HttpResponse.json(reorderFlags(db.parts))),
]
