import { ApiError } from "@journeyhome/api-client";

/**
 * Simulated server for admin endpoints when running with VITE_USE_MOCKS=true.
 * State lives in sessionStorage / localStorage. Mirrors docs/BACKEND_CONTRACT.md.
 */
export const NOT_MOCKED = Symbol("not-mocked");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface AdminPrefs {
  newServiceRequest: boolean;
  paymentFailed: boolean;
  weeklyDigest: boolean;
}
const DEFAULT_PREFS: AdminPrefs = {
  newServiceRequest: true,
  paymentFailed: true,
  weeklyDigest: false,
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function sessionUser(): { id: string; name: string; email: string; role: string; isSuperAdmin: boolean } {
  try {
    const raw = sessionStorage.getItem("jh_admin_session");
    if (raw) return JSON.parse(raw).user;
  } catch {
    /* ignore */
  }
  throw new ApiError("Please sign in again.", 401);
}

const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, (n * 7) % 60, 0, 0);
  return d.toISOString();
};

const PEOPLE: [owner: string, plan: string][] = [
  ["Chidi Okafor", "Emeka's plan"],
  ["Chidi Okafor", "Ngozi's plan"],
  ["Grace Adebayo", "Adaeze's plan"],
  ["Musa Lawal", "Musa's plan"],
  ["Bisi Oyelaran", "Tola's plan"],
  ["Funke Adeyemi", "Funke's plan"],
];

function demoPayments() {
  const statuses = [
    "Successful",
    "Successful",
    "Successful",
    "Pending",
    "Failed",
    "Successful",
    "Refunded",
    "Processing",
  ];
  return Array.from({ length: 34 }, (_, i) => {
    const [ownerName, planName] = PEOPLE[i % PEOPLE.length];
    const status = statuses[i % statuses.length];
    const created = daysAgo(Math.floor(i * 1.7));
    return {
      _id: `pay_${i}`,
      owner: `u_demo_${i % PEOPLE.length}`,
      plan: `p_demo_${i % PEOPLE.length}`,
      ownerName,
      planName,
      reference: `jh_${i % 9 === 0 ? "init" : "rec"}_${(82300 - i * 37).toString()}`,
      amountMinor: [1000000, 500000, 1800000, 1000000][i % 4],
      currency: "NGN",
      purpose: i % 9 === 0 ? "initial_contribution" : "recurring_contribution",
      status,
      createdAt: created,
      processedAt:
        status === "Successful" || status === "Refunded" ? created : undefined,
    };
  });
}

function demoAudit() {
  const rows: [string, string, string, string, number][] = [
    [
      "Ops Admin",
      "service_request.docs_verified",
      "ServiceRequest",
      "Adaeze Nwosu's service request",
      1,
    ],
    [
      "Ops Admin",
      "service_request.viewed_by_admin",
      "ServiceRequest",
      "Adaeze Nwosu's service request",
      1,
    ],
    [
      "Ops Admin",
      "service_request.approved",
      "ServiceRequest",
      "Musa Lawal's service request",
      7,
    ],
    [
      "Grace Adebayo",
      "service_request.created",
      "ServiceRequest",
      "Adaeze Nwosu's service request",
      10,
    ],
    [
      "Ops Admin",
      "service_request.more_info_required",
      "ServiceRequest",
      "Grace Adebayo's service request",
      12,
    ],
    [
      "Finance Admin",
      "service_request.viewed_by_admin",
      "ServiceRequest",
      "Grace Adebayo's service request",
      12,
    ],
    [
      "Ops Admin",
      "service_request.rejected",
      "ServiceRequest",
      "Obi Eze's service request",
      30,
    ],
    [
      "Musa Lawal",
      "service_request.created",
      "ServiceRequest",
      "Musa Lawal's service request",
      31,
    ],
    [
      "Ops Admin",
      "service_request.docs_verified",
      "ServiceRequest",
      "Musa Lawal's service request",
      29,
    ],
    [
      "Chidi Okafor",
      "service_request.created",
      "ServiceRequest",
      "Emeka Okafor's service request",
      45,
    ],
  ];
  return rows.map(([actorName, action, resourceType, resourceLabel, d], i) => ({
    _id: `aud_${i}`,
    actor: `actor_${actorName}`,
    actorName,
    action,
    resourceType,
    resourceId: `res_${i}`,
    resourceLabel,
    createdAt: daysAgo(d, 8 + (i % 9)),
  }));
}

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

