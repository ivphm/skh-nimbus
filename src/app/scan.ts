import { create } from 'zustand'
import type { ScanOutcome } from './actions'

/** Result of the most recent barcode read, for scan and combo screens to react to. */
export const useLastScan = create<{ outcome: ScanOutcome | null; at: number; set: (o: ScanOutcome) => void; clear: () => void }>((set) => ({
  outcome: null,
  at: 0,
  set: (outcome) => set({ outcome, at: Date.now() }),
  clear: () => set({ outcome: null, at: 0 }),
}))
