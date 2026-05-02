import { test, expect } from '@playwright/test'

const isPreviewSmoke = process.env.PLAYWRIGHT_USE_PREVIEW === '1'

const loginWithDeveloperMode = async (page) => {
  await expect(page.getByTestId('dev-login-button')).toBeVisible()
  await page.getByTestId('dev-login-button').click()
  await page.waitForFunction(() => typeof window.openSettings === 'function', null, { timeout: 30000 })
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
}

const openDeveloperMode = async (page) => {
  await page.evaluate(() => {
    window.openSettings?.()
  })
  const developerModeEntry = page.getByRole('button', { name: /developer mode launch flows quickly/i })
  try {
    await expect(developerModeEntry).toBeVisible({ timeout: 5000 })
  } catch {
    const settingsButton = page.getByRole('button', { name: /^settings$/i }).first()
    if (await settingsButton.isVisible()) {
      await settingsButton.click()
    }
    await expect(developerModeEntry).toBeVisible()
  }
  await developerModeEntry.click()
  await expect(page.getByRole('heading', { name: 'Developer Mode' }).first()).toBeVisible()
}

test.describe('Preflight smoke', () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors = []
    const consoleErrors = []

    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.setExtraHTTPHeaders({ 'x-datser-smoke': '1' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    test.info().annotations.push({
      type: 'pageErrors',
      description: JSON.stringify(pageErrors)
    })

    test.info().annotations.push({
      type: 'consoleErrors',
      description: JSON.stringify(consoleErrors)
    })
  })

  test('loads the login screen without crashing', async ({ page }) => {
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
  })

  test('core auth actions render and stay interactive', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /^sign in$/i }).last()
    const googleButton = page.getByRole('button', { name: /continue with google/i })
    const emailInput = page.locator('input[type="email"]').first()

    await emailInput.fill('smoke@example.com')
    await expect(emailInput).toHaveValue('smoke@example.com')
    await expect(signInButton).toBeVisible()
    await expect(googleButton).toBeVisible()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)
  })

  test('developer mode launches add member and date picking stays stable', async ({ page }) => {
    test.skip(isPreviewSmoke, 'Developer bypass is intentionally disabled in preview/prod smoke runs.')

    await loginWithDeveloperMode(page)
    await openDeveloperMode(page)

    await page.getByTestId('dev-launcher-select').selectOption('add-member')
    await page.getByTestId('dev-launcher-open').click()
    await expect(page.getByRole('heading', { name: 'Add New Member' })).toBeVisible()

    await page.getByPlaceholder('Enter full name').fill('Smoke Member')
    await page.getByText('Female').click()
    await page.getByRole('button', { name: /select date/i }).click()
    await page.getByText('January', { exact: true }).click()
    await page.getByText(String(new Date().getFullYear() - 1), { exact: true }).click()
    await page.locator('div').filter({ hasText: /^15$/ }).first().click()

    await expect(page.getByRole('button', { name: /january 15,/i })).toBeVisible()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)

    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading', { name: 'Add New Member' })).toHaveCount(0)
  })

  test('developer mode notification tester stacks mobile toasts', async ({ page }) => {
    test.skip(isPreviewSmoke, 'Developer bypass is intentionally disabled in preview/prod smoke runs.')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await loginWithDeveloperMode(page)
    await openDeveloperMode(page)

    await page.getByTestId('dev-member-picker-toggle').click()
    const memberPickerList = page.getByTestId('dev-member-picker-list')
    await expect(memberPickerList).toBeVisible()
    const memberPickerMaxHeight = await memberPickerList.evaluate((node) => Number.parseFloat(window.getComputedStyle(node).maxHeight))
    expect(memberPickerMaxHeight).toBeLessThanOrEqual(224)
    await page.keyboard.press('Escape')

    await page.getByTestId('dev-notification-stack-test').click()
    const toasts = page.locator('.datser-toast-stack .dev-stack-test-toast')
    await expect(toasts).toHaveCount(4)

    const toastMetrics = await toasts.evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect()
      const style = window.getComputedStyle(node)
      return {
        top: rect.top,
        bottom: rect.bottom,
        opacity: Number.parseFloat(style.opacity)
      }
    }))

    const stackHeight = toastMetrics[toastMetrics.length - 1].bottom - toastMetrics[0].top
    expect(toastMetrics[0].top).toBeLessThanOrEqual(24)
    expect(stackHeight).toBeLessThanOrEqual(240)
    expect(Math.min(...toastMetrics.map((metric) => metric.opacity))).toBeGreaterThan(0.95)
  })

  test('developer mode launches create month and carry-over options switch cleanly', async ({ page }) => {
    test.skip(isPreviewSmoke, 'Developer bypass is intentionally disabled in preview/prod smoke runs.')

    await loginWithDeveloperMode(page)
    await openDeveloperMode(page)

    await page.getByTestId('dev-launcher-select').selectOption('create-month')
    await page.getByTestId('dev-launcher-open').click()
    await expect(page.getByRole('heading', { name: 'Create New Month' })).toBeVisible()

    const copyEveryone = page.locator('input[name="copyMode"][value="all"]')
    const selectSpecific = page.locator('input[name="copyMode"][value="custom"]')
    const copyAttendance = page.locator('input[name="copyMode"][value="attendance"]')
    const startFresh = page.locator('input[name="copyMode"][value="empty"]')

    await page.getByText('Select specific people', { exact: true }).click()
    await expect(selectSpecific).toBeChecked()

    await page.getByText('Copy present people from a Sunday', { exact: true }).click()
    await expect(copyAttendance).toBeChecked()

    await page.getByText('Start fresh', { exact: true }).click()
    await expect(startFresh).toBeChecked()

    await page.getByText('Copy everyone', { exact: true }).click()
    await expect(copyEveryone).toBeChecked()
    await expect(page.getByText('Something went wrong')).toHaveCount(0)

    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading', { name: 'Create New Month' })).toHaveCount(0)
  })
})
