import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './app/theme.css'

async function enableMocks() {
  // There is no backend yet, so the mock API runs in every build unless turned off.
  if (import.meta.env.VITE_MOCK_API === 'off') return
  const { installInPageMocks } = await import('./mocks/inPage')
  installInPageMocks()
  try {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
  } catch (e) {
    // Service workers blocked: the in-page mocks answer instead.
    console.warn('Mock service worker unavailable, using in-page mocks.', e)
  }
}

void enableMocks().then(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
)
