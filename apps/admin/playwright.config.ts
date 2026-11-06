import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:5175",
    trace: "on-first-retry",
  },
  // Always a fresh server on its own port, with the in-app mock API forced on.
  // Reusing a dev server would run the tests against whatever .env points at.
  webServer: {
    command: "pnpm exec vite --port 5175 --strictPort",
    env: { VITE_USE_MOCKS: "true" },
    port: 5175,
    reuseExistingServer: false,
    timeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
