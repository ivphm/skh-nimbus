import { createMockServices, parseMockFailures } from './mock'

export type * from './types'

/** Station hardware. Mocks until the real scanner, LED controller and Face ID are wired in. */
export const services = createMockServices({
  fail: typeof window === 'undefined' ? [] : parseMockFailures(window.location.search),
})
