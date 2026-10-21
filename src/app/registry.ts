import { nimbus } from '@/experiences/nimbus'
import { quest } from '@/experiences/quest'
import type { ExperienceDefinition } from './definition'
import type { ExperienceId } from './experience'

export const EXPERIENCES: Record<ExperienceId, ExperienceDefinition> = { quest, nimbus }
