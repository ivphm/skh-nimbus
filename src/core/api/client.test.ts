import { describe, expect, it } from 'vitest'
import { api, ApiError } from './client'

describe('api client against the mock API', () => {
  it('lists open work orders with suggestions', async () => {
    const list = await api.workOrders()
    expect(list.map((w) => w.id)).toContain('WO-2041')
    const detail = await api.workOrder('WO-2041')
    expect(detail.suggestions[0]).toEqual({ partId: 'p-012', usedIn: 8 })
  })

  it('draws parts, updates the ledger and closes the loans', async () => {
    const [loan] = await api.createLoans({ workOrderId: 'WO-2041', staffId: 's-alex', lines: [{ partId: 'p-012', qty: 2 }] })
    expect((await api.parts({ search: 'pressure' }))[0].stock).toBe(10)
    await api.closeLoan(loan.id, { outcome: 'returned', staffId: 's-priya' })
    expect((await api.parts({ search: 'pressure' }))[0].stock).toBe(12)
    expect(await api.loans({ workOrderId: 'WO-2041' })).toEqual([])
  })

  it('rejects draws over live stock', async () => {
    const err = await api.createLoans({ workOrderId: 'WO-2041', staffId: 's-alex', lines: [{ partId: 'p-004', qty: 9 }] }).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 409, code: 'out-of-stock' })
  })

  it('finds parts by barcode and reports unknown ones', async () => {
    expect((await api.partByBarcode('880013')).name).toBe('Occlusion sensor')
    await expect(api.partByBarcode('000000')).rejects.toMatchObject({ code: 'part-not-found' })
  })
})
