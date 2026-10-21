import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { gameBus, type GameEvent } from '@/core/gamification/bus'
import { rewardsFor, type Reward } from '@/core/gamification/rules'

interface Toast {
  id: number
  text: string
}

/**
 * Floating reward toasts driven by the game bus.
 * Each experience passes its own wording (XP and combos, or suns).
 */
export function RewardToasts({ format, onEvent }: { format: (r: Reward) => string | null; onEvent?: (e: GameEvent) => void }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  useEffect(() => {
    let id = 0
    return gameBus.onAny((event) => {
      onEvent?.(event)
      const fresh = rewardsFor(event)
        .map(format)
        .filter((t): t is string => !!t)
        .map((text) => ({ id: ++id, text }))
      if (fresh.length === 0) return
      setToasts((t) => [...t, ...fresh])
      setTimeout(() => setToasts((t) => t.filter((x) => !fresh.includes(x))), 2200)
    })
  }, [format, onEvent])
  return (
    <div aria-live="polite" className="pointer-events-none fixed top-20 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-control bg-reward px-4 py-2 font-display font-bold text-black shadow-lg"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
