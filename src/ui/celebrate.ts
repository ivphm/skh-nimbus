import confetti from 'canvas-confetti'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

function tokenColors(): string[] {
  const css = getComputedStyle(document.documentElement)
  return ['--exp-accent', '--exp-reward', '--exp-success']
    .map((v) => css.getPropertyValue(v).trim())
    .filter(Boolean)
}

/** Confetti burst in the active experience's colours. Does nothing under reduced motion. */
export function celebrate(intensity: 'small' | 'big' = 'small') {
  if (prefersReducedMotion()) return
  void confetti({
    particleCount: intensity === 'big' ? 160 : 60,
    spread: intensity === 'big' ? 100 : 60,
    origin: { y: 0.6 },
    colors: tokenColors(),
    disableForReducedMotion: true,
  })
}
