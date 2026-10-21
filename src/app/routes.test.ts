import { describe, expect, it } from 'vitest'
import { staff } from '@/core/domain/fixtures'
import type { WorkflowState } from '@/core/workflow/machine'
import { resolveScreen } from './definition'
import { EXPERIENCES } from './registry'
import { allows, pathFor, primaryScreen, SCREENS, type ScreenId } from './routes'

const alex = staff[0]
const drawing: WorkflowState = { name: 'drawing', staff: alex, workOrderId: 'WO-2041', cart: [], unconfirmedWarning: false }

describe('screen maps', () => {
  it.each(Object.values(EXPERIENCES))('$name covers every neutral screen', (def) => {
    for (const id of Object.keys(SCREENS) as ScreenId[]) expect(resolveScreen(def, id), id).not.toBeNull()
  })

  it.each(Object.values(EXPERIENCES))('$name maps exactly 12 Figma screens', (def) => {
    expect(Object.keys(def.screens)).toHaveLength(12)
  })
})

describe('route guards', () => {
  it('keeps drawing screens behind the drawing state', () => {
    expect(allows('cart', drawing)).toBe(true)
    expect(allows('cart', { name: 'idle' })).toBe(false)
    expect(allows('partsOut', { name: 'idle' })).toBe(true)
    expect(allows('stats', drawing)).toBe(true)
    expect(allows('stats', { name: 'idle' })).toBe(false)
  })

  it('returns to the list, not the briefing, when backing out of review', () => {
    const confirming: WorkflowState = { name: 'confirming', staff: alex, workOrderId: 'WO-2041', cart: [{ partId: 'p-012', qty: 1 }] }
    expect(primaryScreen(drawing, confirming)).toBe('cart')
    expect(primaryScreen(drawing, { name: 'selectingWorkOrder', staff: alex })).toBe('briefing')
  })

  it('fills route params', () => {
    expect(pathFor('locate', { partId: 'p-012' })).toBe('/draw/locate/p-012')
  })
})
