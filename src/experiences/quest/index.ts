import { lazy } from 'react'
import type { ExperienceDefinition } from '@/app/definition'
import { QuestEffects } from './Effects'

/** Alt A · Parts Quest: dark game HUD. Screen ids map to the Figma frames A1–A12. */
export const quest: ExperienceDefinition = {
  id: 'quest',
  name: 'Parts Quest',
  screens: {
    idle: lazy(() => import('./screens/A01Lobby')),
    signIn: lazy(() => import('./screens/A02CrewCheckIn')),
    workOrders: lazy(() => import('./screens/A03QuestBoard')),
    briefing: lazy(() => import('./screens/A04MissionBriefing')),
    cart: lazy(() => import('./screens/A05Loadout')),
    locate: lazy(() => import('./screens/A06TreasureMap')),
    scan: lazy(() => import('./screens/A07Collect')),
    confirm: lazy(() => import('./screens/A08LockIn')),
    closeJob: lazy(() => import('./screens/A09Debrief')),
    success: lazy(() => import('./screens/A10LevelUp')),
    stats: lazy(() => import('./screens/A11Profile')),
    partsOut: lazy(() => import('./screens/A12OutOnMissions')),
  },
  // The quest board carries the overdue side quest, and the profile carries the squad view.
  aliases: { loans: 'workOrders', team: 'stats' },
  Effects: QuestEffects,
}
