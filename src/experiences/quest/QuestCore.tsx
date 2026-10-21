import { motion } from 'motion/react'
import { useId } from 'react'

/**
 * Parts Quest's start visual: a glowing hexagon power core with a wrench and gear,
 * circled by an orbiting HUD ring. Glow is drawn inside the SVG so nothing clips it.
 */
export function QuestCore({ size = 300 }: { size?: number }) {
  const id = useId()
  // Flat-top hexagon around (100, 100).
  const hex = (r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i
      return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`
    }).join(' ')
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden="true" className="overflow-visible">
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="35%" stopColor="var(--color-accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-core`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9d85ff" />
          <stop offset="100%" stopColor="#4b2fd6" />
        </linearGradient>
      </defs>

      <motion.circle
        cx="100"
        cy="100"
        r="100"
        fill={`url(#${id}-glow)`}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting HUD ring with ticks */}
      <motion.g
        style={{ originX: '100px', originY: '100px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="100" cy="100" r="84" fill="none" stroke="var(--color-accent)" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="6 10" />
        <circle cx="100" cy="16" r="4" fill="var(--color-reward)" />
        <circle cx="184" cy="100" r="3" fill="var(--color-success)" />
      </motion.g>

      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <polygon points={hex(62)} fill={`url(#${id}-core)`} stroke="#c9bdff" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points={hex(50)} fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Gear */}
        <g transform="translate(86 112)" fill="var(--color-reward)">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="-4" y="-25" width="8" height="10" rx="2" transform={`rotate(${i * 45})`} />
          ))}
          <circle r="17" />
          <circle r="7" fill="#4b2fd6" />
        </g>

        {/* Wrench */}
        <g transform="translate(116 86) rotate(45)" fill="#ffffff">
          <rect x="-5" y="-6" width="10" height="44" rx="5" />
          <path d="M-14 -16 a14 14 0 1 0 28 0 l-6 0 l0 8 l-16 0 l0 -8 z" />
        </g>
      </motion.g>
    </svg>
  )
}
