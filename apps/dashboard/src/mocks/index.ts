import { ApiError } from "@journeyhome/api-client";
import type { Plan } from "../lib/types";

/**
 * Simulated server for endpoints when running locally with VITE_USE_MOCKS=true.
 * State lives in localStorage. Mirrors docs/BACKEND_CONTRACT.md.
 */
export const NOT_MOCKED = Symbol("not-mocked");
export const DEMO_CODE = "123456";
export const DEMO_RESET_TOKEN = "demo-token";

export interface Preferences {
  paymentReminders: boolean;
  deficitAlerts: boolean;
  serviceUpdates: boolean;
  productNews: boolean;
}
export interface Card {
  _id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const DEFAULT_PREFS: Preferences = {
  paymentReminders: true,
  deficitAlerts: true,
  serviceUpdates: true,
  productNews: false,
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function sessionUser(): { id: string; name: string; email: string } {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem("jh_session");
      if (raw) return JSON.parse(raw).user;
    } catch {
      /* ignore */
    }
  }
  throw new ApiError("Please log in again.", 401);
}

const bad = (message: string) => new ApiError(message, 400);

export async function mockRequest(
  method: string,
  path: string,
  body: unknown,
): Promise<unknown | typeof NOT_MOCKED> {
  const b = (body ?? {}) as Record<string, any>;
  const route = `${method} ${path.split("?")[0]}`;
  const handlers: Record<string, () => unknown> = {
    "POST /auth/login": () => {
      const email = String(b.email || "").toLowerCase().trim();
      const password = String(b.password || "");
      if (
        email === "demo@journeyhome.ng" ||
        email === "demo@journeyhome.test" ||
        password === "Password123!"
      ) {
        return {
          user: {
            id: "demo-cust-1",
            email: email || "demo@journeyhome.ng",
            name: "Demo Customer",
            role: "customer",
            isSuperAdmin: false,
          },
          token: "mock-jwt-token-customer",
        };
      }
      throw new ApiError("Invalid email or password.", 401);
    },
    "POST /auth/signup": () => {
      const email = String(b.email || "").trim();
      const name = String(b.name || "Customer").trim();
      return {
        user: {
          id: `cust_demo_${Date.now()}`,
          email,
          name,
          role: "customer",
          isSuperAdmin: false,
        },
        token: "mock-jwt-token-customer",
      };
    },
    "POST /auth/verification/send": () => ({ sent: true }),
    "POST /auth/verification/confirm": () => {
      if (b.code !== DEMO_CODE)
        throw bad("That code is incorrect or has expired.");
      return { verified: true };
    },
    "POST /auth/forgot-password": () => ({ sent: true }),
    "POST /auth/reset-password": () => {
      if (b.token !== DEMO_RESET_TOKEN)
        throw bad("This reset link is invalid or has expired.");
      if (!b.password || b.password.length < 6)
        throw bad("Password must be at least 6 characters.");
      return { reset: true };
    },
    "GET /auth/me": () => {
      const u = sessionUser();
      const since = read<string>(
        `jh_mock:since:${u.id}`,
        new Date().toISOString(),
      );
      write(`jh_mock:since:${u.id}`, since);
      return {
        ...u,
        ...read(`jh_mock:profile:${u.id}`, {}),
        createdAt: since,
        preferences: { ...DEFAULT_PREFS, ...read(`jh_mock:prefs:${u.id}`, {}) },
      };
    },
    "PATCH /auth/me": () => {
      const u = sessionUser();
      if (b.name !== undefined && b.name.trim().length < 2)
        throw bad("Please enter your full name.");
      write(`jh_mock:profile:${u.id}`, {
        ...read(`jh_mock:profile:${u.id}`, {}),
        ...b,
      });
      return { ...u, ...read(`jh_mock:profile:${u.id}`, {}) };
    },
    "PATCH /auth/me/password": () => {
      if (b.currentPassword === "wrong")
        throw bad("Your current password is incorrect.");
      if (!b.newPassword || b.newPassword.length < 6)
        throw bad("New password must be at least 6 characters.");
      return { changed: true };
    },
    "PATCH /auth/me/preferences": () => {
      const u = sessionUser();
      const next = { ...read(`jh_mock:prefs:${u.id}`, {}), ...b };
      write(`jh_mock:prefs:${u.id}`, next);
      return { ...DEFAULT_PREFS, ...next };
    },
    "DELETE /auth/me": () => ({ closed: true }),
    "GET /packages": () => [
      {
        _id: "pkg_standard",
        name: "Standard",
        monthlyContributionMinor: 500000,
        currency: "NGN",
        photographyIncluded: true,
        videographyIncluded: true,
      },
      {
        _id: "pkg_premium",
        name: "Premium",
        monthlyContributionMinor: 1000000,
        currency: "NGN",
        photographyIncluded: true,
        videographyIncluded: true,
      },
    ],
    "GET /plans": () => {
      return read<Plan[]>("jh_mock:plans", [
        {
          _id: "plan_demo_1",
          status: "Active",
          currency: "NGN",
          contributionAmountMinor: 500000,
          targetAmountMinor: 10000000,
          totalContributedMinor: 1500000,
          startDate: new Date().toISOString(),
          coveredPerson: {
            fullName: "Adebayo Johnson",
            relationship: "father",
            address: "12 Marina, Lagos",
          },
          packageSnapshot: {
            name: "Standard",
          },
          nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    "POST /plans": () => {
      const newPlan = {
        _id: `plan_${Date.now()}`,
        status: "Pending",
        currency: "NGN",
        contributionAmountMinor: Number(b.contributionAmountMinor) || 500000,
        targetAmountMinor: 10000000,
        totalContributedMinor: 0,
        startDate: new Date().toISOString(),
        coveredPerson: {
          fullName: b.coveredPerson?.fullName || b["coveredPerson.fullName"] || "Beneficiary",
          relationship: b.coveredPerson?.relationship || b["coveredPerson.relationship"] || "parent",
          address: b.coveredPerson?.address || b["coveredPerson.address"] || "Lagos, Nigeria",
        },
        packageSnapshot: {
          name: b.packageName || "Standard",
        },
        nextPaymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      const current = read<any[]>("jh_mock:plans", []);
      write("jh_mock:plans", [newPlan, ...current]);
      return newPlan;
    },
    "GET /payments": () => [
      {
        _id: "pay_1",
        plan: "plan_demo_1",
        amountMinor: 500000,
        currency: "NGN",
        purpose: "recurring_contribution",
        status: "Successful",
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      },
    ],
    "POST /payments/initialize": () => ({
      authorizationUrl: `${window.location.origin}/app/payments/callback?reference=ref_demo_${Date.now()}&trxref=ref_demo_${Date.now()}`,
      reference: `ref_demo_${Date.now()}`,
    }),
    "GET /payments/methods": () => {
      const u = sessionUser();
      return read<Card[]>(`jh_mock:cards:${u.id}`, [
        {
          _id: "card_demo_1",
          brand: "Visa",
          last4: "4821",
          expMonth: 9,
          expYear: 2029,
          isDefault: true,
        },
      ]);
    },
    "POST /payments/methods/initialize": () => {
      const u = sessionUser();
      const cards = read<Card[]>(`jh_mock:cards:${u.id}`, []);
      write(`jh_mock:cards:${u.id}`, [
        ...cards,
        {
          _id: `card_demo_${Date.now()}`,
          brand: "Mastercard",
          last4: "1234",
          expMonth: 12,
          expYear: 2030,
          isDefault: cards.length === 0,
        },
      ]);
      return {
        authorizationUrl: `${window.location.origin}/app/profile?card_added=1`,
      };
    },
    "GET /service-requests": () => [],
    "POST /service-requests": () => ({
      _id: `req_${Date.now()}`,
      status: "Submitted",
      createdAt: new Date().toISOString(),
    }),
    "GET /notifications": () => [],
  };

  let handler = handlers[route];

  // Match dynamic routes
  const planMatch = /^GET \/plans\/(.+)$/.exec(route);
  if (!handler && planMatch) {
    handler = () => {
      const planId = planMatch[1];
      const plans = read<Plan[]>("jh_mock:plans", []);
      const found = plans.find((p) => p._id === planId);
      if (found) return found;
      return {
        _id: planId || "plan_demo_1",
        status: planId === "plan_pending_1" ? "Pending" : "Active",
        currency: "NGN",
        contributionAmountMinor: 500000,
        targetAmountMinor: 10000000,
        totalContributedMinor: 1500000,
        startDate: new Date().toISOString(),
        coveredPerson: {
          fullName: "Adebayo Johnson",
          relationship: "father",
          address: "12 Marina, Lagos",
        },
        packageSnapshot: {
          name: "Standard",
        },
        nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        createdAt: new Date().toISOString(),
      };
    };
  }

  const reqMatch = /^GET \/service-requests\/(.+)$/.exec(route);
  if (!handler && reqMatch) {
    handler = () => ({
      request: {
        _id: reqMatch[1],
        plan: "plan_demo_1",
        status: "Submitted",
        dateOfDeath: new Date().toISOString(),
        burialLocation: "Ikoyi Cemetery, Lagos",
        expectedBurialDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        contactPerson: "Demo Customer",
        contactPhone: "+2348012345678",
        coveredPersonSnapshot: {
          fullName: "Adebayo Johnson",
          relationship: "father",
          address: "12 Marina, Lagos",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      documents: [],
    });
  }

  const del = /^DELETE \/payments\/methods\/(.+)$/.exec(route);
  if (!handler && del) {
    handler = () => {
      const u = sessionUser();
      const cards = read<Card[]>(`jh_mock:cards:${u.id}`, [
        {
          _id: "card_demo_1",
          brand: "Visa",
          last4: "4821",
          expMonth: 9,
          expYear: 2029,
          isDefault: true,
        },
      ]);
      const left = cards.filter((c) => c._id !== del[1]);
      if (left.length && !left.some((c) => c.isDefault))
        left[0].isDefault = true;
      write(`jh_mock:cards:${u.id}`, left);
      return { removed: true };
    };
  }

  if (!handler) return NOT_MOCKED;
  await sleep(100);
  return handler();
}
