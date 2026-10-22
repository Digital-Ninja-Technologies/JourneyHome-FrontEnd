import { expect, type Page, test } from "@playwright/test";

const DEMO_USER = {
	id: "demo-cust-1",
	email: "demo@journeyhome.test",
	name: "Demo Customer",
	role: "customer",
	isSuperAdmin: false,
};

async function setCustomerSession(page: Page) {
	await page.addInitScript((user) => {
		const session = {
			user,
			token: "demo-token",
			remember: true,
		};
		localStorage.setItem("jh_session", JSON.stringify(session));
	}, DEMO_USER);
}

async function mockApis(page: Page) {
	await page.route("**/api/v1/plans**", async (route) => {
		const url = route.request().url();
		if (url.includes("/plans/") && !url.endsWith("/plans")) {
			const planId = url.split("/plans/")[1].split("?")[0];
			const status = planId === "plan_pending_1" ? "Pending" : "Active";
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					data: {
						_id: planId || "plan_demo_1",
						status,
						currency: "NGN",
						contributionAmountMinor: 500000,
						targetAmountMinor: 10000000,
						coveredPerson: {
							fullName: "Adebayo Johnson",
							relationship: "father",
						},
						packageSnapshot: {
							name: "Standard",
							services: ["Photography", "Live Stream"],
						},
						nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
						createdAt: new Date().toISOString(),
					},
				}),
			});
			return;
		}
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				data: [
					{
						_id: "plan_demo_1",
						status: "Active",
						currency: "NGN",
						contributionAmountMinor: 500000,
						targetAmountMinor: 10000000,
						coveredPerson: {
							fullName: "Adebayo Johnson",
							relationship: "father",
						},
						packageSnapshot: {
							name: "Standard",
							services: ["Photography", "Live Stream"],
						},
						nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
						createdAt: new Date().toISOString(),
					},
				],
			}),
		});
	});

	await page.route("**/api/v1/payments**", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				data: [
					{
						_id: "pay_1",
						plan: "plan_demo_1",
						amountMinor: 500000,
						currency: "NGN",
						status: "Successful",
						createdAt: new Date().toISOString(),
						processedAt: new Date().toISOString(),
					},
				],
			}),
		});
	});

	await page.route("**/api/v1/service-requests**", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ data: [] }),
		});
	});

	await page.route("**/api/v1/notifications**", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ data: [] }),
		});
	});
}

test.describe("Dashboard Smoke Tests", () => {
	test("1. Login page loads without console errors", async ({ page }) => {
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") errors.push(msg.text());
		});

		await page.goto("/login");
		await expect(page.locator("h1")).toContainText("Welcome back");
		expect(errors.filter((e) => !e.includes("favicon"))).toEqual([]);
	});

	test("2. Auth-guard redirects unauthenticated user to /login", async ({
		page,
	}) => {
		await page.goto("/app");
		await page.waitForURL(/\/login/);
		expect(page.url()).toContain("/login");
	});

	test("3. Navigation between key pages works for authenticated user", async ({
		page,
	}) => {
		await setCustomerSession(page);
		await mockApis(page);

		await page.goto("/app");
		await page.waitForURL("/app");
		await expect(page.locator("h1")).toBeVisible();

		// Navigate to Plans
		await page.click('nav a[href="/app/plans"]');
		await page.waitForURL("/app/plans");
		await expect(page.locator("h1")).toContainText("My plans");

		// Navigate to Payments
		await page.click('nav a[href="/app/payments"]');
		await page.waitForURL("/app/payments");
		await expect(page.locator("h1")).toContainText("Payments");

		// Navigate to Service Requests
		await page.click('nav a[href="/app/service-requests"]');
		await page.waitForURL("/app/service-requests");
		await expect(page.locator("h1")).toContainText("Service requests");

		// Navigate to Profile
		await page.click('nav a[href="/app/profile"]');
		await page.waitForURL("/app/profile");
		await expect(page.locator("h1")).toContainText("Profile & settings");
	});

	test("4. Dynamic route loads with param (/app/plans/$id)", async ({
		page,
	}) => {
		await setCustomerSession(page);
		await mockApis(page);

		await page.goto("/app/plans/plan_demo_1");
		await page.waitForURL("/app/plans/plan_demo_1");
		await expect(page.locator("h1")).toContainText("Adebayo Johnson");
	});

	test("5. Route with search params preserves and updates them", async ({
		page,
	}) => {
		await setCustomerSession(page);
		await mockApis(page);

		// Profile with card_added=1
		await page.goto("/app/profile?card_added=1");
		await expect(page.getByText("Card added.")).toBeVisible();

		// Dismiss banner updates search params
		await page.getByRole("button", { name: "Dismiss" }).click();
		await expect(page.getByText("Card added.")).not.toBeVisible();
		expect(page.url()).not.toContain("card_added=1");

		// Payments with ?plan=plan_demo_1 filter
		await page.goto("/app/payments?plan=plan_demo_1");
		await expect(page.locator("h1")).toContainText("Payments");
		expect(page.url()).toContain("plan=plan_demo_1");
	});

	test("6. Onboarding step-through works for authenticated user", async ({
		page,
	}) => {
		await setCustomerSession(page);
		await mockApis(page);

		// /signup/verify
		await page.goto("/signup/verify");
		await page.waitForURL("/signup/verify");
		await expect(page.locator("h1")).toContainText("Verify it's you.");

		// /signup/plan
		await page.goto("/signup/plan");
		await page.waitForURL("/signup/plan");
		await expect(page.locator("h1")).toContainText("Set up your first plan.");

		// /signup/payment?plan=plan_pending_1 (stays on payment because status is Pending)
		await page.goto("/signup/payment?plan=plan_pending_1");
		await expect(page.locator("h1")).toContainText("Make your first payment.");

		// /welcome?plan=plan_demo_1
		await page.goto("/welcome?plan=plan_demo_1");
		await expect(page.locator("h1")).toContainText("You’re all set");
	});

	test("7. Paystack callback route handles query params without crashing", async ({
		page,
	}) => {
		await setCustomerSession(page);
		await mockApis(page);

		await page.goto("/app/payments/callback?reference=ref_123&trxref=ref_123");
		await page.waitForURL(
			/\/app\/payments\/callback\?reference=ref_123&trxref=ref_123/,
		);
		// Page will show either verifying or error message for mock ref, but should NOT crash or throw
		await expect(page.locator("main")).toBeVisible();
	});

	test("8. Wildcard / unknown route redirects to /app or /login", async ({
		page,
	}) => {
		// Unauthenticated: unknown route -> redirects to /app -> redirects to /login
		await page.goto("/some-completely-unknown-route");
		await page.waitForURL(/\/login/);
		expect(page.url()).toContain("/login");
	});
});
