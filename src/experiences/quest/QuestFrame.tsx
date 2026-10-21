import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useStaffProgress } from '@/core/gamification/progress'
import { levelFor } from '@/core/gamification/rules'
import { actions, useSignedInStaff } from '@/app/viewModels'
import { ProgressBar } from '@/ui/ProgressBar'

/** Parts Quest HUD header and backdrop, shared by A1–A12. */
export function QuestFrame({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const staff = useSignedInStaff()
  const progress = useStaffProgress(staff?.id)
  const { level, rank, progress: toNext } = levelFor(progress.xp)
  return (
    <div className="relative flex h-full min-h-dvh flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute top-[420px] left-[820px] h-[560px] w-[560px] rounded-full bg-glow blur-3xl" />
      <header className="relative z-10 flex h-[72px] items-center gap-4 border-b border-border px-8">
        <span className="grid h-10 w-10 place-items-center rounded-control bg-accent font-display text-lg font-bold text-accent-ink" aria-hidden="true">
          N
        </span>
        <span className="font-display text-xl font-bold tracking-wide">Parts Quest</span>
        <div className="ml-auto flex items-center gap-5">
          {staff && (
            <>
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-reward font-display font-bold text-reward" aria-label={`Level ${level}`}>
                {level}
              </span>
              <div className="w-56">
                <div className="text-sm text-ink-muted">
                  {rank.name}
                  {toNext && ` · ${toNext.current} / ${toNext.target} XP`}
                </div>
                {toNext && <ProgressBar value={toNext.current} max={toNext.target} label="XP to next rank" barClassName="bg-reward" className="mt-1" />}
              </div>
              <Link to="/me" className="min-h-12 content-center px-3 text-sm text-ink-muted hover:text-ink">
                Profile
              </Link>
              <button type="button" onClick={() => void actions.signOut()} className="min-h-12 rounded-control px-3 text-sm text-ink-muted hover:text-ink">
                Sign out
              </button>
            </>
          )}
          {right}
        </div>
      </header>
      <main className="relative z-10 flex-1 overflow-y-auto px-8 py-6">{children}</main>
    </div>
  )
}
