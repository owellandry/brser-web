import { expect, test } from '@playwright/test'

test('rehydrates the desktop and opens core apps', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('File Explorer')).toBeVisible()

  await page.getByRole('button', { name: /Open launcher/i }).click()
  await page.locator('.launcher-panel').getByRole('button', { name: /Navigator/i }).click()
  await expect(page.getByText('BrserOS Docs')).toBeVisible()
})

test('persists notes after reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Open launcher/i }).click()
  await page.locator('.launcher-panel').getByRole('button', { name: /Notes/i }).click()
  const editor = page.getByPlaceholder('Write something worth reopening tomorrow.')
  await editor.fill('Persistent note from Playwright')
  await expect(page.getByText('All changes saved')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: /Open launcher/i }).click()
  await page.locator('.launcher-panel').getByRole('button', { name: /Notes/i }).click()
  await expect(page.getByPlaceholder('Write something worth reopening tomorrow.').first()).toHaveValue(
    'Persistent note from Playwright',
  )
})
