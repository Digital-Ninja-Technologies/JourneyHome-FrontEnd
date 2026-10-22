import { ApiError } from "@/lib/errors";

/**
 * Simulated server for admin endpoints the real backend doesn't have yet. Only used in demo mode
 * (see USE_MOCKS in lib/api.ts). The contract these mirror is in docs/BACKEND_CONTRACT.md.
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

function sessionUser(): { id: string; name: string; email: string } {
  try {
    const raw = sessionStorage.getItem("jh_admin_session");
    if (raw) return JSON.parse(raw).user;
  } catch {
    /* ignore */
  }
  throw new ApiError(401, "Please sign in again.");
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

export async function mockRequest(
  method: string,
  path: string,
  body: unknown,
): Promise<unknown | typeof NOT_MOCKED> {
  const b = (body ?? {}) as Record<string, unknown>;
  const route = `${method} ${path.split("?")[0]}`;
  const handlers: Record<string, () => unknown> = {
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
  };
  const handler = handlers[route];
  if (!handler) return NOT_MOCKED;
  await sleep(350);
  return handler();
}
