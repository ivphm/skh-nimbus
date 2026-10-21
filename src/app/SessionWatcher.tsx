import { useEffect } from 'react'
import { useWorkflow } from '@/core/workflow/store'
import { signOut, stepAway } from './actions'

/** No touch for this long counts as stepping away. */
export const IDLE_TIMEOUT_MS = 60_000
/** Time to come back after the unconfirmed warning before the session ends anyway. */
export const WARNING_GRACE_MS = 20_000

/** Signs the station out after inactivity, warning first if the list is not confirmed. */
export function SessionWatcher() {
  const state = useWorkflow((s) => s.state)
  const signedIn = 'staff' in state && state.name !== 'success'
  const warned = state.name === 'drawing' && state.unconfirmedWarning
  useEffect(() => {
    if (!signedIn) return
    let timer: ReturnType<typeof setTimeout>
    const arm = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const s = useWorkflow.getState().state
        if (s.name === 'drawing' && !s.unconfirmedWarning && s.cart.length > 0) stepAway()
        else void signOut()
      }, warned ? WARNING_GRACE_MS : IDLE_TIMEOUT_MS)
    }
    const events = ['pointerdown', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, arm))
    arm()
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, arm))
    }
  }, [signedIn, warned, state])
  return null
}
