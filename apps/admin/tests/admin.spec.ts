import { expect, type Page, test } from "@playwright/test";

/**
 * Runs against `pnpm dev`, where VITE_USE_MOCKS defaults to on and the in-app
 * mock server (src/lib/api/mocks.ts) answers every request with spec-shaped
 * data. Each test gets a fresh browser context, so the mock DB reseeds.
 */

const ADMIN = {
  id: "admin-1",
  email: "admin@journeyhome.ng",
  name: "Operations Admin",
  role: "super_admin",
  isSuperAdmin: true,
};

async function signIn(page: Page) {
  await page.addInitScript((user) => {
    sessionStorage.setItem(
      "jh_admin_session",
      JSON.stringify({ user, token: "demo-admin-token" }),
    );
  }, ADMIN);
}

const heading = (page: Page) => page.getByRole("heading", { level: 1 });

/** Picks an option from one of the toolbar's "Label: value" filter selects. */
async function chooseFilter(page: Page, label: string, option: string) {
  await page.getByRole("combobox", { name: `Filter by ${label.toLowerCase()}` }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test.describe("auth & guards", () => {
  test("login page renders without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/login");
    await expect(heading(page)).toContainText("Operations");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test("login form validates with zod", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Please enter your work email")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("protected routes redirect to /login with a redirect param", async ({ page }) => {
    for (const path of ["/", "/users", "/plans", "/payments", "/contact", "/settings"]) {
      await page.goto(path);
      await expect(page).toHaveURL(
        new RegExp(`/login\\?redirect=${encodeURIComponent(path)}$`),
      );
    }
  });

  test("a failed sign-in shows a toast, not stale inline text", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "nobody@example.com");
    await page.fill('input[name="password"]', "wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText("Sign in failed")).toBeVisible();
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("signing in follows the redirect", async ({ page }) => {
    await page.goto("/login?redirect=/plans");
    await page.fill('input[name="email"]', "admin@journeyhome.test");
    await page.fill('input[name="password"]', "Admin123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/plans\/?$/);
  });

  test("an off-site redirect is ignored", async ({ page }) => {
    await page.goto("/login?redirect=https://evil.example");
    await expect(heading(page)).toContainText("Operations");
    await page.fill('input[name="email"]', "admin@journeyhome.test");
    await page.fill('input[name="password"]', "Admin123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
  });

  test("signed-in admins are bounced away from /login", async ({ page }) => {
    await signIn(page);
    await page.goto("/login?redirect=/settings");
    await expect(page).toHaveURL(/\/settings$/);
  });
});

test.describe("navigation", () => {
  test("every sidebar link opens its view", async ({ page }) => {
    await signIn(page);
    await page.goto("/");
    await expect(heading(page)).toContainText(/Good (morning|afternoon|evening)/);

    const pages: [link: string, title: RegExp][] = [
      ["Users", /Users/],
      ["Plans", /Plans/],
      ["Service requests", /Service requests/],
      ["Payments", /Payments/],
      ["Contact messages", /Contact messages/],
      ["Audit log", /Audit log/],
      ["Settings", /Settings/],
    ];
    for (const [link, title] of pages) {
      await page.getByRole("link", { name: link, exact: true }).click();
      await expect(heading(page)).toContainText(title);
    }
  });

  test("unknown routes go home", async ({ page }) => {
    await signIn(page);
    await page.goto("/not-a-real-page");
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);
  });
});

test.describe("server-paginated tables", () => {
  test("paging lives in the URL and survives a reload", async ({ page }) => {
    await signIn(page);
    await page.goto("/payments");
    await expect(page.getByText(/Showing\s*1–20\s*of\s*48\s*payments/)).toBeVisible();

    await page.getByRole("button", { name: "Go to next page" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText(/Showing\s*21–40\s*of\s*48/)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/Showing\s*21–40\s*of\s*48/)).toBeVisible();
  });

  test("a bad page param falls back to page 1", async ({ page }) => {
    await signIn(page);
    await page.goto("/payments?page=abc&limit=7");
    await expect(page.getByText(/Showing\s*1–20\s*of\s*48/)).toBeVisible();
  });

  test("filters update the URL and reset to page 1", async ({ page }) => {
    await signIn(page);
    await page.goto("/plans?page=1");
    await chooseFilter(page, "Status", "Active");
    await expect(page).toHaveURL(/status=Active/);
    await expect(page.getByText(/of\s*3\s*plans/)).toBeVisible();
    await expect(page.getByText("Emeka Okafor")).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page).not.toHaveURL(/status=/);
  });

  test("search is debounced into the URL", async ({ page }) => {
    await signIn(page);
    await page.goto("/users");
    await page.getByRole("searchbox", { name: "Search name or email" }).fill("grace");
    await expect(page).toHaveURL(/search=grace/);
    await expect(page.getByText(/of\s*1\s*user$/)).toBeVisible();
  });
});

test.describe("details & mutations", () => {
  test("user detail lists their plans and requests", async ({ page }) => {
    await signIn(page);
    await page.goto("/users/cust_1");
    await expect(heading(page)).toContainText("Chidi Okafor");
    await expect(page.getByText("chidi@example.com").first()).toBeVisible();
    await expect(page.getByText("Plans (2)")).toBeVisible();
  });

  test("plan status changes through the status form", async ({ page }) => {
    await signIn(page);
    await page.goto("/plans/plan_1");
    await expect(heading(page)).toContainText("Emeka Okafor's");

    await page.getByRole("combobox", { name: "Move to" }).click();
    await page.getByRole("option", { name: "Paused", exact: true }).click();
    await page.getByRole("button", { name: "Save status" }).click();
    await expect(page.getByText("Plan updated")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).locator("..")).toContainText(
      "Paused",
    );
  });

  test("rejecting a request needs a message to the customer", async ({ page }) => {
    await signIn(page);
    await page.goto("/service-requests/req_2");
    await expect(heading(page)).toContainText("Adaeze Nwosu's");

    await page.getByRole("button", { name: "Reject" }).click();
    await expect(page.getByText(/Tell the customer why/)).toBeVisible();

    await page.getByLabel("Message to the customer").fill("The plan is not eligible.");
    await page.getByRole("button", { name: "Reject" }).click();
    await expect(page.getByText("Request updated")).toBeVisible();
    await expect(page.getByText("Reason given: The plan is not eligible.")).toBeVisible();
  });

  test("approve, then assign a photographer to close", async ({ page }) => {
    await signIn(page);
    await page.goto("/service-requests/req_4");
    await page.getByRole("button", { name: "Approve request" }).click();
    await expect(page.getByRole("button", { name: "Assign photographer" })).toBeVisible();

    await page.getByRole("button", { name: "Assign photographer" }).click();
    await page.getByRole("button", { name: "Assign and close" }).click();
    await expect(page.getByText("Enter the photographer's full name")).toBeVisible();

    await page.getByLabel("Photographer's full name").fill("Femi Bello");
    await page.getByRole("button", { name: "Assign and close" }).click();
    await expect(page.getByText("Photographer assigned").first()).toBeVisible();
  });

  test("contact message opens in a linkable sheet", async ({ page }) => {
    await signIn(page);
    await page.goto("/contact");
    await page.getByText("Adebayo Okafor").click();
    await expect(page).toHaveURL(/message=msg_1/);
    await expect(page.getByRole("link", { name: "Reply by email" })).toBeVisible();
  });
});
