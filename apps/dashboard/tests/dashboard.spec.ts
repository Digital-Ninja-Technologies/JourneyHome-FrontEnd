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

async function mockApis(page: Page, opts: { hasPlans?: boolean } = {}) {
	const hasPlans = opts.hasPlans ?? true;
	// The /app route guard validates the stored session via GET /auth/me.
	await page.route("**/api/v1/auth/me", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				success: true,
				message: "ok",
				data: {
					...DEMO_USER,
					isEmailVerified: true,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					notificationPreferences: {
						paymentReminders: true,
						deficitAlerts: true,
						serviceRequestUpdates: true,
						productNewsOffers: false,
					},
				},
			}),
		});
	});

	const makePlan = (id: string, status: string) => ({
		_id: id,
		owner: DEMO_USER.id,
		package: "pkg_standard",
		packageDetails: {
			packageId: "pkg_standard",
			name: "Standard",
			description: "",
			features: ["Photography", "Live Stream"],
			amount: 500000,
			currency: "NGN",
		},
		coveredPerson: {
			fullName: "Adebayo Johnson",
			dateOfBirth: "1960-01-01",
			gender: "male",
			relationship: "father",
			address: "12 Marina, Lagos",
			phoneNumber: "+2348012345678",
		},
		amount: 500000,
		currency: "NGN",
		billingInterval: "monthly",
		startDate: new Date().toISOString(),
		totalContributedAmount: 0,
		status,
		coverageStatus: status,
		nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	});
	const ok = (data: unknown) => ({
		status: 200,
		contentType: "application/json",
		body: JSON.stringify({ success: true, message: "ok", data }),
	});

	await page.route("**/api/v1/packages**", (route) =>
		route.fulfill(
			ok([
				{
					_id: "pkg_standard",
					name: "Standard",
					description: "",
					features: [],
					amount: 500000,
					currency: "NGN",
					billingInterval: "monthly",
					isActive: true,
				},
				{
					_id: "pkg_premium",
					name: "Premium",
					description: "",
					features: [],
					amount: 1500000,
					currency: "NGN",
					billingInterval: "monthly",
					isActive: true,
				},
			]),
		),
	);

	await page.route("**/api/v1/plans**", async (route) => {
		const url = route.request().url();
		if (url.includes("/plans/") && !url.endsWith("/plans")) {
			const planId = url.split("/plans/")[1].split("?")[0];
			const status = planId === "plan_pending_1" ? "Pending" : "Active";
			await route.fulfill(ok(makePlan(planId || "plan_demo_1", status)));
			return;
		}
		await route.fulfill(
			ok({
				items: hasPlans ? [makePlan("plan_demo_1", "Active")] : [],
				pagination: {
					page: 1,
					limit: 20,
					total: hasPlans ? 1 : 0,
					totalPages: hasPlans ? 1 : 0,
					hasNextPage: false,
					hasPreviousPage: false,
				},
			}),
		);
	});

	const pagination = (total: number) => ({
		page: 1,
		limit: 20,
		total,
		totalPages: total ? 1 : 0,
		hasNextPage: false,
		hasPreviousPage: false,
	});

	await page.route("**/api/v1/payments**", (route) =>
		route.fulfill(
			ok({
				items: [
					{
						_id: "pay_1",
						owner: "demo-cust-1",
						plan: "plan_demo_1",
						amount: 500000,
						currency: "NGN",
						reference: "jh_init_demo_1",
						provider: "paystack",
						purpose: "recurring_contribution",
						status: "Successful",
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						processedAt: new Date().toISOString(),
					},
				],
				pagination: pagination(1),
			}),
		),
	);

	await page.route("**/api/v1/service-requests**", (route) =>
		route.fulfill(ok([])),
	);

	await page.route("**/api/v1/notifications**", (route) =>
		route.fulfill(
			ok({
				items: [],
				pagination: pagination(0),
				counts: { totalNotifications: 0, totalUnreadNotifications: 0 },
			}),
		),
	);
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
		await page.click('a[href="/app/plans"]');
		await page.waitForURL("/app/plans");
		await expect(page.locator("h1")).toContainText("My plans");

		// Navigate to Payments
		await page.click('a[href="/app/payments"]');
		await page.waitForURL("/app/payments");
		await expect(page.locator("h1")).toContainText("Payments");

		// Navigate to Service Requests
		await page.click('a[href="/app/service-requests"]');
		await page.waitForURL("/app/service-requests");
		await expect(page.locator("h1")).toContainText("Service requests");

		// Navigate to Profile
		await page.click('a[href="/app/profile"]');
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

	test("5. Route with search params preserves them", async ({
		page,
	}) => {
		await setCustomerSession(page);
		await mockApis(page);

		// Payments with ?plan=plan_demo_1 filter
		await page.goto("/app/payments?plan=plan_demo_1");
		await expect(page.locator("h1")).toContainText("Payments");
		expect(page.url()).toContain("plan=plan_demo_1");
	});

	test("6. Onboarding step-through works for authenticated user", async ({
		page,
	}) => {
		await setCustomerSession(page);
		// Onboarding is only shown to accounts with no plans yet.
		await mockApis(page, { hasPlans: false });

		// /signup/plan, with the package picked on the marketing site preselected
		await page.goto("/signup/plan?package=pkg_premium");
		await page.waitForURL("/signup/plan?package=pkg_premium");
		await expect(page.locator("h1")).toContainText("Set up your first plan.");
		await expect(page.getByRole("radio", { name: /Premium/ })).toBeChecked();

		// /signup/payment?plan=plan_pending_1 (stays on payment because status is Pending)
		await page.goto("/signup/payment?plan=plan_pending_1");
		await expect(page.locator("h1")).toContainText("Make your first payment.");

		// /welcome?plan=plan_demo_1
		await page.goto("/welcome?plan=plan_demo_1");
		await expect(page.locator("h1")).toContainText("You’re all set");
	});

	test("6b. Customers with plans skip onboarding and get the new-plan dialog", async ({
		page,
	}) => {
		await setCustomerSession(page);
		await mockApis(page, { hasPlans: true });

		// e.g. an existing customer clicking a package on the marketing site
		await page.goto("/signup?package=pkg_premium");
		await page.waitForURL(/\/app\/plans\?/);
		expect(page.url()).toContain("pkg_premium");
		await expect(page.getByRole("dialog")).toContainText("Start a new plan");
		await expect(page.getByRole("radio", { name: /Premium/ })).toBeChecked();

		// Without a package (e.g. after the verify-email "log in" link)
		await page.goto("/signup/plan");
		await page.waitForURL(/\/app\/plans\?/);
		await expect(page.getByRole("dialog")).toContainText("Start a new plan");
		await expect(page.locator("h1")).not.toContainText("Set up your first plan");
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
		await expect(page.locator("main").last()).toBeVisible();
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
