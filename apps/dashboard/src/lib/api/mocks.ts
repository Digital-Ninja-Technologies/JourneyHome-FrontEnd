import { ApiError } from "@journeyhome/api-client";
import type {
  AppNotification,
  Payment,
  Plan,
  ServiceDocument,
  ServiceRequest,
} from "@journeyhome/schemas";

/**
 * Simulated server for endpoints when running locally with VITE_USE_MOCKS=true.
 * State lives in localStorage. Mirrors api-doc.yaml.
 */
export const NOT_MOCKED = Symbol("not-mocked");
export const DEMO_RESET_TOKEN = "demo-token";
/** Presigned upload URLs from the mock point here; `putToStorage` skips the network for them. */
export const MOCK_STORAGE_ORIGIN = "https://mock-storage.local";

export interface Preferences {
  paymentReminders: boolean;
  deficitAlerts: boolean;
  serviceRequestUpdates: boolean;
  productNewsOffers: boolean;
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

const DAY = 86400000;
const nowIso = () => new Date().toISOString();
const inDays = (n: number) => new Date(Date.now() + DAY * n).toISOString();
const page = <T>(items: T[]) => ({
  items,
  pagination: {
    page: 1,
    limit: 20,
    total: items.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
});

const PACKAGES = [
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
];

const defaultPlan = (): Plan => ({
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
  startDate: nowIso(),
  totalContributedAmount: 1500000,
  status: "Active",
  coverageStatus: "Active",
  nextPaymentDate: inDays(15),
  createdAt: nowIso(),
  updatedAt: nowIso(),
});
const storedPlans = () => read<Plan[]>("jh_mock:plans", [defaultPlan()]);

const mockPayment = (over: Partial<Payment> = {}): Payment => ({
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
  createdAt: nowIso(),
  updatedAt: nowIso(),
  processedAt: nowIso(),
  ...over,
});

const REQUESTS_KEY = "jh_mock:requests";
const storedRequests = () => read<ServiceRequest[]>(REQUESTS_KEY, []);

const NOTIFICATIONS_KEY = "jh_mock:notifications";
const seedNotifications = (): AppNotification[] => [
  {
    _id: "notif_1",
    title: "Contribution received",
    message: "Your monthly contribution was received. Thank you.",
    event: "payment_successful",
    isRead: false,
    createdAt: nowIso(),
  },
  {
    _id: "notif_2",
    title: "Welcome to Journey Home",
    message: "Your account is ready. Start a plan whenever you are.",
    event: "welcome",
    isRead: true,
    createdAt: inDays(-3),
  },
];
const storedNotifications = () =>
  read<AppNotification[]>(NOTIFICATIONS_KEY, seedNotifications());

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
    "PATCH /auth/notification-preferences": () => {
      const u = sessionUser();
      const next = { ...read(`jh_mock:prefs:${u.id}`, {}), ...b };
      write(`jh_mock:prefs:${u.id}`, next);
      return { ...DEFAULT_PREFS, ...next };
    },
    "DELETE /auth/me": () => {
      if (!b.password) throw bad("Current password is required.");
      return { success: true, closed: true };
    },
    "GET /packages": () => PACKAGES,
    "GET /plans": () => page(storedPlans()),
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
      const current = storedPlans();
      write("jh_mock:plans", [newPlan, ...current]);
      return newPlan;
    },
    "GET /plans/dashboard": () => {
      const plans = storedPlans();
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
    "GET /payments": () => page([mockPayment()]),
    "GET /service-requests": () => storedRequests(),
    "POST /service-requests": () => {
      const plan =
        storedPlans().find((p) => p._id === b.planId) ?? storedPlans()[0];
      const created: ServiceRequest = {
        _id: `req_${Date.now()}`,
        owner: "demo-cust-1",
        plan: plan._id,
        status: "Submitted",
        dateOfDeath: b.dateOfDeath ?? nowIso(),
        serviceLocation: b.serviceLocation ?? "",
        expectedServiceDate: b.expectedServiceDate ?? inDays(7),
        contactPerson: b.contactPerson ?? "",
        contactPhone: b.contactPhone ?? "",
        ...(b.additionalInformation && {
          additionalInformation: b.additionalInformation,
        }),
        coveredPersonSnapshot: plan.coveredPerson,
        documents: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      write(REQUESTS_KEY, [created, ...storedRequests()]);
      return created;
    },
    "GET /notifications": () => {
      const all = storedNotifications();
      const unread = all.filter((n) => !n.isRead);
      const filter = new URLSearchParams(path.split("?")[1] ?? "").get(
        "isRead",
      );
      const items =
        filter === null ? all : all.filter((n) => String(n.isRead) === filter);
      return {
        ...page(items),
        counts: {
          totalNotifications: all.length,
          totalUnreadNotifications: unread.length,
        },
      };
    },
  };

  let handler = handlers[route];

  // Dynamic routes
  const match = (re: RegExp) => re.exec(route);
  const dyn: [RegExp, (m: RegExpExecArray) => unknown][] = [
    [
      /^GET \/packages\/([^/]+)$/,
      (m) => {
        const found = PACKAGES.find((p) => p._id === m[1]);
        if (!found) throw new ApiError("Package not found.", 404);
        return found;
      },
    ],
    [
      /^GET \/plans\/([^/]+)$/,
      (m) => {
        const planId = m[1];
        const found = storedPlans().find((p) => p._id === planId);
        if (found) return found;
        return {
          ...defaultPlan(),
          _id: planId,
          status: planId === "plan_pending_1" ? "Pending" : "Active",
        };
      },
    ],
    [
      /^POST \/payments\/plans\/([^/]+)\/initialize-initial$/,
      () => {
        const ref = `ref_demo_${Date.now()}`;
        return {
          paymentId: `pay_${Date.now()}`,
          reference: ref,
          authorizationUrl: `${window.location.origin}/app/payments/callback?reference=${ref}&trxref=${ref}`,
          accessCode: "access_code_mock",
        };
      },
    ],
    [
      /^POST \/payments\/verify\/([^/]+)$/,
      (m) =>
        mockPayment({
          _id: `pay_${m[1]}`,
          reference: decodeURIComponent(m[1]),
          providerReference: decodeURIComponent(m[1]),
        }),
    ],
    [/^GET \/payments\/([^/]+)$/, (m) => mockPayment({ _id: m[1] })],
    [
      /^GET \/subscriptions\/([^/]+)$/,
      (m) => ({
        _id: m[1],
        plan: "plan_demo_1",
        status: "active",
        amount: 500000,
        currency: "NGN",
        nextPaymentDate: inDays(15),
        createdAt: nowIso(),
      }),
    ],
    [
      /^PATCH \/notifications\/([^/]+)\/read$/,
      (m) => {
        const next = storedNotifications().map((n) =>
          n._id === m[1] ? { ...n, isRead: true } : n,
        );
        write(NOTIFICATIONS_KEY, next);
        return next.find((n) => n._id === m[1]) ?? {};
      },
    ],
    [
      /^DELETE \/notifications\/([^/]+)$/,
      (m) => {
        write(
          NOTIFICATIONS_KEY,
          storedNotifications().filter((n) => n._id !== m[1]),
        );
        return { success: true };
      },
    ],
    [
      /^GET \/service-requests\/([^/]+)$/,
      (m) => {
        const request = storedRequests().find((r) => r._id === m[1]);
        if (!request) throw new ApiError("Service request not found.", 404);
        return { request, documents: request.documents };
      },
    ],
    [
      /^POST \/service-requests\/([^/]+)\/documents\/upload-url$/,
      () => {
        const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        return {
          fileId,
          uploadUrl: `${MOCK_STORAGE_ORIGIN}/upload/${fileId}`,
          uploadToken: `tok_${fileId}`,
          storageKey: `service-documents/${fileId}`,
          expiresIn: 900,
        };
      },
    ],
    [
      /^POST \/service-requests\/([^/]+)\/documents\/complete$/,
      (m) => {
        const requests = storedRequests();
        const request = requests.find((r) => r._id === m[1]);
        if (!request) throw new ApiError("Service request not found.", 404);
        const doc: ServiceDocument = {
          _id: `doc_${b.fileId}`,
          serviceRequest: request._id,
          owner: request.owner,
          plan: request.plan,
          file: b.fileId,
          documentType: b.documentType,
          verificationStatus: "Pending",
          uploadedAt: nowIso(),
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        const documents = [
          ...request.documents.map((d) =>
            d._id === b.replacesDocumentId ? { ...d, replacedBy: doc._id } : d,
          ),
          doc,
        ];
        write(
          REQUESTS_KEY,
          requests.map((r) =>
            r._id === request._id
              ? { ...r, documents, updatedAt: nowIso() }
              : r,
          ),
        );
        return doc;
      },
    ],
    [
      /^GET \/service-requests\/([^/]+)\/documents\/([^/]+)\/download-url$/,
      (m) => {
        const doc = storedRequests()
          .find((r) => r._id === m[1])
          ?.documents.find((d) => d._id === m[2]);
        if (!doc) throw new ApiError("Document not found.", 404);
        return {
          document: {
            _id: doc._id,
            documentType: doc.documentType,
            verificationStatus: doc.verificationStatus,
          },
          url: `${window.location.origin}/#mock-document`,
          expiresIn: 300,
        };
      },
    ],
  ];
  if (!handler) {
    for (const [re, fn] of dyn) {
      const m = match(re);
      if (m) {
        handler = () => fn(m);
        break;
      }
    }
  }

  if (!handler) return NOT_MOCKED;
  await sleep(100);
  return handler();
}
