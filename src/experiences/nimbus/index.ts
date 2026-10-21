import { lazy } from 'react'
import type { ExperienceDefinition } from '@/app/definition'
import { NimbusEffects } from './Effects'

/** Alt B · Nimbus Weather: light sky theme. Screen ids map to the Figma frames B1–B12. */
export const nimbus: ExperienceDefinition = {
  id: 'nimbus',
  name: 'Nimbus Weather',
  screens: {
    idle: lazy(() => import('./screens/B01Sky')),
    signIn: lazy(() => import('./screens/B02SayHello')),
    loans: lazy(() => import('./screens/B03Forecast')),
    workOrders: lazy(() => import('./screens/B04WhichDrop')),
    cart: lazy(() => import('./screens/B05GrabParts')),
    locate: lazy(() => import('./screens/B06FollowTheLight')),
    confirm: lazy(() => import('./screens/B07SealTheLoan')),
    success: lazy(() => import('./screens/B08SunnySuccess')),
    closeJob: lazy(() => import('./screens/B09ClearTheClouds')),
    stats: lazy(() => import('./screens/B10Partdex')),
    team: lazy(() => import('./screens/B11TeamSky')),
    partsOut: lazy(() => import('./screens/B12CloudBoard')),
  },
  // Suggestions and scanning live on the Grab parts screen.
  aliases: { briefing: 'cart', scan: 'cart' },
  Effects: NimbusEffects,
}
