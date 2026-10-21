import { motion } from 'motion/react'
import { useSignIn } from '@/app/viewModels'
import { Button } from '@/ui/Button'
import { ErrorNotice } from '@/ui/Notice'
import { QuestFrame } from '../QuestFrame'

/** A2 · Crew check-in. Face ID first, staff card as fallback. */
export default function CrewCheckIn() {
  const { method, error, useCard, cancel } = useSignIn()
  return (
    <QuestFrame>
      <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
        <motion.div
          aria-hidden="true"
          className="grid h-56 w-56 place-items-center rounded-full border-4 border-accent"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <span className="text-6xl">{method === 'card' ? '▭' : '◉'}</span>
        </motion.div>
        <h1 className="font-display text-4xl font-bold" aria-live="polite">
          {method === 'card' ? 'Tap your staff card' : 'Crew check-in: hold still…'}
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
    </QuestFrame>
  )
}
