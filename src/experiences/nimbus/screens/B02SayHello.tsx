import { motion } from 'motion/react'
import { useSignIn } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { ErrorNotice } from '@/ui/Notice'
import { NimbusFrame } from '../NimbusFrame'

/** B2 · Say hello (sign-in). Face ID first, staff card as fallback. */
export default function SayHello() {
  const { method, error, useCard, cancel } = useSignIn()
  return (
    <NimbusFrame>
      <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
        <motion.div
          aria-hidden="true"
          className="h-48 w-64 rounded-[999px] bg-surface shadow-xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <h1 className="font-display text-4xl font-extrabold" aria-live="polite">
          {method === 'card' ? 'Tap your staff card on the reader' : 'Hi there! Let me see who is here… hold still for a sec.'}
        </h1>
        {error && (
          <div className="w-full max-w-md text-left">
            <ErrorNotice code={error} />
          </div>
        )}
        <div className="flex gap-4">
          {method === 'face' && (
            <Button variant="secondary" size="lg" onClick={useCard}>
              Use staff card
            </Button>
          )}
          {method === 'card' && error && (
            <Button size="lg" onClick={useCard}>
              Try card again
            </Button>
          )}
          <Button variant="ghost" size="lg" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </div>
    </NimbusFrame>
  )
}
