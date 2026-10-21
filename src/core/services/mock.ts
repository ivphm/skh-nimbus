import type {
  AuthResult,
  BarcodeScannerService,
  CardReaderService,
  FaceIdService,
  FeedbackService,
  LedStripService,
  LedStripState,
  StationServices,
} from './types'

/**
 * Failure switches for demos and tests, for example `?fail=face,led`.
 * face: Face ID never matches. card: the card is not read. led: the strip does not respond.
 */
export type MockFailure = 'face' | 'card' | 'led'

export interface MockOptions {
  /** Staff id the mock camera and card reader recognise. */
  staffId?: string
  delayMs?: number
  fail?: MockFailure[]
  /** LED auto-off timeout, matching the controller requirement. */
  ledTimeoutMs?: number
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(signal.reason)
    })
  })

export function createMockFaceId(o: MockOptions): FaceIdService {
  return {
    async scan(signal) {
      await wait(o.delayMs ?? 1200, signal)
      return o.fail?.includes('face') ? { ok: false, error: 'face-not-recognised' } : { ok: true, staffId: o.staffId ?? 's-alex' }
    },
  }
}

export function createMockCardReader(o: MockOptions): CardReaderService {
  return {
    async waitForTap(signal): Promise<AuthResult> {
      await wait(o.delayMs ?? 800, signal)
      return o.fail?.includes('card') ? { ok: false, error: 'card-not-read' } : { ok: true, staffId: o.staffId ?? 's-alex' }
    },
  }
}

/**
 * Scanners act as keyboards: digits typed quickly and ended with Enter.
 * The mock listens for that pattern and also exposes `simulate` for tests and demo buttons.
 */
export function createMockScanner(target: Pick<Window, 'addEventListener' | 'removeEventListener'> | null = typeof window === 'undefined' ? null : window) {
  const handlers = new Set<(barcode: string) => void>()
  let buffer = ''
  let last = 0
  const onKey = (e: Event) => {
    const { key } = e as KeyboardEvent
    const now = Date.now()
    if (now - last > 80) buffer = ''
    last = now
    if (key === 'Enter' && buffer.length >= 6) {
      const code = buffer
      buffer = ''
      handlers.forEach((h) => h(code))
    } else if (/^\d$/.test(key)) buffer += key
  }
  const service: BarcodeScannerService & { simulate(barcode: string): void } = {
    onScan(handler) {
      if (handlers.size === 0) target?.addEventListener('keydown', onKey)
      handlers.add(handler)
      return () => {
        handlers.delete(handler)
        if (handlers.size === 0) target?.removeEventListener('keydown', onKey)
      }
    },
    simulate(barcode) {
      handlers.forEach((h) => h(barcode))
    },
  }
  return service
}

export function createMockLedStrip(o: MockOptions): LedStripService {
  let state: LedStripState = { status: 'off', segment: null }
  let timer: ReturnType<typeof setTimeout> | undefined
  const subs = new Set<(s: LedStripState) => void>()
  const setState = (next: LedStripState) => {
    state = next
    subs.forEach((h) => h(state))
    return state
  }
  return {
    async light(segment) {
      clearTimeout(timer)
      if (o.fail?.includes('led')) return setState({ status: 'not-responding', segment: null })
      timer = setTimeout(() => setState({ status: 'off', segment: null }), o.ledTimeoutMs ?? 60_000)
      return setState({ status: 'lit', segment })
    },
    async clear() {
      clearTimeout(timer)
      if (o.fail?.includes('led')) return setState({ status: 'not-responding', segment: null })
      return setState({ status: 'off', segment: null })
    },
    getState: () => state,
    subscribe(handler) {
      subs.add(handler)
      return () => subs.delete(handler)
    },
  }
}

export function createBrowserFeedback(): FeedbackService {
  let audio: AudioContext | null = null
  const beep = (freq: number, ms: number) => {
    try {
      audio ??= new AudioContext()
      const osc = audio.createOscillator()
      const gain = audio.createGain()
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.08, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000)
      osc.connect(gain).connect(audio.destination)
      osc.start()
      osc.stop(audio.currentTime + ms / 1000)
    } catch {
      // No audio device. Visual feedback still shows.
    }
  }
  return {
    confirm() {
      beep(880, 120)
      navigator.vibrate?.(60)
    },
    warn() {
      beep(330, 300)
      navigator.vibrate?.([120, 80, 120])
    },
  }
}

export function createMockServices(o: MockOptions = {}): StationServices & { scanner: ReturnType<typeof createMockScanner> } {
  return {
    faceId: createMockFaceId(o),
    cardReader: createMockCardReader(o),
    scanner: createMockScanner(),
    ledStrip: createMockLedStrip(o),
    feedback: createBrowserFeedback(),
  }
}

export function parseMockFailures(search: string): MockFailure[] {
  const raw = new URLSearchParams(search).get('fail') ?? ''
  return raw.split(',').filter((f): f is MockFailure => f === 'face' || f === 'card' || f === 'led')
}
