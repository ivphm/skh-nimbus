import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { actions, useRoomHealth, useSignedInStaff } from '@/app/viewModels'

/** Nimbus Weather sky header, shared by B1–B12. Room health is the share of loans on time. */
export function NimbusFrame({ children, right, health }: { children: ReactNode; right?: ReactNode; health?: number }) {
  const staff = useSignedInStaff()
  const live = useRoomHealth()
  return (
    <div className="flex h-full min-h-dvh flex-col">
      <header className="flex h-[72px] items-center gap-4 px-8">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent font-display text-lg font-extrabold text-accent-ink" aria-hidden="true">
          N
        </span>
        <span className="font-display text-xl font-extrabold">SKH Nimbus</span>
        <div className="ml-auto flex items-center gap-4">
          <span className="rounded-full bg-surface px-4 py-2 text-sm font-semibold">☀ Room health {health ?? live}%</span>
          {staff && (
            <>
              <Link to="/me" className="min-h-12 content-center px-2 text-sm font-semibold text-ink-muted">
                Partdex
              </Link>
              <Link to="/team" className="min-h-12 content-center px-2 text-sm font-semibold text-ink-muted">
                Team sky
              </Link>
              <button type="button" onClick={() => void actions.signOut()} className="min-h-12 px-2 text-sm font-semibold text-ink-muted">
                Sign out
              </button>
            </>
          )}
          {right}
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-8 pb-8">{children}</main>
    </div>
  )
}