export async function mockRequest(
  method: string,
  path: string,
  body: unknown,
): Promise<unknown | typeof NOT_MOCKED> {
  const b = (body ?? {}) as Record<string, any>;
  const route = `${method} ${path.split("?")[0]}`;
  const handlers: Record<string, () => unknown> = {
    "POST /auth/admin/login": () => {
      const email = String(b.email || "").toLowerCase().trim();
      const password = String(b.password || "");

      // Accept admin demo or staff demo
      if (
        email === "admin@journeyhome.ng" ||
        email === "admin@journeyhome.test" ||
        password === "Admin123!" ||
        password === "SecretPass123" ||
        email.endsWith("@journeyhome.test")
      ) {
        const isSuper = !email.startsWith("staff");
        return {
          user: {
            id: isSuper ? "admin-1" : "admin-2",
            email: email || "admin@journeyhome.ng",
            name: isSuper ? "Operations Admin" : "Staff Admin",
            role: isSuper ? "super_admin" : "admin",
            isSuperAdmin: isSuper,
          },
          token: "demo-admin-token",
        };
      }

      if (email === "staff@journeyhome.ng") {
        return {
          user: {
            id: "admin-staff-1",
            email: "staff@journeyhome.ng",
            name: "Staff Admin",
            role: "admin",
            isSuperAdmin: false,
          },
          token: "demo-staff-token",
        };
      }

      throw new ApiError("Invalid email or password.", 401);
    },
    "GET /payments/admin": demoPayments,
    "GET /audit-logs": demoAudit,
    "GET /auth/me": () => {
      const u = sessionUser();
      return {
        ...u,
        preferences: {
          ...DEFAULT_PREFS,
          ...read(`jh_mock:admin_prefs:${u.id}`, {}),
        },
      };
    },
    "PATCH /auth/me/preferences": () => {
      const u = sessionUser();
      const next = { ...read(`jh_mock:admin_prefs:${u.id}`, {}), ...b };
      localStorage.setItem(`jh_mock:admin_prefs:${u.id}`, JSON.stringify(next));
      return { ...DEFAULT_PREFS, ...next };
    },
    "POST /auth/sessions/revoke-others": () => ({ revoked: 2 }),
    "GET /auth/customers": () => MOCK_CUSTOMERS,
    "GET /plans/admin": () => MOCK_PLANS,
    "GET /service-requests/admin": () => MOCK_REQUESTS,
    "GET /packages/admin": () => [
      {
        _id: "pkg_1",
        name: "Standard",
        monthlyContributionMinor: 500000,
        isActive: true,
      },
    ],
    "GET /auth/admins": () => [
      {
        id: "admin-1",
        name: "Operations Admin",
        email: "admin@journeyhome.ng",
        role: "super_admin",
        isSuperAdmin: true,
      },
    ],
  };

  let handler = handlers[route];

  const planMatch = /^GET \/plans\/(.+)$/.exec(route);
  if (!handler && planMatch) {
    handler = () => MOCK_PLANS.find((p) => p._id === planMatch[1]) || MOCK_PLANS[0];
  }

  const reqMatch = /^GET \/service-requests\/(.+)$/.exec(route);
  if (!handler && reqMatch) {
    handler = () => ({
      request:
        MOCK_REQUESTS.find((r) => r._id === reqMatch[1]) || MOCK_REQUESTS[0],
      documents: [],
    });
  }

  const userMatch = /^GET \/auth\/customers\/(.+)$/.exec(route);
  if (!handler && userMatch) {
    handler = () =>
      MOCK_CUSTOMERS.find((c) => c._id === userMatch[1]) || MOCK_CUSTOMERS[0];
  }

  if (!handler) return NOT_MOCKED;
  await sleep(100);
  return handler();
}
