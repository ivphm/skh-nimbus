import { motion } from 'motion/react'
import { useSignIn } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { ErrorNotice } from '@/ui/Notice'
import { NimbusFrame } from '../NimbusFrame'

/** B2 · Say hello (sign-in). Face ID first, staff card as fallback, then a hello and Continue. */
export default function SayHello() {
  const s = useSignIn()
  const first = s.recognised?.staff.name.split(' ')[0]
  return (
    <NimbusFrame>
      <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
        <motion.div
          aria-hidden="true"
          className={`grid h-48 w-64 place-items-center rounded-[999px] shadow-xl ${s.recognised ? 'bg-reward' : 'bg-surface'}`}
          animate={s.recognised ? { scale: [0.9, 1] } : { y: [0, -10, 0] }}
          transition={s.recognised ? { type: 'spring', stiffness: 200 } : { duration: 2.4, repeat: Infinity }}
        >
          {s.recognised && <span className="text-6xl">☀</span>}
        </motion.div>
        {s.recognised ? (
          <>
            <h1 className="font-display text-5xl font-extrabold" aria-live="polite">
              Hi {first}! Nice to see you.
            </h1>
            <p className="text-lg text-ink-muted">
              {s.recognised.hasOpenLoans ? 'There are a few clouds to check first. Nimbus will show you.' : 'Clear skies. Let’s pick a job.'}
            </p>
            <div className="flex gap-4">
              <Button size="lg" onClick={s.proceed} autoFocus>
                Continue
              </Button>
              <Button size="lg" variant="ghost" onClick={s.notMe}>
                Not {first}? Use staff card
              </Button>
            </div>
            <p className="text-sm text-ink-muted" aria-live="polite">
              Continuing in {s.secondsLeft} s…
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-extrabold" aria-live="polite">
              {s.method === 'card' ? 'Tap your staff card on the reader' : 'Hi there! Let me see who is here… hold still for a sec.'}
            </h1>
            {s.error && (
              <div className="w-full max-w-md text-left">
                <ErrorNotice code={s.error} />
              </div>
            )}
            <div className="flex gap-4">
              {s.method === 'face' && (
                <Button variant="secondary" size="lg" onClick={s.useCard}>
                  Use staff card
                </Button>
              )}
              {s.error === 'sign-in-unavailable' && (
                <Button size="lg" onClick={s.retry}>
                  Try again
                </Button>
              )}
              {s.error === 'card-not-read' && (
                <Button size="lg" onClick={s.useCard}>
                  Try card again
                </Button>
              )}
              <Button variant="ghost" size="lg" onClick={s.cancel}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </NimbusFrame>
  )
}
