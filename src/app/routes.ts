import type { StateName, WorkflowState } from '@/core/workflow/machine'

/**
 * Experience-neutral screens. Routes and workflow guards live here.
 * Each experience supplies a component per screen, or an alias to another of its screens.
 */
export type ScreenId =
  | 'idle'
  | 'signIn'
  | 'loans'
  | 'workOrders'
  | 'briefing'
  | 'cart'
  | 'locate'
  | 'scan'
  | 'confirm'
  | 'success'
  | 'closeJob'
  | 'stats'
  | 'team'
  | 'partsOut'

type Guard = StateName[] | 'signedIn' | 'any'

export const SCREENS: Record<ScreenId, { path: string; guard: Guard }> = {
  idle: { path: '/', guard: ['idle'] },
  signIn: { path: '/sign-in', guard: ['signingIn'] },
  loans: { path: '/loans', guard: ['reviewingLoans'] },
  workOrders: { path: '/work-orders', guard: ['reviewingLoans', 'selectingWorkOrder'] },
  briefing: { path: '/draw/briefing', guard: ['drawing'] },
  cart: { path: '/draw', guard: ['drawing'] },
  locate: { path: '/draw/locate/:partId', guard: ['drawing'] },
  scan: { path: '/draw/scan', guard: ['drawing'] },
  confirm: { path: '/confirm', guard: ['confirming'] },
  success: { path: '/success', guard: ['success'] },
  closeJob: { path: '/close', guard: ['closingJob'] },
  stats: { path: '/me', guard: 'signedIn' },
  team: { path: '/team', guard: 'signedIn' },
  partsOut: { path: '/parts-out', guard: 'any' },
}

export function allows(screen: ScreenId, state: WorkflowState): boolean {
  const { guard } = SCREENS[screen]
  if (guard === 'any') return true
  if (guard === 'signedIn') return 'staff' in state
  return guard.includes(state.name)
}

/** Where the station goes when the workflow enters a state. */
export function primaryScreen(state: WorkflowState, previous?: WorkflowState): ScreenId {
  switch (state.name) {
    case 'idle':
      return 'idle'
    case 'signingIn':
      return 'signIn'
    case 'reviewingLoans':
      return 'loans'
    case 'selectingWorkOrder':
      return 'workOrders'
    case 'drawing':
      return previous?.name === 'confirming' ? 'cart' : 'briefing'
    case 'confirming':
      return 'confirm'
    case 'closingJob':
      return 'closeJob'
    case 'success':
      return 'success'
  }
}

export function pathFor(screen: ScreenId, params: Record<string, string> = {}): string {
  return SCREENS[screen].path.replace(/:(\w+)/g, (_, k: string) => encodeURIComponent(params[k] ?? ''))
}
