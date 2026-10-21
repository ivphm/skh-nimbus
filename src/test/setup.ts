import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetDb } from '@/mocks/db'
import { server } from '@/mocks/server'

// jsdom has no origin for relative fetches; give the API one.
const base = 'http://localhost'
const realFetch = globalThis.fetch
globalThis.fetch = (input, init) => realFetch(typeof input === 'string' && input.startsWith('/') ? base + input : input, init)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
  localStorage.clear()
})
afterAll(() => server.close())
