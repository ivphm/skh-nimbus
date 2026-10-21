import { motion, useReducedMotion } from 'motion/react'
import { locationLabel } from '@/core/domain/ledger'
import type { Location } from '@/core/domain/types'
import type { StripStatus } from '@/core/services'

const SHELVES = ['A', 'B', 'C'] as const

export interface ShelfMapProps {
  location: Location | null
  strip: StripStatus
}

/**
 * Store-room map for Locate (A6 Treasure map, B6 Follow the light).
 * The target slot glows and the location label is always shown, so the LED strip is never the only cue.
 */
export function ShelfMap({ location, strip }: ShelfMapProps) {
  const reduce = useReducedMotion()
  return (
    <figure className="flex flex-col gap-4" aria-label={`Store room map. ${locationLabel(location)}`}>
      <div className="grid grid-cols-3 gap-4">
        {SHELVES.map((shelf) => {
          const active = location?.shelf === shelf
          return (
            <div key={shelf} className={`rounded-card border p-3 ${active ? 'border-accent' : 'border-border'} bg-surface`}>
              <div className="mb-2 font-display text-sm font-semibold text-ink-muted">Shelf {shelf}</div>
              <div className="grid gap-2">
                {[1, 2, 3, 4].map((n) => {
                  const slot = `${shelf}${n}`
                  const target = location?.slot === slot
                  return (
                    <motion.div
                      key={slot}
                      className={`rounded-control px-3 py-2 text-sm ${target ? 'bg-accent font-semibold text-accent-ink' : 'bg-surface-2 text-ink-muted'}`}
                      animate={target && strip === 'lit' && !reduce ? { boxShadow: ['0 0 0 0 var(--color-glow)', '0 0 24px 6px var(--color-glow)', '0 0 0 0 var(--color-glow)'] } : undefined}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    >
                      {target && location?.bin ? `${slot} · Bin ${location.bin}` : slot}
                    </motion.div>
                  )
                })}
              </div>
              {/* The LED strip under the shelf. */}
              <div
                aria-hidden="true"
                className={`mt-3 h-1.5 rounded-full ${active && strip === 'lit' ? 'bg-reward' : 'bg-surface-2'}`}
              />
            </div>
          )
        })}
      </div>
      <figcaption className="font-display text-lg font-semibold">
        {locationLabel(location)}
        <span className="ml-3 text-sm font-normal text-ink-muted">
          {strip === 'lit' ? 'Strip lit' : strip === 'not-responding' ? 'Strip not responding, use the label' : 'Strip off'}
        </span>
      </figcaption>
    </figure>
  )
}
