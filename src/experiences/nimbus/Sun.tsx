import { motion } from 'motion/react'
import { useId } from 'react'

export type SunMood = 'sleepy' | 'happy'

/**
 * Nimbus's sun mascot. The glow is drawn inside the SVG's own box, so a scrolling
 * parent never clips it. Sleepy on the idle sky (B1), happy on success (B8).
 */
export function Sun({ size = 320, mood = 'happy', className = '' }: { size?: number; mood?: SunMood; className?: string }) {
  const id = useId()
  const ink = 'var(--color-ink)'
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden="true"
      className={`overflow-visible ${className}`}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="45%" stopColor="var(--color-reward)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-reward)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-face`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffd96a" />
          <stop offset="100%" stopColor="var(--color-reward)" />
        </radialGradient>
      </defs>

      <motion.circle
        cx="100"
        cy="100"
        r="100"
        fill={`url(#${id}-glow)`}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx="100" cy="100" r="58" fill={`url(#${id}-face)`} />

      {/* Cheeks */}
      <ellipse cx="72" cy="112" rx="9" ry="5.5" fill="#f2836b" opacity="0.45" />
      <ellipse cx="128" cy="112" rx="9" ry="5.5" fill="#f2836b" opacity="0.45" />

      {mood === 'sleepy' ? (
        <>
          {/* Closed eyes and a small content smile */}
          <path d="M70 96 q8 7 16 0" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M114 96 q8 7 16 0" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M92 122 q8 5 16 0" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
          <motion.text
            x="150"
            y="58"
            fontSize="22"
            fontWeight="800"
            fill={ink}
            fontFamily="var(--font-display)"
            animate={{ opacity: [0, 1, 0], y: [0, -10, -18] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
          >
            z
          </motion.text>
        </>
      ) : (
        <>
          {/* Open eyes with highlights and a wide smile */}
          <ellipse cx="78" cy="94" rx="6" ry="8" fill={ink} />
          <ellipse cx="122" cy="94" rx="6" ry="8" fill={ink} />
          <circle cx="80" cy="91" r="2" fill="#fff" />
          <circle cx="124" cy="91" r="2" fill="#fff" />
          <path d="M82 116 q18 18 36 0" stroke={ink} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </motion.svg>
  )
}
