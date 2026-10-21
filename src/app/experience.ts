import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const EXPERIENCE_IDS = ['quest', 'nimbus'] as const
export type ExperienceId = (typeof EXPERIENCE_IDS)[number]

export const DEFAULT_EXPERIENCE: ExperienceId = 'nimbus'

export function parseExperience(value: string | null | undefined): ExperienceId | null {
  return EXPERIENCE_IDS.find((id) => id === value) ?? null
}

/** `?exp=quest|nimbus` wins for this visit without changing the saved choice. */
export function experienceFromUrl(search: string): ExperienceId | null {
  return parseExperience(new URLSearchParams(search).get('exp'))
}

interface ExperienceStore {
  /** Saved choice, persisted in localStorage. */
  saved: ExperienceId
  /** One-visit override from the URL. Not persisted. */
  override: ExperienceId | null
  set: (id: ExperienceId) => void
  toggle: () => void
}

export const useExperienceStore = create<ExperienceStore>()(
  persist(
    (set, get) => ({
      saved: DEFAULT_EXPERIENCE,
      override: typeof window === 'undefined' ? null : experienceFromUrl(window.location.search),
      set: (id) => set({ saved: id, override: null }),
      toggle: () => {
        const current = get().override ?? get().saved
        set({ saved: current === 'quest' ? 'nimbus' : 'quest', override: null })
      },
    }),
    {
      name: 'skh-nimbus.experience',
      partialize: (s) => ({ saved: s.saved }),
      merge: (persisted, current) => {
        const saved = parseExperience((persisted as { saved?: string } | undefined)?.saved)
        return { ...current, saved: saved ?? current.saved }
      },
    },
  ),
)

export function useExperienceId(): ExperienceId {
  return useExperienceStore((s) => s.override ?? s.saved)
}
