import { expect, test, type Page } from '@playwright/test'

/** Holds the press-and-hold confirm long enough to complete. */
async function hold(page: Page, name: string) {
  const box = (await page.getByRole('button', { name }).boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(1800)
  await page.mouse.up()
}

test.describe('experience switch', () => {
  test('home toggle switches experience and survives a reload', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-experience', 'nimbus')
    await expect(page.getByRole('heading', { name: 'Nimbus is napping' })).toBeVisible()

    await page.getByRole('switch').click()
    await expect(page.locator('html')).toHaveAttribute('data-experience', 'quest')
    await expect(page.getByRole('heading', { name: 'Parts Quest' })).toBeVisible()

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-experience', 'quest')
  })

  test('?exp= overrides for one visit without saving', async ({ page }) => {
    await page.goto('/?exp=quest')
    await expect(page.locator('html')).toHaveAttribute('data-experience', 'quest')
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-experience', 'nimbus')
  })
})

test.describe('check-out flow', () => {
  test('Nimbus: card sign-in, draw two parts, seal the loan', async ({ page }) => {
    await page.goto('/?exp=nimbus')
    await page.getByRole('button', { name: 'Tap staff card' }).click()
    await expect(page.getByRole('heading', { name: 'Hi Alex! Nice to see you.' })).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('heading', { name: /Morning, Alex/ })).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('listitem').filter({ hasText: 'Infusion pump' }).getByRole('button', { name: 'Help with this' }).click()
    await expect(page.getByRole('heading', { name: 'Grab your parts' })).toBeVisible()
    await page.getByRole('listitem').filter({ hasText: 'Pressure transducer' }).getByRole('button', { name: 'Add' }).click()
    // Keyboard-wedge barcode scanner: digits then Enter.
    await page.keyboard.type('880013')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('group', { name: 'Quantity for Occlusion sensor' })).toBeVisible()

    await page.getByRole('button', { name: 'Seal the loan' }).click()
    await hold(page, 'Hold to seal the loan')
    await expect(page.getByRole('heading', { name: 'Sealed! Sunny skies' })).toBeVisible()
    await expect(page.getByText('2 parts out on WO-2041')).toBeVisible()
  })

  test('Quest: close a teammate’s overdue loan from the quest board', async ({ page }) => {
    await page.goto('/?exp=quest')
    await page.getByRole('button', { name: 'Tap staff card' }).click()
    await expect(page.getByRole('heading', { name: 'Welcome back, Alex!' })).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText(/Side quest/)).toBeVisible()

    await page.getByRole('listitem').filter({ hasText: 'WO-2019' }).getByRole('button', { name: 'Debrief' }).click()
    await page.getByRole('button', { name: 'Returned' }).click()
    await expect(page.getByRole('alertdialog')).toContainText('Close Priya N.’s loan?')
    await page.getByRole('button', { name: 'Mark returned' }).click()
    await page.getByRole('button', { name: 'Complete debrief' }).click()

    await expect(page.getByText('MISSION COMPLETE')).toBeVisible()
    await expect(page.getByText('Squad assist').first()).toBeVisible()
  })

  test('Face ID greets the user, and "Not you?" switches to the card', async ({ page }) => {
    await page.goto('/?exp=nimbus')
    await page.getByRole('button', { name: 'Wake Nimbus' }).click()
    await expect(page.getByRole('heading', { name: 'Hi Alex! Nice to see you.' })).toBeVisible()
    await page.getByRole('button', { name: 'Not Alex? Use staff card' }).click()
    await expect(page.getByRole('heading', { name: 'Tap your staff card on the reader' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hi Alex! Nice to see you.' })).toBeVisible()
  })

  test('Nimbus: every step can go back', async ({ page }) => {
    await page.goto('/?exp=nimbus')
    await page.getByRole('button', { name: 'Tap staff card' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('heading', { name: 'Which job are you helping?' })).toBeVisible()

    // Job list back to the forecast, and forward again.
    await page.getByRole('button', { name: 'Today’s forecast' }).click()
    await expect(page.getByRole('heading', { name: /Morning, Alex/ })).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('listitem').filter({ hasText: 'Infusion pump' }).getByRole('button', { name: 'Help with this' }).click()
    await page.getByRole('listitem').filter({ hasText: 'Pressure transducer' }).getByRole('button', { name: 'Add' }).click()

    // Locate and back to the bag.
    await page.getByRole('listitem').filter({ hasText: 'Pressure transducer' }).getByRole('link', { name: 'Find' }).click()
    await expect(page.getByRole('heading', { name: 'Follow the light!' })).toBeVisible()
    await page.getByRole('button', { name: 'My bag', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Grab your parts' })).toBeVisible()

    // Seal screen back to the bag keeps the list.
    await page.getByRole('button', { name: 'Seal the loan' }).click()
    await page.getByRole('button', { name: 'My bag', exact: true }).click()
    await expect(page.getByRole('group', { name: 'Quantity for Pressure transducer' })).toBeVisible()

    // Partdex from the header, then back to where we were.
    await page.getByRole('link', { name: 'Partdex' }).click()
    await expect(page.getByRole('heading', { name: 'Partdex' })).toBeVisible()
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.getByRole('heading', { name: 'Grab your parts' })).toBeVisible()

    // Changing job asks before emptying the list.
    await page.getByRole('button', { name: 'Pick another job' }).click()
    await expect(page.getByRole('alertdialog')).toContainText('Pick a different job?')
    await page.getByRole('button', { name: 'Empty list and go back' }).click()
    await expect(page.getByRole('heading', { name: 'Which job are you helping?' })).toBeVisible()
  })

  test('Face ID failure falls back to the staff card', async ({ page }) => {
    await page.goto('/?exp=nimbus&fail=face')
    await page.getByRole('button', { name: 'Wake Nimbus' }).click()
    await expect(page.getByRole('alert')).toContainText('Face not recognised')
    await expect(page.getByRole('heading', { name: /staff card/ })).toBeVisible()
  })
})

test('Parts Out board is view only and lists overdue loans', async ({ page }) => {
  await page.goto('/parts-out?exp=nimbus')
  await expect(page.getByRole('heading', { name: 'Parts Out · Cloud board' })).toBeVisible()
  await expect(page.getByText('Fuse 3.15A ×5')).toBeVisible()
  await expect(page.getByText('Overdue').first()).toBeVisible()
  await expect(page.getByRole('button')).toHaveCount(0)
  await page.getByRole('link', { name: 'Station' }).click()
  await expect(page.getByRole('heading', { name: 'Nimbus is napping' })).toBeVisible()
})
