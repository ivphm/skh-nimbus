import type { ReactNode } from 'react'
import { ERROR_COPY, type ErrorCode } from './errors'

type Tone = 'info' | 'warning' | 'danger' | 'success'

const tones: Record<Tone, string> = {
  info: 'border-accent',
  warning: 'border-warning',
  danger: 'border-danger',
  success: 'border-success',
}

/** Inline status and error message (I8 error states). Errors are announced. */
export function Notice({ tone = 'info', title, children }: { tone?: Tone; title: string; children?: ReactNode }) {
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={`rounded-card border-l-4 bg-surface-2 px-4 py-3 ${tones[tone]}`}>
      <p className="font-display font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm text-ink-muted">{children}</div>}
    </div>
  )
}

export function ErrorNotice({ code }: { code: ErrorCode }) {
  const copy = ERROR_COPY[code]
  return (
    <Notice tone="danger" title={copy.title}>
      {copy.body}
    </Notice>
  )
}
