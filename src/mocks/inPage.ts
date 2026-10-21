import { getResponse } from 'msw'
import { handlers } from './handlers'

/**
 * Fallback for browsers where the mock service worker cannot answer: service workers
 * blocked, private windows, a page the worker does not control, or DevTools
 * "Bypass for network" (the dev server then returns the HTML page for /api).
 * The same MSW handlers run inside the page instead.
 */
export function installInPageMocks() {
  const realFetch = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const request = new Request(input, init)
    const url = new URL(request.url)
    if (url.origin !== location.origin || !url.pathname.startsWith('/api/')) return realFetch(input, init)
    if (navigator.serviceWorker?.controller) {
      const res = await realFetch(request.clone()).catch(() => null)
      if (res?.headers.get('content-type')?.includes('application/json')) return res
    }
    return (await getResponse(handlers, request)) ?? realFetch(input, init)
  }
}
