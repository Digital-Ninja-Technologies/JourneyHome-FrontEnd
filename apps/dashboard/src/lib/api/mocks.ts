import { ApiError } from "@journeyhome/api-client";
import type { Plan } from "@journeyhome/schemas";

/**
 * Simulated server for endpoints when running locally with VITE_USE_MOCKS=true.
 * State lives in localStorage. Mirrors docs/BACKEND_CONTRACT.md.
 */
export const NOT_MOCKED = Symbol("not-mocked");
export const DEMO_RESET_TOKEN = "demo-token";

export interface Preferences {
  paymentReminders: boolean;
  deficitAlerts: boolean;
  serviceRequestUpdates: boolean;
  productNewsOffers: boolean;
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
  serviceRequestUpdates: true,
  productNewsOffers: false,
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
      const email = String(b.email || "")
        .toLowerCase()
        .trim();
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
    "POST /auth/resend-verification": () => ({
      success: true,
      message: "Verification email resent",
    }),
    "POST /auth/verify-email": () => {
      if (!b.token || b.token === "invalid")
        throw bad("This verification link is invalid or has expired.");
      return { success: true, message: "Email verified successfully" };
    },
    "POST /auth/forgot-password": () => ({ sent: true }),
    "POST /auth/reset-password": () => {
      if (b.token !== DEMO_RESET_TOKEN)
        throw bad("This reset link is invalid or has expired.");
      const pwd = b.newPassword || b.password;
      if (!pwd || pwd.length < 6)
        throw bad("Password must be at least 6 characters.");
      return { reset: true, success: true };
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
    "PATCH /auth/change-password": () => {
      if (b.currentPassword === "wrong")
        throw bad("Your current password is incorrect.");
      if (!b.newPassword || b.newPassword.length < 6)
        throw bad("New password must be at least 6 characters.");
      return { changed: true, success: true };
    },
    "PATCH /auth/me/password": () => {
      if (b.currentPassword === "wrong")
        throw bad("Your current password is incorrect.");
      if (!b.newPassword || b.newPassword.length < 6)
        throw bad("New password must be at least 6 characters.");
      return { changed: true };
    },
    "PATCH /auth/notification-preferences": () => {
      const u = sessionUser();
      const next = { ...read(`jh_mock:prefs:${u.id}`, {}), ...b };
      write(`jh_mock:prefs:${u.id}`, next);
      return { ...DEFAULT_PREFS, ...next };
    },
    "PATCH /auth/me/preferences": () => {
      const u = sessionUser();
      const next = { ...read(`jh_mock:prefs:${u.id}`, {}), ...b };
      write(`jh_mock:prefs:${u.id}`, next);
      return { ...DEFAULT_PREFS, ...next };
    },
    "DELETE /auth/me": () => {
      if (!b.password) throw bad("Current password is required.");
      return { success: true, closed: true };
    },
    "GET /packages": () => [
      {
        _id: "pkg_standard",
        name: "Standard",
        description: "Photography + videography",
        features: ["Full-day photography & video", "Digital gallery"],
        amount: 500000,
        currency: "NGN",
        billingInterval: "monthly",
        isActive: true,
      },
      {
        _id: "pkg_premium",
        name: "Premium",
        description: "Full production",
        features: ["Everything in Standard", "Second videographer"],
        amount: 1000000,
        currency: "NGN",
        billingInterval: "monthly",
        isActive: true,
      },
    ],
    "GET /plans": () => {
      const defaultPlan: Plan = {
        _id: "plan_demo_1",
        owner: "demo-cust-1",
        package: "pkg_tier_1",
        packageDetails: {
          packageId: "pkg_tier_1",
          name: "Standard",
          description: "Standard package",
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
          phoneNumber: "08012345678",
        },
        amount: 500000,
        currency: "NGN",
        billingInterval: "monthly",
        startDate: new Date().toISOString(),
        totalContributedAmount: 1500000,
        status: "Active",
        coverageStatus: "Active",
        nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const plans = read<Plan[]>("jh_mock:plans", [defaultPlan]);
      return {
        items: plans,
        pagination: {
          page: 1,
          limit: 20,
          total: plans.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    },
    "POST /plans": () => {
      const newPlan: Plan = {
        _id: `plan_${Date.now()}`,
        owner: "demo-cust-1",
        package: b.packageId || "pkg_tier_1",
        packageDetails: {
          packageId: b.packageId || "pkg_tier_1",
          name: "Standard",
          description: "Standard package",
          features: ["Photography", "Live Stream"],
          amount: 500000,
          currency: "NGN",
        },
        coveredPerson: {
          fullName:
            b.coveredPerson?.fullName ||
            b["coveredPerson.fullName"] ||
            "Beneficiary",
          dateOfBirth:
            b.coveredPerson?.dateOfBirth ||
            b["coveredPerson.dateOfBirth"] ||
            "1960-01-01",
          gender:
            b.coveredPerson?.gender || b["coveredPerson.gender"] || "male",
          relationship:
            b.coveredPerson?.relationship ||
            b["coveredPerson.relationship"] ||
            "parent",
          address:
            b.coveredPerson?.address ||
            b["coveredPerson.address"] ||
            "Lagos, Nigeria",
          phoneNumber:
            b.coveredPerson?.phoneNumber ||
            b["coveredPerson.phoneNumber"] ||
            "08012345678",
        },
        amount: 500000,
        currency: "NGN",
        billingInterval: "monthly",
        startDate: new Date().toISOString(),
        totalContributedAmount: 0,
        status: "Pending",
        coverageStatus: "Pending",
        nextPaymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const defaultPlan: Plan = {
        _id: "plan_demo_1",
        owner: "demo-cust-1",
        package: "pkg_tier_1",
        packageDetails: {
          packageId: "pkg_tier_1",
          name: "Standard",
          description: "Standard package",
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
          phoneNumber: "08012345678",
        },
        amount: 500000,
        currency: "NGN",
        billingInterval: "monthly",
        startDate: new Date().toISOString(),
        totalContributedAmount: 1500000,
        status: "Active",
        coverageStatus: "Active",
        nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const current = read<Plan[]>("jh_mock:plans", [defaultPlan]);
      write("jh_mock:plans", [newPlan, ...current]);
      return newPlan;
    },
    "GET /plans/dashboard": () => {
      const plans = read<Plan[]>("jh_mock:plans", []);
      const active = plans.filter((p) => p.status === "Active");
      const totalContributed = plans.reduce(
        (sum, p) => sum + (p.totalContributedAmount ?? p.amount ?? 0),
        0,
      );
      return {
        totalContributed,
        paymentCount: 1,
        activePlans: active.length,
        nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      };
    },
    "GET /subscriptions": () => ({
      items: [
        {
          _id: "sub_demo_1",
          plan: "plan_demo_1",
          status: "active",
          nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
    "GET /payments": () => ({
      items: [
        {
          _id: "pay_1",
          owner: "demo-cust-1",
          plan: "plan_demo_1",
          amount: 500000,
          currency: "NGN",
          reference: "jh_init_demo_1",
          providerReference: "jh_init_demo_1",
          provider: "paystack",
          purpose: "recurring_contribution",
          status: "Successful",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
    "POST /payments/initialize": () => ({
      paymentId: `pay_${Date.now()}`,
      reference: `ref_demo_${Date.now()}`,
      authorizationUrl: `${window.location.origin}/app/payments/callback?reference=ref_demo_${Date.now()}&trxref=ref_demo_${Date.now()}`,
      accessCode: "access_code_mock",
    }),
    "GET /service-requests": () => [],
    "POST /service-requests": () => ({
      _id: `req_${Date.now()}`,
      owner: "demo-cust-1",
      plan: "plan_demo_1",
      status: "Submitted",
      dateOfDeath: new Date().toISOString(),
      serviceLocation: "Ikoyi Cemetery, Lagos",
      expectedServiceDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      contactPerson: "Demo Customer",
      contactPhone: "+2348012345678",
      coveredPersonSnapshot: {
        fullName: "Adebayo Johnson",
        dateOfBirth: "1960-01-01",
        gender: "male",
        relationship: "father",
        address: "12 Marina, Lagos",
        phoneNumber: "+2348012345678",
      },
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    "GET /notifications": () => ({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      counts: {
        totalNotifications: 0,
        totalUnreadNotifications: 0,
      },
    }),
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
        owner: "demo-cust-1",
        package: "pkg_tier_1",
        packageDetails: {
          packageId: "pkg_tier_1",
          name: "Standard",
          description: "Standard package",
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
          phoneNumber: "08012345678",
        },
        amount: 500000,
        currency: "NGN",
        billingInterval: "monthly",
        startDate: new Date().toISOString(),
        totalContributedAmount: 1500000,
        status: planId === "plan_pending_1" ? "Pending" : "Active",
        coverageStatus: "Active",
        nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    };
  }

  const reqMatch = /^GET \/service-requests\/(.+)$/.exec(route);
  if (!handler && reqMatch) {
    handler = () => ({
      request: {
        _id: reqMatch[1],
        owner: "demo-cust-1",
        plan: "plan_demo_1",
        status: "Submitted",
        dateOfDeath: new Date().toISOString(),
        serviceLocation: "Ikoyi Cemetery, Lagos",
        expectedServiceDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        contactPerson: "Demo Customer",
        contactPhone: "+2348012345678",
        coveredPersonSnapshot: {
          fullName: "Adebayo Johnson",
          dateOfBirth: "1960-01-01",
          gender: "male",
          relationship: "father",
          address: "12 Marina, Lagos",
          phoneNumber: "+2348012345678",
        },
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      documents: [],
    });
  }

  const initPaymentMatch =
    /^POST \/payments\/plans\/(.+)\/initialize-initial$/.exec(route);
  if (!handler && initPaymentMatch) {
    handler = () => ({
      paymentId: `pay_${Date.now()}`,
      reference: `ref_demo_${Date.now()}`,
      authorizationUrl: `${window.location.origin}/app/payments/callback?reference=ref_demo_${Date.now()}&trxref=ref_demo_${Date.now()}`,
      accessCode: "access_code_mock",
    });
  }

  const subMatch = /^GET \/subscriptions\/(.+)$/.exec(route);
  if (!handler && subMatch) {
    handler = () => ({
      _id: subMatch[1],
      plan: "plan_demo_1",
      status: "active",
      amount: 500000,
      currency: "NGN",
      nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      createdAt: new Date().toISOString(),
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
