import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockFaceId, createMockLedStrip, createMockScanner, parseMockFailures } from './mock'

afterEach(() => vi.useRealTimers())

describe('mock services', () => {
  it('recognises a face unless told to fail', async () => {
    await expect(createMockFaceId({ delayMs: 0 }).scan()).resolves.toEqual({ ok: true, staffId: 's-alex' })
    await expect(createMockFaceId({ delayMs: 0, fail: ['face'] }).scan()).resolves.toEqual({ ok: false, error: 'face-not-recognised' })
  })

  it('reads keyboard-wedge barcodes', () => {
    const target = new EventTarget()
    const scanner = createMockScanner(target as unknown as Window)
    const seen: string[] = []
    const off = scanner.onScan((b) => seen.push(b))
    for (const key of '880012') target.dispatchEvent(new KeyboardEvent('keydown', { key }))
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    scanner.simulate('880013')
    off()
    scanner.simulate('880007')
    expect(seen).toEqual(['880012', '880013'])
  })

  it('lights, times out and reports a dead strip', async () => {
    vi.useFakeTimers()
    const strip = createMockLedStrip({ ledTimeoutMs: 1000 })
    expect(await strip.light(7)).toEqual({ status: 'lit', segment: 7 })
    vi.advanceTimersByTime(1000)
    expect(strip.getState().status).toBe('off')
    const dead = createMockLedStrip({ fail: ['led'] })
    expect((await dead.light(3)).status).toBe('not-responding')
  })

  it('parses failure switches from the URL', () => {
    expect(parseMockFailures('?fail=face,led,bogus')).toEqual(['face', 'led'])
    expect(parseMockFailures('')).toEqual([])
  })
})
