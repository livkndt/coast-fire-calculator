import { test, expect, type Page, type ConsoleMessage } from '@playwright/test'

// Production CSP — mirrors vercel.json exactly.
// Injecting this via route interception makes Chromium enforce the same policy
// that runs in production, including blocking eval-based source maps.
const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ')

async function injectCsp(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    const response = await route.fetch()
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': PROD_CSP },
    })
  })
}

// Returns JS errors and CSP violations collected while the action runs.
// Listeners are attached before the action so nothing is missed.
async function collectErrors(
  page: Page,
  action: () => Promise<void>,
): Promise<{ pageErrors: Error[]; cspViolations: string[] }> {
  const pageErrors: Error[] = []
  const cspViolations: string[] = []

  page.on('pageerror', (err) => pageErrors.push(err))
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
      cspViolations.push(msg.text())
    }
  })

  await action()
  return { pageErrors, cspViolations }
}

// ── CSP regression tests ────────────────────────────────────────────────────
// These catch cases like eval-based webpack source maps violating script-src.

test.describe('No JS errors or CSP violations', () => {
  test.beforeEach(async ({ page }) => {
    await injectCsp(page)
  })

  test('calculator page loads cleanly', async ({ page }) => {
    const { pageErrors, cspViolations } = await collectErrors(page, async () => {
      await page.goto('/')
      await page.waitForSelector('.results-card')
    })

    expect(
      pageErrors.map((e) => e.message),
      'unexpected JS errors on /',
    ).toEqual([])

    expect(cspViolations, 'CSP violations on /').toEqual([])
  })

  test('explainer page loads cleanly', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.results-card')

    const { pageErrors, cspViolations } = await collectErrors(page, async () => {
      await page.click('a[href="/explainer"]')
      await page.waitForURL('**/explainer')
      await page.waitForSelector('h1')
    })

    expect(
      pageErrors.map((e) => e.message),
      'unexpected JS errors on /explainer',
    ).toEqual([])

    expect(cspViolations, 'CSP violations on /explainer').toEqual([])
  })
})

// ── Happy path ──────────────────────────────────────────────────────────────

test.describe('Calculator happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.results-item__label')
  })

  test('results card shows all expected labels', async ({ page }) => {
    // Use exact-match regex to avoid 'FIRE number' matching inside 'Coast FIRE number'.
    // Default inputs are all zero so we check structure, not values.
    await expect(page.locator('dt', { hasText: /^FIRE number$/ })).toBeVisible()
    await expect(page.locator('dt', { hasText: /^Coast FIRE number$/ })).toBeVisible()
    await expect(page.locator('dt', { hasText: /^Current total$/ })).toBeVisible()

    // All value cells render formatted currency strings (including £0 for empty defaults).
    const values = page.locator('.results-item__value')
    const count = await values.count()
    for (let i = 0; i < count; i++) {
      const text = await values.nth(i).innerText()
      if (text !== 'Not reached') {
        expect(text).toMatch(/£/)
      }
    }
  })

  test('changing inputs updates results reactively', async ({ page }) => {
    // Seed a non-zero expense so the FIRE and Coast FIRE numbers become meaningful.
    await page.locator('input#expenses').fill('40000')
    await page.locator('input#expenses').blur()

    // .results-item__value--highlight is unique to the Coast FIRE number cell.
    const coastValue = page.locator('.results-item__value--highlight')
    const before = await coastValue.innerText()

    // Changing retirement age changes yearsToRetirement, which directly affects
    // the Coast FIRE number (coast = fireNumber / (1 + r)^years).
    await page.locator('input#retirementAge').fill('55')
    await page.locator('input#retirementAge').blur()

    const after = await coastValue.innerText()
    expect(after).not.toBe(before)
  })

  test('projection chart canvas is rendered', async ({ page }) => {
    // Chart.js renders into a <canvas> element inside the projection section.
    await expect(page.locator('.calculator__chart canvas')).toBeVisible()
  })

  test('export bar shows Download CSV and Copy summary buttons', async ({ page }) => {
    await expect(page.locator('text=Export your projection')).toBeVisible()
    await expect(page.locator('button', { hasText: 'Download CSV' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'Copy summary' })).toBeVisible()
  })
})

// ── Explainer happy path ────────────────────────────────────────────────────

test.describe('Explainer page happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explainer')
    await page.waitForSelector('h1')
  })

  test('renders all seven sections', async ({ page }) => {
    await expect(page.locator('text=1. The FIRE number')).toBeVisible()
    await expect(page.locator('text=2. Safe Withdrawal Rate')).toBeVisible()
    await expect(page.locator('text=3. UK State Pension adjustment')).toBeVisible()
    await expect(page.locator('text=4. The Coast FIRE number')).toBeVisible()
    await expect(page.locator('text=5. Real vs nominal returns')).toBeVisible()
    await expect(page.locator('text=6. SIPP vs other investments')).toBeVisible()
    await expect(page.locator('text=7. Default assumptions')).toBeVisible()
  })
})

// ── Navigation ──────────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('Calculator → Explainer → Calculator', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.results-card')

    await page.click('a[href="/explainer"]')
    await page.waitForURL('**/explainer')
    await expect(page.locator('h1')).toBeVisible()

    await page.click('a[href="/"]')
    await page.waitForURL(/\/$/)
    await page.waitForSelector('.results-card')
    await expect(page.locator('.results-card')).toBeVisible()
  })
})
