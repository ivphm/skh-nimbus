import { motion } from 'motion/react'
import { useExperienceId, useExperienceStore } from '@/app/experience'

/** Home-screen switch between Parts Quest (night) and Nimbus Weather (day). */
export function ExperienceToggle() {
  const id = useExperienceId()
  const toggle = useExperienceStore((s) => s.toggle)
  const quest = id === 'quest'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={quest}
      aria-label="Parts Quest night mode"
      onClick={toggle}
      className="flex min-h-12 items-center gap-3 rounded-full border border-border bg-surface px-2 py-1.5 pr-4 text-sm font-semibold text-ink"
    >
      <span className={`relative flex h-8 w-14 items-center rounded-full ${quest ? 'bg-accent' : 'bg-reward'}`}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute grid h-6 w-6 place-items-center rounded-full bg-white text-xs ${quest ? 'right-1' : 'left-1'}`}
          aria-hidden="true"
        >
          {quest ? '☾' : '☀'}
        </motion.span>
      </span>
      {quest ? 'Parts Quest' : 'Nimbus Weather'}
    </button>
  )
}
