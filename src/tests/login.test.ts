import { test, expect } from "@playwright/test"

test("Login Test", async ({ page }) => {
  await page.goto("https://localhost/")
  await expect(page.locator("text=Log in")).toContainText("Log in")

  // Click on the login button and wait for a specific load state
  await page.click('text="Log in to QChat"')
  await page.waitForLoadState("networkidle") // wait for network to be idle

  // Check if the "Sign in with Azure Active" button is visible
  await expect(page.locator("text=Sign in with Azure Active").first()).toBeVisible()

  // Click on the "Sign in with Azure Active" button and wait again
  await page.click('text="Sign in with Azure Active"')
  await page.waitForLoadState("networkidle") // Adjust the load state as needed

  // Check for a specific condition that indicates successful login
  // Example: await expect(page.locator('text=Dashboard')).toBeVisible();
})
