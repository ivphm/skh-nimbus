import { create } from 'zustand'
import { initialState, transition, type WorkflowEvent, type WorkflowState } from './machine'

interface WorkflowStore {
  state: WorkflowState
  send: (event: WorkflowEvent) => WorkflowState
}

export const useWorkflow = create<WorkflowStore>((set, get) => ({
  state: initialState,
  send: (event) => {
    const next = transition(get().state, event)
    if (next !== get().state) set({ state: next })
    return next
  },
}))

/** Narrow the current state to one name, or null when the machine is elsewhere. */
export function useWorkflowIn<N extends WorkflowState['name']>(name: N): Extract<WorkflowState, { name: N }> | null {
  const state = useWorkflow((s) => s.state)
  return state.name === name ? (state as Extract<WorkflowState, { name: N }>) : null
}
