import { api } from '@/core/api/client'
import type { Part } from '@/core/domain/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { services } from '@/core/services'
import type { LedStripState } from '@/core/services'

export interface Resource<T> {
  data: T | undefined
  error: unknown
  loading: boolean
  reload: () => void
}

/**
 * Minimal data loader keyed by a string. Keeps the last data while reloading.
 * Swap for a query library if caching needs grow.
 */
export function useResource<T>(load: () => Promise<T>, key: string): Resource<T> {
  const [tick, setTick] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: T; error?: unknown }>({ key: '' })
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })
  const fullKey = `${key}#${tick}`
  useEffect(() => {
    let live = true
    loadRef.current().then(
      (data) => live && setResult({ key: fullKey, data }),
      (error: unknown) => live && setResult((r) => ({ key: fullKey, data: r.data, error })),
    )
    return () => {
      live = false
    }
  }, [fullKey])
  return { data: result.data, error: result.error, loading: result.key !== fullKey, reload: () => setTick((t) => t + 1) }
}

/** All parts keyed by id, for showing names next to loans and cart lines. */
export function usePartsById(): Map<string, Part> {
  const { data } = useResource(() => api.parts(), 'parts')
  return useMemo(() => new Map((data ?? []).map((p) => [p.id, p])), [data])
}

export function useLedStrip(): LedStripState {
  const [state, setState] = useState(services.ledStrip.getState())
  useEffect(() => services.ledStrip.subscribe(setState), [])
  return state
}

/** Subscribes to barcode reads while mounted. */
export function useBarcode(handler: (barcode: string) => void) {
  useEffect(() => services.scanner.onScan(handler), [handler])
}

export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}
