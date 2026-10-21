import { create } from 'zustand'
import { initialState, transition, type WorkflowEvent, type WorkflowState } from './machine'

interface WorkflowStore {
  state: WorkflowState
  /** State before the last transition, so screens can tell where the user came from. */
  previous: WorkflowState | null
  send: (event: WorkflowEvent) => WorkflowState
}

export const useWorkflow = create<WorkflowStore>((set, get) => ({
  state: initialState,
  previous: null,
  send: (event) => {
    const current = get().state
    const next = transition(current, event)
    if (next !== current) set({ state: next, previous: current })
    return next
  },
}))

/** Narrow the current state to one name, or null when the machine is elsewhere. */
export function useWorkflowIn<N extends WorkflowState['name']>(name: N): Extract<WorkflowState, { name: N }> | null {
  const state = useWorkflow((s) => s.state)
  return state.name === name ? (state as Extract<WorkflowState, { name: N }>) : null
}
