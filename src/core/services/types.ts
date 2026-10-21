/** Hardware at the station. Real drivers replace the mocks behind these interfaces. */

export type AuthResult = { ok: true; staffId: string } | { ok: false; error: 'face-not-recognised' | 'card-not-read' }

export interface FaceIdService {
  /** Runs one face scan. Resolves when the camera gives a result. */
  scan(signal?: AbortSignal): Promise<AuthResult>
}

export interface CardReaderService {
  /** Waits for a staff card tap. */
  waitForTap(signal?: AbortSignal): Promise<AuthResult>
}

export interface BarcodeScannerService {
  /** Subscribes to barcode reads. Returns an unsubscribe function. */
  onScan(handler: (barcode: string) => void): () => void
}

export type StripStatus = 'off' | 'lit' | 'not-responding'

export interface LedStripState {
  status: StripStatus
  segment: number | null
}

export interface LedStripService {
  light(segment: number): Promise<LedStripState>
  clear(): Promise<LedStripState>
  getState(): LedStripState
  subscribe(handler: (state: LedStripState) => void): () => void
}

export interface FeedbackService {
  /** Tick, sound and vibration for one confirmed draw. */
  confirm(): void
  /** Audible cue for the unconfirmed warning. */
  warn(): void
}

export interface StationServices {
  faceId: FaceIdService
  cardReader: CardReaderService
  scanner: BarcodeScannerService
  ledStrip: LedStripService
  feedback: FeedbackService
}
