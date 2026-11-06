import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	timeout: 30000,
	fullyParallel: false,
	workers: 1,
	use: {
		baseURL: "http://localhost:5176",
		trace: "on-first-retry",
	},
	// Always a fresh server on its own port. These tests stub the network with
	// page.route, so the in-app mock API must be off; reusing a dev server would
	// run them against whatever .env points at.
	webServer: {
		command: "pnpm exec vite --port 5176 --strictPort",
		env: { VITE_USE_MOCKS: "false" },
		port: 5176,
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
