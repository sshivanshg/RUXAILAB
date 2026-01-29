import { test, expect } from '@playwright/test'

// Reusable login function
const logIn = async (page, email = 'testemail@gmail.com', password = 'password123') => {
  await page.goto('http://localhost:8080/signin', { waitUntil: 'networkidle' })
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByTestId('sign-in-button').click()
  await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
}

test.describe('User Test Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000)
    page.setDefaultNavigationTimeout(60000)
  })

  test('should create a new user test successfully', async ({ page }) => {
    await logIn(page)

    await test.step('Click create test button', async () => {
      await page.getByTestId('create-test-btn').click()
    })

    await test.step('Select "Create a blank test"', async () => {
      await page.getByText('Create a blank test', { exact: true }).click()
    })

    await test.step('Select User Test type', async () => {
      // Select the usability/user test card
      await page.locator('.card').filter({ hasText: /usability|user test/i }).first().click()
    })

    await test.step('Fill test details', async () => {
      const testName = `E2E Test ${Date.now()}`
      await page.getByLabel('Test Name').fill(testName)
      await page.getByLabel('Test Description').fill('E2E test description for user test')
    })

    await test.step('Create the test', async () => {
      await page.getByRole('dialog').getByRole('button').nth(1).click()
      // Wait for test to be created and redirect
      await expect(page).toHaveURL(/\/edit/, { timeout: 15000 })
    })

    await test.step('Verify test was created', async () => {
      // Should be on edit page
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test('should show validation error when test name is missing', async ({ page }) => {
    await logIn(page)

    await test.step('Navigate to test creation', async () => {
      await page.getByTestId('create-test-btn').click()
      await page.getByText('Create a blank test', { exact: true }).click()
      await page.locator('.card').filter({ hasText: /usability|user test/i }).first().click()
    })

    await test.step('Try to create without name', async () => {
      await page.getByLabel('Test Description').fill('Description without name')
      await page.getByRole('dialog').getByRole('button').nth(1).click()
    })

    await test.step('Verify validation error', async () => {
      await expect(page.getByText('Enter a Title')).toBeVisible({ timeout: 5000 })
    })
  })

  test('should allow creating test with only name', async ({ page }) => {
    await logIn(page)

    await test.step('Create test with only name', async () => {
      await page.getByTestId('create-test-btn').click()
      await page.getByText('Create a blank test', { exact: true }).click()
      await page.locator('.card').filter({ hasText: /usability|user test/i }).first().click()
      
      const testName = `E2E Test Name Only ${Date.now()}`
      await page.getByLabel('Test Name').fill(testName)
      await page.getByRole('dialog').getByRole('button').nth(1).click()
    })

    await test.step('Verify test was created', async () => {
      await expect(page).toHaveURL(/\/edit/, { timeout: 15000 })
    })
  })
})
