import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ExperienceToggle } from '@/ui/ExperienceToggle'
import { experienceFromUrl, parseExperience, useExperienceStore } from './experience'

beforeEach(() => useExperienceStore.setState({ saved: 'nimbus', override: null }))

describe('experience choice', () => {
  it('parses only known experiences', () => {
    expect(parseExperience('quest')).toBe('quest')
    expect(parseExperience('dark')).toBeNull()
    expect(experienceFromUrl('?exp=nimbus&x=1')).toBe('nimbus')
    expect(experienceFromUrl('')).toBeNull()
  })

  it('toggles from the home-page switch and saves the choice', async () => {
    render(<ExperienceToggle />)
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(JSON.parse(localStorage.getItem('skh-nimbus.experience')!).state).toEqual({ saved: 'quest' })
  })

  it('lets the URL override win without saving it', () => {
    useExperienceStore.setState({ saved: 'nimbus', override: 'quest' })
    render(<ExperienceToggle />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    expect(useExperienceStore.getState().saved).toBe('nimbus')
  })
})
