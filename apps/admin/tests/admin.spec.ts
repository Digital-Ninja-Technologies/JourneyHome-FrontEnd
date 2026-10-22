import { expect, type Page, test } from "@playwright/test";

const DEMO_ADMIN = {
  id: "admin-1",
  email: "admin@journeyhome.test",
  name: "Operations Admin",
  role: "super_admin",
  isSuperAdmin: true,
};

const MOCK_CUSTOMERS = [
  {
    _id: "cust_1",
    name: "Chidi Obi",
    email: "chidi@example.com",
    role: "customer",
    createdAt: new Date().toISOString(),
  },
];

const MOCK_PLANS = [
  {
    _id: "plan_1",
    owner: "cust_1",
    status: "Active",
    currency: "NGN",
    contributionAmountMinor: 500000,
    totalContributedMinor: 1500000,
    startDate: new Date().toISOString(),
    nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    packageSnapshot: {
      name: "Standard",
      monthlyContributionMinor: 500000,
    },
    coveredPerson: {
      fullName: "Adebayo Johnson",
      relationship: "father",
      gender: "male",
      phoneNumber: "+2348012345678",
      address: "12 Marina, Lagos",
    },
    createdAt: new Date().toISOString(),
  },
];

const MOCK_REQUESTS = [
  {
    _id: "req_1",
    owner: "cust_1",
    plan: "plan_1",
    status: "Under_Review",
    dateOfDeath: new Date().toISOString(),
    expectedBurialDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    burialLocation: "Ikoyi Cemetery, Lagos",
    contactPerson: "Chidi Obi",
    contactPhone: "+2348012345678",
    coveredPersonSnapshot: {
      fullName: "Adebayo Johnson",
      relationship: "father",
    },
    createdAt: new Date().toISOString(),
  },
];

async function setAdminSession(page: Page) {
  await page.addInitScript((user) => {
    const session = {
      user,
      token: "demo-admin-token",
    };
    sessionStorage.setItem("jh_admin_session", JSON.stringify(session));
  }, DEMO_ADMIN);
}

async function mockAdminApis(page: Page) {
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: DEMO_ADMIN.id,
          email: DEMO_ADMIN.email,
          name: DEMO_ADMIN.name,
          role: DEMO_ADMIN.role,
          isSuperAdmin: DEMO_ADMIN.isSuperAdmin,
          preferences: {
            newServiceRequest: true,
            paymentFailed: true,
            weeklyDigest: false,
          },
        },
      }),
    });
  });

  await page.route("**/api/v1/auth/admin/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: DEMO_ADMIN,
          token: "demo-admin-token",
        },
      }),
    });
  });

  await page.route("**/api/v1/auth/customers**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_CUSTOMERS }),
    });
  });

  await page.route("**/api/v1/plans**", async (route) => {
    const url = route.request().url();
    if (url.includes("/plans/plan_1")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_PLANS[0] }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_PLANS }),
    });
  });

  await page.route("**/api/v1/service-requests**", async (route) => {
    const url = route.request().url();
    if (url.includes("/service-requests/req_1")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            request: MOCK_REQUESTS[0],
            documents: [],
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: MOCK_REQUESTS }),
    });
  });

  await page.route("**/api/v1/packages**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            _id: "pkg_1",
            name: "Standard",
            monthlyContributionMinor: 500000,
            isActive: true,
          },
        ],
      }),
    });
  });

  await page.route("**/api/v1/auth/admin", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [DEMO_ADMIN],
      }),
    });
  });
}

test.describe("Admin TanStack Router Smoke Tests", () => {
  test("1. Login page loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/login");

    await expect(page.locator("h1")).toContainText("Operations");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    expect(errors).toHaveLength(0);
  });

  test("2. Auth-guard redirects unauthenticated user to /login with redirect param", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login\?redirect=%2F$/);

    await page.goto("/users");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fusers$/);

    await page.goto("/plans");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fplans$/);

    await page.goto("/service-requests");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fservice-requests$/);

    await page.goto("/payments");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fpayments$/);

    await page.goto("/audit-log");
    await expect(page).toHaveURL(/\/login\?redirect=%2Faudit-log$/);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fsettings$/);
  });

  test("3. Guest-guard redirects authenticated user away from /login", async ({
    page,
  }) => {
    await setAdminSession(page);
    await mockAdminApis(page);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/login?redirect=/settings");
    await expect(page).toHaveURL(/\/settings$/);
  });

  test("4. Navigation between key pages works for authenticated staff in AdminShell", async ({
    page,
  }) => {
    await setAdminSession(page);
    await mockAdminApis(page);

    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Operations overview");
    await expect(page.getByRole("complementary")).toBeVisible();

    // Navigate to Users
    await page.getByRole("link", { name: "Users", exact: true }).click();
    await expect(page).toHaveURL(/\/users\/?$/);
    await expect(page.locator("h1")).toContainText("Users");
    await expect(page.getByText("Chidi Obi")).toBeVisible();

    // Navigate to Plans
    await page.getByRole("link", { name: "Plans", exact: true }).click();
    await expect(page).toHaveURL(/\/plans\/?$/);
    await expect(page.locator("h1")).toContainText("Plans");
    await expect(page.getByText("Adebayo Johnson")).toBeVisible();

    // Navigate to Service requests
    await page.getByRole("link", { name: "Service requests", exact: true }).click();
    await expect(page).toHaveURL(/\/service-requests\/?$/);
    await expect(page.locator("h1")).toContainText("Service requests");

    // Navigate to Payments
    await page.getByRole("link", { name: "Payments", exact: true }).click();
    await expect(page).toHaveURL(/\/payments\/?$/);
    await expect(page.locator("h1")).toContainText("Payments");

    // Navigate to Audit log
    await page.getByRole("link", { name: "Audit log", exact: true }).click();
    await expect(page).toHaveURL(/\/audit-log\/?$/);
    await expect(page.locator("h1")).toContainText("Audit log");

    // Navigate to Settings
    await page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(page).toHaveURL(/\/settings\/?$/);
    await expect(page.locator("h1")).toContainText("Settings");
  });

  test("5. Dynamic route loads with param (/users/$id)", async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);

    await page.goto("/users/cust_1");
    await expect(page.locator("h1")).toContainText("Chidi Obi");
    await expect(page.getByText("chidi@example.com")).toBeVisible();
    await expect(page.getByText("Plans (1)")).toBeVisible();
  });

  test("6. Dynamic route loads with param (/plans/$id)", async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);

    await page.goto("/plans/plan_1");
    await expect(page.locator("h1")).toContainText("Adebayo Johnson's plan");
    await expect(page.getByText("Covered person")).toBeVisible();
    await expect(page.getByLabel("Update status")).toBeVisible();
  });

  test("7. Dynamic route loads with param (/service-requests/$id)", async ({
    page,
  }) => {
    await setAdminSession(page);
    await mockAdminApis(page);

    await page.goto("/service-requests/req_1");
    await expect(page.locator("h1")).toContainText("Adebayo Johnson's service");
    await expect(page.getByText("Request details")).toBeVisible();
  });

  test("8. Wildcard / unknown route redirects to /", async ({ page }) => {
    await setAdminSession(page);
    await mockAdminApis(page);

    await page.goto("/some-completely-invalid-admin-path");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("h1")).toContainText("Operations overview");
  });

  test("9. Login submission navigates to redirect target", async ({ page }) => {
    await mockAdminApis(page);

    await page.goto("/login?redirect=/plans");
    await page.fill('input[name="email"]', "admin@journeyhome.test");
    await page.fill('input[name="password"]', "SecretPass123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/plans\/?$/);
  });
});
