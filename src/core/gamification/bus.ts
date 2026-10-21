/**
 * Gamification events. Core actions emit them; each experience listens and turns
 * them into its own rewards and animations (XP and combos in Quest, suns in Nimbus).
 */
export type GameEvent =
  | { type: 'part.scanned'; staffId: string; partId: string; cleanStreak: number }
  | { type: 'loan.confirmed'; staffId: string; workOrderId: string; partCount: number }
  | { type: 'loan.closed'; staffId: string; loanId: string; partId: string; outcome: 'used' | 'returned'; forTeammate: boolean; wasOverdue: boolean }
  | { type: 'session.ended'; staffId: string; unconfirmed: boolean }

export type GameEventType = GameEvent['type']
type Handler<T extends GameEventType> = (event: Extract<GameEvent, { type: T }>) => void
type AnyHandler = (event: GameEvent) => void

export interface EventBus {
  on<T extends GameEventType>(type: T, handler: Handler<T>): () => void
  onAny(handler: AnyHandler): () => void
  emit(event: GameEvent): void
}

export function createEventBus(): EventBus {
  const handlers = new Map<GameEventType, Set<AnyHandler>>()
  const any = new Set<AnyHandler>()
  return {
    on(type, handler) {
      const set = handlers.get(type) ?? new Set()
      set.add(handler as AnyHandler)
      handlers.set(type, set)
      return () => set.delete(handler as AnyHandler)
    },
    onAny(handler) {
      any.add(handler)
      return () => any.delete(handler)
    },
    emit(event) {
      handlers.get(event.type)?.forEach((h) => h(event))
      any.forEach((h) => h(event))
    },
  }
}

export const gameBus = createEventBus()
