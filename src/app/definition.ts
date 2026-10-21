import type { ComponentType, LazyExoticComponent } from 'react'
import type { ExperienceId } from './experience'
import type { ScreenId } from './routes'

type Screen = ComponentType | LazyExoticComponent<ComponentType>

/** What an experience plugs into the shared app. */
export interface ExperienceDefinition {
  id: ExperienceId
  name: string
  screens: Partial<Record<ScreenId, Screen>>
  /** Screens this experience folds into another, for example Quest shows overdue loans on its quest board. */
  aliases?: Partial<Record<ScreenId, ScreenId>>
  /** Mounted once at the root. Listens to the game bus for toasts, sounds and confetti. */
  Effects?: ComponentType
}

export function resolveScreen(def: ExperienceDefinition, id: ScreenId): Screen | null {
  const direct = def.screens[id]
  if (direct) return direct
  const alias = def.aliases?.[id]
  return alias ? (def.screens[alias] ?? null) : null
}
