import { defineConfig, devices } from "@playwright/test"
import { loadEnvConfig } from "@next/env"

const config = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.test.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "https://localhost/",
    trace: "on-first-retry",
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 443,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
})

export default config

export async function loadEnvironmentConfig(): Promise<void> {
  const projectDir = process.cwd()
  await loadEnvConfig(projectDir)
}
