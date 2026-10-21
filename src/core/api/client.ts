import type { CartLine, Loan, LoanOutcome, Part, PartSuggestion, ReorderFlag, Staff, WorkOrder } from '../domain/types'

/** Typed client for the station API. Served by MSW until the real backend exists. */

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string }
    throw new ApiError(res.status, body.code ?? 'error', body.message ?? res.statusText)
  }
  return (await res.json()) as T
}

const qs = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1])).toString()
  return s ? `?${s}` : ''
}

export interface WorkOrderDetail extends WorkOrder {
  suggestions: PartSuggestion[]
}

export const api = {
  staff: (id: string) => request<Staff>(`/staff/${id}`),
  staffList: () => request<Staff[]>('/staff'),
  parts: (q?: { search?: string; machine?: string }) => request<Part[]>(`/parts${qs({ q: q?.search, machine: q?.machine })}`),
  partByBarcode: (barcode: string) => request<Part>(`/parts/barcode/${barcode}`),
  machines: () => request<string[]>('/machines'),
  workOrders: () => request<WorkOrder[]>('/work-orders?status=open'),
  workOrder: (id: string) => request<WorkOrderDetail>(`/work-orders/${id}`),
  loans: (q?: { workOrderId?: string; staffId?: string; status?: string }) =>
    request<Loan[]>(`/loans${qs({ workOrderId: q?.workOrderId, staffId: q?.staffId, status: q?.status ?? 'active' })}`),
  createLoans: (body: { workOrderId: string; staffId: string; lines: CartLine[]; confirmed?: boolean }) =>
    request<Loan[]>('/loans', { method: 'POST', body: JSON.stringify(body) }),
  closeLoan: (id: string, body: { outcome: LoanOutcome; staffId: string }) =>
    request<Loan>(`/loans/${id}/close`, { method: 'POST', body: JSON.stringify(body) }),
  reorderFlags: () => request<ReorderFlag[]>('/reorder-flags'),
  setThreshold: (partId: string, threshold: number) =>
    request<Part>(`/parts/${partId}/threshold`, { method: 'PUT', body: JSON.stringify({ threshold }) }),
}
