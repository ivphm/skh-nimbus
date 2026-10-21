import { useEffect } from 'react'
import { useWorkflow } from '@/core/workflow/store'
import { stepAway } from './actions'

/** No touch for this long with parts still in the list counts as stepping away. */
export const IDLE_TIMEOUT_MS = 60_000

/**
 * Warns when the user seems to have walked off with an unconfirmed list.
 * It never signs out: the session ends only when the user presses Sign out.
 */
export function SessionWatcher() {
  const state = useWorkflow((s) => s.state)
  const watching = state.name === 'drawing' && state.cart.length > 0 && !state.unconfirmedWarning
  useEffect(() => {
    if (!watching) return
    let timer: ReturnType<typeof setTimeout>
    const arm = () => {
      clearTimeout(timer)
      timer = setTimeout(stepAway, IDLE_TIMEOUT_MS)
    }
    const events = ['pointerdown', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, arm))
    arm()
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, arm))
    }
  }, [watching, state])
  return null
}
