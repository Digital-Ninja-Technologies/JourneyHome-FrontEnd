import { ApiError } from "@journeyhome/api-client";
import type {
  AdminMe,
  AdminPackage,
  AdminPayment,
  AdminUser,
  AppNotification,
  AuditLog,
  ContactRecord,
  CoveredPerson,
  PaymentStatus,
  Plan,
  PlanStatus,
  ServiceDocument,
  ServiceRequest,
  ServiceRequestStatus,
  UserSummary,
} from "@journeyhome/schemas";

/**
 * Simulated server for admin endpoints when running with VITE_USE_MOCKS=true.
 * Response shapes mirror api-doc.yaml. State lives in localStorage so changes
 * survive reloads; clear `jh_admin_mock:db:v2` to reseed.
 */
export const NOT_MOCKED = Symbol("not-mocked");

/** Bump the suffix whenever the stored shape changes so old data reseeds. */
const DB_KEY = "jh_admin_mock:db:v2";
const SESSION_KEY = "jh_admin_session";
const DAY = 86_400_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => new Date().toISOString();
const daysAgo = (n: number, hour = 10) => {
  const d = new Date(Date.now() - n * DAY);
  d.setHours(hour, (n * 7) % 60, 0, 0);
  return d.toISOString();
};
const bad = (message: string) => new ApiError(message, 400);
const notFound = (what: string) => new ApiError(`${what} not found.`, 404);

/* -------------------------------------------------------------------------- */
/*                                    Seed                                    */
/* -------------------------------------------------------------------------- */

interface Customer extends UserSummary {
  createdAt: string;
}

interface Db {
  customers: Customer[];
  packages: AdminPackage[];
  plans: Plan[];
  payments: (Omit<AdminPayment, "owner" | "plan"> & {
    owner: string;
    plan: string;
    processedAt?: string;
  })[];
  requests: ServiceRequest[];
  contacts: ContactRecord[];
  admins: AdminUser[];
  audit: AuditLog[];
  notifications: AppNotification[];
  prefs: Record<string, NonNullable<AdminMe["preferences"]>>;
}

const CUSTOMERS: [name: string, email: string, joined: number][] = [
  ["Chidi Okafor", "chidi@example.com", 210],
  ["Grace Adebayo", "grace@example.com", 180],
  ["Musa Lawal", "musa@example.com", 160],
  ["Bisi Oyelaran", "bisi@example.com", 120],
  ["Funke Adeyemi", "funke@example.com", 95],
  ["Obi Eze", "obi@example.com", 60],
  ["Amaka Nwosu", "amaka@example.com", 20],
  ["Tunde Bakare", "tunde@example.com", 3],
];

const PACKAGES: [id: string, name: string, amount: number, active: boolean][] =
  [
    ["pkg_standard", "Standard", 500_000, true],
    ["pkg_classic", "Classic Memorial", 1_000_000, true],
    ["pkg_premium", "Premium", 1_800_000, true],
    ["pkg_legacy", "Legacy (retired)", 300_000, false],
  ];

const PLANS: [
  owner: number,
  name: string,
  relationship: string,
  pkg: number,
  status: PlanStatus,
  months: number,
][] = [
  [0, "Emeka Okafor", "father", 1, "Active", 7],
  [0, "Ngozi Okafor", "mother", 0, "Payment_Due", 6],
  [1, "Adaeze Nwosu", "mother", 2, "Under_Review", 5],
  [2, "Ibrahim Lawal", "father", 1, "Approved", 5],
  [3, "Tola Oyelaran", "grandparent", 0, "Overdue", 4],
  [4, "Kemi Adeyemi", "mother", 1, "Active", 3],
  [4, "Segun Adeyemi", "father", 1, "Paused", 3],
  [5, "Nkem Eze", "uncle / aunt", 0, "Cancelled", 2],
  [5, "Chika Eze", "mother", 2, "Completed", 2],
  [6, "Uche Nwosu", "father", 1, "Pending", 0],
  [1, "Bola Adebayo", "father", 0, "Service_Request", 4],
  [2, "Hauwa Lawal", "mother", 0, "Active", 4],
];

const REQUESTS: [
  plan: number,
  status: ServiceRequestStatus,
  docs: ServiceDocument["verificationStatus"][],
  submitted: number,
][] = [
  [10, "Submitted", ["Pending", "Pending"], 1],
  [2, "Under_Review", ["Approved", "Pending"], 3],
  [4, "More_Info_Required", ["Requires_Resubmission", "Approved"], 8],
  [3, "Docs_Verified", ["Approved", "Approved"], 10],
  [8, "Closed", ["Approved", "Approved"], 30],
  [7, "Rejected", ["Approved"], 40],
];

const CONTACT_MESSAGES: [string, string, ContactRecord["topic"], string][] = [
  [
    "Adebayo Okafor",
    "adebayo@example.com",
    "Starting a plan",
    "Can I start a plan for my grandmother who lives abroad?",
  ],
  [
    "Ngozi Eze",
    "ngozi@example.com",
    "An existing plan",
    "My card was charged twice this month. Please check.",
  ],
  [
    "Femi Bello",
    "femi@studio.ng",
    "Photographer network",
    "I run a studio in Ibadan and would like to join your photographer network.",
  ],
  [
    "Halima Musa",
    "halima@example.com",
    "Something else",
    "Do you cover services outside Lagos and Abuja?",
  ],
  [
    "Kunle Ade",
    "kunle@example.com",
    "Starting a plan",
    "What happens if I miss a monthly payment?",
  ],
  [
    "Ify Obi",
    "ify@example.com",
    "An existing plan",
    "How do I update the address on my mother's plan?",
  ],
  [
    "Sade Lawal",
    "sade@example.com",
    "Photographer network",
    "Are you hiring videographers in Port Harcourt?",
  ],
];

const AUDIT: [actor: string, action: string, label: string, days: number][] = [
  [
    "Ops Admin",
    "service_request.docs_verified",
    "Adaeze Nwosu's service request",
    1,
  ],
  [
    "Ops Admin",
    "service_request.viewed_by_admin",
    "Adaeze Nwosu's service request",
    1,
  ],
  [
    "Ops Admin",
    "service_request.approved",
    "Ibrahim Lawal's service request",
    7,
  ],
  [
    "Grace Adebayo",
    "service_request.created",
    "Adaeze Nwosu's service request",
    10,
  ],
  [
    "Ops Admin",
    "service_request.more_info_required",
    "Tola Oyelaran's service request",
    12,
  ],
  [
    "Finance Admin",
    "service_request.viewed_by_admin",
    "Tola Oyelaran's service request",
    12,
  ],
  ["Ops Admin", "service_request.rejected", "Nkem Eze's service request", 30],
  [
    "Musa Lawal",
    "service_request.created",
    "Ibrahim Lawal's service request",
    31,
  ],
  [
    "Ops Admin",
    "service_request.docs_verified",
    "Ibrahim Lawal's service request",
    29,
  ],
  ["Finance Admin", "package.updated", "Classic Memorial", 33],
  ["Ops Admin", "plan.status_changed", "Segun Adeyemi's plan", 36],
  [
    "Chidi Okafor",
    "service_request.created",
    "Emeka Okafor's service request",
    45,
  ],
];

const NOTIFICATIONS: [
  title: string,
  message: string,
  event: string,
  days: number,
  isRead: boolean,
][] = [
  [
    "New service request",
    "Adaeze Nwosu submitted a service request for review.",
    "ServiceRequestSubmitted",
    0,
    false,
  ],
  [
    "Service document submitted",
    "A death certificate was uploaded for Adaeze Nwosu's service request.",
    "ServiceDocumentSubmitted",
    1,
    false,
  ],
  [
    "New contact message",
    "Someone asked about joining the photographer network.",
    "ContactMessageReceived",
    2,
    true,
  ],
  [
    "New plan created",
    "Chidi Okafor started a Classic Memorial plan.",
    "PlanCreated",
    4,
    true,
  ],
];

const resourceTypeOf = (action: string) =>
  action.startsWith("package")
    ? "Package"
    : action.startsWith("plan")
      ? "Plan"
      : "ServiceRequest";

function coveredPerson(
  fullName: string,
  relationship: string,
  i: number,
): CoveredPerson {
  return {
    fullName,
    relationship,
    dateOfBirth: `19${48 + i}-0${(i % 9) + 1}-1${i % 9}`,
    gender: ["mother", "grandparent"].includes(relationship)
      ? "female"
      : "male",
    address: `${12 + i} Marina Road, Lagos`,
    phoneNumber: `+23480${String(12_345_670 + i).padStart(8, "0")}`,
  };
}

function seed(): Db {
  const customers: Customer[] = CUSTOMERS.map(([name, email, joined], i) => ({
    _id: `cust_${i + 1}`,
    name,
    email,
    createdAt: daysAgo(joined),
  }));

  const packages: AdminPackage[] = PACKAGES.map(
    ([id, name, amount, isActive]) => ({
      _id: id,
      name,
      description: `${name} coverage for photography and video on the day.`,
      features: ["Full-day photography", "Digital gallery", "Highlight film"],
      amount,
      currency: "NGN",
      billingInterval: "monthly",
      isActive,
      createdAt: daysAgo(300),
      updatedAt: daysAgo(30),
    }),
  );

  const plans: Plan[] = PLANS.map(
    ([owner, name, relationship, pkgIndex, status, months], i) => {
      const pkg = packages[pkgIndex];
      return {
        _id: `plan_${i + 1}`,
        owner: customers[owner]._id,
        package: pkg._id,
        packageDetails: {
          packageId: pkg._id,
          name: pkg.name,
          description: pkg.description,
          features: pkg.features,
          amount: pkg.amount,
          currency: pkg.currency,
        },
        coveredPerson: coveredPerson(name, relationship, i),
        amount: pkg.amount,
        currency: "NGN",
        billingInterval: "monthly",
        startDate: daysAgo(months * 30 + 2),
        totalContributedAmount: pkg.amount * months,
        status,
        coverageStatus: status === "Pending" ? "Pending" : "Active",
        nextPaymentDate:
          status === "Overdue"
            ? daysAgo(9)
            : status === "Payment_Due"
              ? daysAgo(0)
              : new Date(Date.now() + 15 * DAY).toISOString(),
        createdAt: daysAgo(months * 30 + 2),
        updatedAt: daysAgo(2),
      };
    },
  );

  const statuses: PaymentStatus[] = [
    "Successful",
    "Successful",
    "Successful",
    "Pending",
    "Failed",
    "Successful",
    "Processing",
    "Successful",
  ];
  const payments: Db["payments"] = Array.from({ length: 48 }, (_, i) => {
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];
    const created = daysAgo(Math.floor(i * 1.6), 8 + (i % 10));
    const initial = i < plans.length;
    return {
      _id: `pay_${i + 1}`,
      owner: plan.owner,
      plan: plan._id,
      reference: `jh_${initial ? "init" : "rec"}_${82_300 - i * 37}`,
      amount: plan.amount,
      currency: "NGN",
      purpose: initial ? "initial_contribution" : "recurring_contribution",
      status,
      createdAt: created,
      processedAt: status === "Successful" ? created : undefined,
    };
  });

  const requests: ServiceRequest[] = REQUESTS.map(
    ([planIndex, status, docs, submitted], i) => {
      const plan = plans[planIndex];
      const id = `req_${i + 1}`;
      const types = ["Death_Certificate", "Valid_Identification"] as const;
      return {
        _id: id,
        owner: plan.owner,
        plan: plan._id,
        coveredPersonSnapshot: plan.coveredPerson,
        dateOfDeath: daysAgo(submitted + 2),
        serviceLocation: "St. Mary's Church, Ikoyi, Lagos",
        expectedServiceDate: new Date(
          Date.now() + (10 - submitted) * DAY,
        ).toISOString(),
        contactPerson: "Chinedu Okafor",
        contactPhone: "+2348031234567",
        additionalInformation:
          i % 2 === 0 ? "Please arrive an hour early." : undefined,
        status,
        ...(status === "More_Info_Required" && {
          moreInfoReason: "Please upload a clearer death certificate.",
        }),
        ...(status === "Rejected" && {
          rejectionReason: "The plan was cancelled before the request.",
        }),
        ...((status === "Approved" || status === "Closed") && {
          approvedAt: daysAgo(submitted - 3),
        }),
        ...(status === "Closed" && {
          photographerName: "Femi Bello",
          photographerPhoneNo: "08031234567",
          photographerAssignedAt: daysAgo(submitted - 4),
        }),
        documents: docs.map((verificationStatus, d) => ({
          _id: `doc_${i + 1}_${d + 1}`,
          serviceRequest: id,
          owner: plan.owner,
          plan: plan._id,
          file: `file_${i + 1}_${d + 1}`,
          documentType: types[d % types.length],
          verificationStatus,
          ...(verificationStatus === "Requires_Resubmission" && {
            rejectionReason: "The scan is unreadable.",
          }),
          uploadedAt: daysAgo(submitted),
          createdAt: daysAgo(submitted),
          updatedAt: daysAgo(submitted),
        })),
        createdAt: daysAgo(submitted),
        updatedAt: daysAgo(Math.max(0, submitted - 1)),
      };
    },
  );

  const contacts: ContactRecord[] = CONTACT_MESSAGES.map(
    ([name, email, topic, message], i) => ({
      _id: `msg_${i + 1}`,
      name,
      email,
      phone: `+23481${String(20_000_000 + i * 7).padStart(8, "0")}`,
      topic,
      message,
      createdAt: daysAgo(i * 2, 9 + i),
    }),
  );

  const admins: AdminUser[] = [
    {
      id: "admin-1",
      name: "Operations Admin",
      email: "admin@journeyhome.ng",
      role: "super_admin",
      isSuperAdmin: true,
      createdAt: daysAgo(400),
    },
    {
      id: "admin-2",
      name: "Finance Admin",
      email: "finance@journeyhome.ng",
      role: "admin",
      isSuperAdmin: false,
      createdAt: daysAgo(200),
    },
  ];

  const audit: AuditLog[] = AUDIT.map(([name, action, label, d], i) => {
    const slug = name.toLowerCase().replace(/\s+/g, "_");
    const at = daysAgo(d, 8 + (i % 9));
    return {
      _id: `aud_${i + 1}`,
      actor: {
        _id: `actor_${slug}`,
        name,
        email: `${slug.replace(/_/g, ".")}@journeyhome.ng`,
        role: "Admin",
      },
      action,
      resourceType: resourceTypeOf(action),
      resourceId: `res_${i + 1}`,
      metadata: { label },
      createdAt: at,
      updatedAt: at,
    };
  });

  const notifications: AppNotification[] = NOTIFICATIONS.map(
    ([title, message, event, d, isRead], i) => ({
      _id: `ntf_${i + 1}`,
      userId: "admin",
      title,
      message,
      event,
      channel: "in_app",
      isRead,
      createdAt: daysAgo(d, 9 + (i % 8)),
    }),
  );

  return {
    customers,
    packages,
    plans,
    payments,
    requests,
    contacts,
    admins,
    audit,
    notifications,
    prefs: {},
  };
}

function load(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* ignore */
  }
  const db = seed();
  save(db);
  return db;
}

function save(db: Db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function sessionUser(): AdminUser {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw).user;
  } catch {
    /* ignore */
  }
  throw new ApiError("Please sign in again.", 401);
}

function paginate<T>(items: T[], qs: URLSearchParams) {
  const page = Math.max(1, Number(qs.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(qs.get("limit")) || 20));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items: items.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

const matches = (needle: string | null, ...haystack: (string | undefined)[]) =>
  !needle ||
  haystack.some((h) => h?.toLowerCase().includes(needle.trim().toLowerCase()));

const newestFirst = <T extends { createdAt: string }>(a: T, b: T) =>
  +new Date(b.createdAt) - +new Date(a.createdAt);

function inRange(iso: string, from: string | null, to: string | null) {
  const t = +new Date(iso);
  if (from && t < +new Date(`${from}T00:00:00`)) return false;
  if (to && t > +new Date(`${to}T23:59:59.999`)) return false;
  return true;
}

function summaryOf(db: Db, ownerId: string): UserSummary {
  const c = db.customers.find((x) => x._id === ownerId);
  return c
    ? { _id: c._id, name: c.name, email: c.email }
    : { _id: ownerId, name: "Unknown user", email: "unknown@example.com" };
}

const isLive = (s: PlanStatus) =>
  s === "Active" || s === "Payment_Due" || s === "Overdue";
const isPendingReview = (s: ServiceRequestStatus) =>
  s === "Submitted" || s === "Under_Review" || s === "Docs_Verified";

function audit(db: Db, action: string, resourceId: string, label: string) {
  const actor = sessionUser();
  const at = nowIso();
  db.audit.unshift({
    _id: `aud_${Date.now()}`,
    actor: {
      _id: actor.id,
      name: actor.name,
      email: actor.email,
      role: actor.isSuperAdmin ? "SuperAdmin" : "Admin",
    },
    action,
    resourceType: resourceTypeOf(action),
    resourceId,
    metadata: { label },
    createdAt: at,
    updatedAt: at,
  });
}

const DEFAULT_PREFS = {
  newServiceRequest: true,
  paymentFailed: true,
  weeklyDigest: false,
};

/** Mirrors the backend's allowed plan status transitions. */
const PLAN_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
  Pending: ["Active", "Cancelled"],
  Active: ["Payment_Due", "Paused", "Service_Request", "Cancelled"],
  Payment_Due: ["Active", "Overdue", "Paused", "Cancelled"],
  Overdue: ["Active", "Paused", "Cancelled", "Expired"],
  Paused: ["Active", "Cancelled"],
  Service_Request: ["Under_Review", "Cancelled"],
  Under_Review: ["Approved", "Cancelled"],
  Approved: ["Service_Scheduled", "Cancelled"],
  Service_Scheduled: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
  Expired: [],
};

/* -------------------------------------------------------------------------- */
/*                                  Handlers                                  */
/* -------------------------------------------------------------------------- */

// biome-ignore lint/suspicious/noExplicitAny: mock request bodies are loosely typed
type Body = Record<string, any>;

type Handler = (ctx: {
  db: Db;
  body: Body;
  qs: URLSearchParams;
  params: string[];
}) => unknown;

const routes: [method: string, pattern: RegExp, handler: Handler][] = [
  /* ---------------------------------- Auth --------------------------------- */
  [
    "POST",
    /^\/auth\/login$/,
    ({ db, body }) => {
      const email = String(body.email || "")
        .toLowerCase()
        .trim();
      const password = String(body.password || "");
      const known = db.admins.find((a) => a.email === email);
      if (
        known ||
        email.endsWith("@journeyhome.test") ||
        password === "Admin123!"
      ) {
        const user = known ?? {
          ...db.admins[0],
          email: email || db.admins[0].email,
        };
        return { user, token: `demo-admin-token-${user.id}` };
      }
      throw new ApiError("Invalid email or password.", 401);
    },
  ],
  [
    "GET",
    /^\/auth\/me$/,
    ({ db }) => {
      const u = sessionUser();
      return { ...u, preferences: { ...DEFAULT_PREFS, ...db.prefs[u.id] } };
    },
  ],
  [
    "PATCH",
    /^\/auth\/me\/preferences$/,
    ({ db, body }) => {
      const u = sessionUser();
      db.prefs[u.id] = { ...DEFAULT_PREFS, ...db.prefs[u.id], ...body };
      return db.prefs[u.id];
    },
  ],
  ["POST", /^\/auth\/sessions\/revoke-others$/, () => ({ revoked: 2 })],
  ["GET", /^\/auth\/admins$/, ({ db }) => db.admins],
  [
    "POST",
    /^\/auth\/admin$/,
    ({ db, body }) => {
      if (!sessionUser().isSuperAdmin)
        throw new ApiError("Only super admins can add admins.", 403);
      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      if (db.admins.some((a) => a.email === email))
        throw new ApiError("An admin with this email already exists.", 409);
      const admin: AdminUser = {
        id: `admin-${Date.now()}`,
        name: String(body.name || "").trim(),
        email,
        role: "admin",
        isSuperAdmin: false,
        createdAt: nowIso(),
      };
      db.admins.push(admin);
      return admin;
    },
  ],
  [
    "DELETE",
    /^\/auth\/admin\/([^/]+)$/,
    ({ db, params: [id] }) => {
      const admin = db.admins.find((a) => a.id === id);
      if (!admin) throw notFound("Admin");
      if (admin.isSuperAdmin) throw bad("Super admins can't be removed.");
      db.admins = db.admins.filter((a) => a.id !== id);
      return { id, email: admin.email };
    },
  ],

  /* -------------------------------- Overview ------------------------------- */
  [
    "GET",
    /^\/admin\/overview$/,
    ({ db, qs }) => {
      const from = qs.get("startDate");
      const to = qs.get("endDate");
      const ok = db.payments.filter((p) => p.status === "Successful");
      const live = db.plans.filter((p) => isLive(p.status));
      const total = ok.reduce((n, p) => n + p.amount, 0);
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const count = (s: ServiceRequestStatus) =>
        db.requests.filter((r) => r.status === s).length;
      return {
        users: {
          total: db.customers.length,
          newThisMonth: db.customers.filter(
            (c) => +new Date(c.createdAt) >= +monthStart,
          ).length,
        },
        plans: {
          active: live.length,
          overdue: db.plans.filter((p) => p.status === "Overdue").length,
          pendingFirstPayment: db.plans.filter((p) => p.status === "Pending")
            .length,
          completed: db.plans.filter((p) => p.status === "Completed").length,
        },
        contributions: {
          totalContributed: total,
          selectedPeriodContributed: ok
            .filter((p) => inRange(p.createdAt, from, to))
            .reduce((n, p) => n + p.amount, 0),
          monthlyContributed: ok
            .filter((p) => +new Date(p.createdAt) >= +monthStart)
            .reduce((n, p) => n + p.amount, 0),
          monthlyCommitments: live.reduce((n, p) => n + p.amount, 0),
          averagePerActivePlan: live.length
            ? Math.round(total / live.length)
            : 0,
          activePlanCount: live.length,
        },
        serviceRequests: {
          new: count("Submitted"),
          inReview: count("Under_Review") + count("Docs_Verified"),
          awaitingCustomer: count("More_Info_Required"),
          approved: count("Approved"),
          closed: count("Closed"),
          pendingVerification: db.requests.filter((r) =>
            isPendingReview(r.status),
          ).length,
        },
        needsReview: db.requests
          .filter((r) => isPendingReview(r.status))
          .sort(newestFirst)
          .slice(0, 5)
          .map((r) => {
            const plan = db.plans.find((p) => p._id === r.plan);
            return {
              ...r,
              owner: summaryOf(db, r.owner),
              plan: {
                _id: r.plan,
                packageDetails: plan && { name: plan.packageDetails.name },
              },
            };
          }),
        period: {
          startDate: from ? `${from}T00:00:00.000Z` : undefined,
          endDate: to ? `${to}T23:59:59.999Z` : undefined,
        },
      };
    },
  ],
  [
    "GET",
    /^\/admin\/users$/,
    ({ db, qs }) => {
      const rows = db.customers
        .filter((c) => matches(qs.get("search"), c.name, c.email))
        .sort(newestFirst)
        .map((c) => {
          const plans = db.plans.filter((p) => p.owner === c._id);
          const live = plans.filter((p) => isLive(p.status));
          const pending = db.requests.some(
            (r) => r.owner === c._id && isPendingReview(r.status),
          );
          return {
            ...c,
            planCount: plans.length,
            totalSaved: plans.reduce((n, p) => n + p.totalContributedAmount, 0),
            activePlanCount: live.length,
            status: pending
              ? "Request_Pending"
              : live.length
                ? "Active_Plan"
                : "No_Active_Plan",
          };
        });
      return paginate(rows, qs);
    },
  ],

  /* --------------------------------- Plans --------------------------------- */
  [
    "GET",
    /^\/plans\/admin$/,
    ({ db, qs }) => {
      const status = qs.get("status");
      const ownerId = qs.get("ownerId");
      const packageId = qs.get("packageId");
      const rows = db.plans
        .filter(
          (p) =>
            (!status || p.status === status) &&
            (!ownerId || p.owner === ownerId) &&
            (!packageId || p.package === packageId) &&
            matches(
              qs.get("search"),
              p.coveredPerson.fullName,
              summaryOf(db, p.owner).name,
              summaryOf(db, p.owner).email,
            ),
        )
        .sort(newestFirst)
        .map((p) => ({ ...p, owner: summaryOf(db, p.owner) }));
      return paginate(rows, qs);
    },
  ],
  [
    "GET",
    /^\/plans\/([^/]+)$/,
    ({ db, params: [id] }) => {
      const plan = db.plans.find((p) => p._id === id);
      if (!plan) throw notFound("Plan");
      return plan;
    },
  ],
  [
    "PATCH",
    /^\/plans\/([^/]+)\/status$/,
    ({ db, body, params: [id] }) => {
      const plan = db.plans.find((p) => p._id === id);
      if (!plan) throw notFound("Plan");
      if (!PLAN_TRANSITIONS[plan.status].includes(body.status))
        throw bad(`A plan can't move from ${plan.status} to ${body.status}.`);
      plan.status = body.status;
      plan.updatedAt = nowIso();
      audit(
        db,
        "plan.status_changed",
        plan._id,
        `${plan.coveredPerson.fullName}'s plan`,
      );
      return plan;
    },
  ],

  /* -------------------------------- Payments ------------------------------- */
  [
    "GET",
    /^\/payments\/admin$/,
    ({ db, qs }) => {
      const status = qs.get("status");
      const purpose = qs.get("purpose");
      const from = qs.get("from");
      const to = qs.get("to");
      const inPeriod = db.payments.filter((p) =>
        inRange(p.createdAt, from, to),
      );
      const rows = inPeriod
        .filter((p) => {
          const plan = db.plans.find((x) => x._id === p.plan);
          const owner = summaryOf(db, p.owner);
          return (
            (!status || p.status === status) &&
            (!purpose || p.purpose === purpose) &&
            matches(
              qs.get("search"),
              p.reference,
              owner.name,
              owner.email,
              plan?.coveredPerson.fullName,
            )
          );
        })
        .sort(newestFirst)
        .map(({ processedAt: _processed, ...p }) => {
          const plan = db.plans.find((x) => x._id === p.plan);
          return {
            ...p,
            owner: summaryOf(db, p.owner),
            plan: {
              _id: p.plan,
              coveredPerson: plan && {
                fullName: plan.coveredPerson.fullName,
                relationship: plan.coveredPerson.relationship,
              },
              packageDetails: plan && {
                name: plan.packageDetails.name,
                amount: plan.packageDetails.amount,
                currency: plan.packageDetails.currency,
              },
            },
          };
        });
      const summary: Record<string, { amount: number; count: number }> = {};
      for (const p of inPeriod) {
        summary[p.status] ??= { amount: 0, count: 0 };
        summary[p.status].amount += p.amount;
        summary[p.status].count += 1;
      }
      return { ...paginate(rows, qs), summary };
    },
  ],

  /* ---------------------------- Service requests --------------------------- */
  [
    "GET",
    /^\/service-requests\/admin$/,
    ({ db, qs }) => {
      const status = qs.get("status");
      const ownerId = qs.get("ownerId");
      const planId = qs.get("planId");
      const rows = db.requests
        .filter(
          (r) =>
            (!status || r.status === status) &&
            (!ownerId || r.owner === ownerId) &&
            (!planId || r.plan === planId) &&
            matches(
              qs.get("search"),
              r.coveredPersonSnapshot.fullName,
              summaryOf(db, r.owner).name,
              r.contactPerson,
            ),
        )
        .sort(newestFirst)
        .map((r) => {
          const plan = db.plans.find((p) => p._id === r.plan);
          return {
            ...r,
            owner: summaryOf(db, r.owner),
            plan: {
              _id: r.plan,
              packageDetails: plan && { name: plan.packageDetails.name },
            },
          };
        });
      return paginate(rows, qs);
    },
  ],
  [
    "GET",
    /^\/service-requests\/([^/]+)$/,
    ({ db, params: [id] }) => {
      const request = db.requests.find((r) => r._id === id);
      if (!request) throw notFound("Service request");
      return { request, documents: request.documents };
    },
  ],
  [
    "PATCH",
    /^\/service-requests\/([^/]+)\/status$/,
    ({ db, body, params: [id] }) => {
      const r = db.requests.find((x) => x._id === id);
      if (!r) throw notFound("Service request");
      const current = r.documents.filter((d) => !d.replacedBy);
      if (
        body.status === "Docs_Verified" &&
        (current.length === 0 ||
          current.some((d) => d.verificationStatus !== "Approved"))
      )
        throw bad("Approve every current document first.");
      r.status = body.status;
      r.updatedAt = nowIso();
      if (body.status === "Rejected") r.rejectionReason = body.reason;
      if (body.status === "More_Info_Required") r.moreInfoReason = body.reason;
      if (body.status === "Approved") r.approvedAt = nowIso();
      audit(
        db,
        `service_request.${String(body.status).toLowerCase()}`,
        r._id,
        `${r.coveredPersonSnapshot.fullName}'s service request`,
      );
      return r;
    },
  ],
  [
    "PATCH",
    /^\/service-requests\/([^/]+)\/assign-photographer$/,
    ({ db, body, params: [id] }) => {
      const r = db.requests.find((x) => x._id === id);
      if (!r) throw notFound("Service request");
      if (r.status !== "Approved")
        throw bad("Only approved requests can be assigned a photographer.");
      const phone = String(body.photographerPhoneNo || "").trim();
      if (!phone) throw bad("photographerPhoneNo is required.");
      r.status = "Closed";
      r.photographerName = String(body.photographerName || "").trim();
      r.photographerPhoneNo = phone;
      r.photographerAssignedAt = nowIso();
      r.updatedAt = nowIso();
      audit(
        db,
        "service_request.photographer_assigned",
        r._id,
        `${r.coveredPersonSnapshot.fullName}'s service request`,
      );
      return r;
    },
  ],
  [
    "PATCH",
    /^\/service-requests\/([^/]+)\/documents\/([^/]+)\/verify$/,
    ({ db, body, params: [id, docId] }) => {
      const r = db.requests.find((x) => x._id === id);
      const doc = r?.documents.find((d) => d._id === docId);
      if (!r || !doc) throw notFound("Document");
      if (body.verificationStatus === "Requires_Resubmission" && !body.reason)
        throw bad("Tell the customer why a new copy is needed.");
      doc.verificationStatus = body.verificationStatus;
      doc.rejectionReason = body.reason;
      doc.verifiedAt = nowIso();
      doc.updatedAt = nowIso();
      const current = r.documents.filter((d) => !d.replacedBy);
      if (body.verificationStatus === "Requires_Resubmission") {
        r.status = "More_Info_Required";
        r.moreInfoReason = body.reason;
      } else if (current.every((d) => d.verificationStatus === "Approved")) {
        r.status = "Docs_Verified";
      }
      r.updatedAt = nowIso();
      return doc;
    },
  ],
  [
    "GET",
    /^\/service-requests\/([^/]+)\/documents\/([^/]+)\/download-url$/,
    ({ db, params: [id, docId] }) => {
      const doc = db.requests
        .find((r) => r._id === id)
        ?.documents.find((d) => d._id === docId);
      if (!doc) throw notFound("Document");
      return {
        document: {
          _id: doc._id,
          documentType: doc.documentType,
          verificationStatus: doc.verificationStatus,
        },
        url: `${window.location.origin}/#mock-document-${doc._id}`,
        expiresIn: 300,
      };
    },
  ],

  /* -------------------------------- Packages ------------------------------- */
  [
    "GET",
    /^\/packages\/admin$/,
    ({ db, qs }) => {
      const isActive = qs.get("isActive");
      const rows = db.packages.filter(
        (p) =>
          (isActive === null || String(p.isActive) === isActive) &&
          matches(qs.get("search"), p.name, p.description),
      );
      return paginate(rows, qs);
    },
  ],
  [
    "POST",
    /^\/packages$/,
    ({ db, body }) => {
      if (!String(body.name || "").trim()) throw bad("Name is required.");
      const pkg: AdminPackage = {
        _id: `pkg_${Date.now()}`,
        name: String(body.name).trim(),
        description: body.description ?? "",
        features: body.features ?? [],
        // The API takes major units and stores minor units.
        amount: Math.round(Number(body.amount) * 100),
        currency: body.currency ?? "NGN",
        billingInterval: "monthly",
        isActive: body.isActive ?? true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.packages.push(pkg);
      audit(db, "package.created", pkg._id, pkg.name);
      return pkg;
    },
  ],
  [
    "PATCH",
    /^\/packages\/([^/]+)$/,
    ({ db, body, params: [id] }) => {
      const pkg = db.packages.find((p) => p._id === id);
      if (!pkg) throw notFound("Package");
      const { amount, ...rest } = body;
      Object.assign(pkg, rest, {
        ...(amount !== undefined && {
          amount: Math.round(Number(amount) * 100),
        }),
        updatedAt: nowIso(),
      });
      audit(db, "package.updated", pkg._id, pkg.name);
      return pkg;
    },
  ],
  [
    "POST",
    /^\/packages\/([^/]+)\/sync-paystack$/,
    ({ db, params: [id] }) => {
      const pkg = db.packages.find((p) => p._id === id);
      if (!pkg) throw notFound("Package");
      pkg.updatedAt = nowIso();
      audit(db, "package.synced", pkg._id, pkg.name);
      return pkg;
    },
  ],

  /* -------------------------------- Contact -------------------------------- */
  [
    "GET",
    /^\/contact\/admin$/,
    ({ db, qs }) =>
      paginate(
        db.contacts
          .filter((c) => matches(qs.get("search"), c.name, c.email))
          .sort(newestFirst),
        qs,
      ),
  ],
  [
    "GET",
    /^\/contact\/admin\/([^/]+)$/,
    ({ db, params: [id] }) => {
      const msg = db.contacts.find((c) => c._id === id);
      if (!msg) throw notFound("Message");
      return msg;
    },
  ],

  /* ------------------------------- Audit log ------------------------------- */
  [
    "GET",
    /^\/audit-logs$/,
    ({ db, qs }) => {
      const from = qs.get("startDate") ?? qs.get("from");
      const to = qs.get("endDate") ?? qs.get("to");
      const action = qs.get("action");
      const resourceType = qs.get("resourceType");
      const resourceId = qs.get("resourceId");
      return paginate(
        db.audit
          .filter(
            (e) =>
              (!action || e.action === action) &&
              (!resourceType || e.resourceType === resourceType) &&
              (!resourceId || e.resourceId === resourceId) &&
              inRange(e.createdAt, from, to),
          )
          .sort(newestFirst),
        qs,
      );
    },
  ],
  [
    "GET",
    /^\/audit-logs\/([^/]+)$/,
    ({ db, params: [id] }) => {
      const entry = db.audit.find((e) => e._id === id);
      if (!entry) throw notFound("Audit log");
      return entry;
    },
  ],
  [
    "DELETE",
    /^\/audit-logs\/([^/]+)$/,
    ({ db, params: [id] }) => {
      const i = db.audit.findIndex((e) => e._id === id);
      if (i < 0) throw notFound("Audit log");
      const [removed] = db.audit.splice(i, 1);
      return { ...removed, actor: removed.actor?._id ?? null };
    },
  ],

  /* ----------------------------- Notifications ----------------------------- */
  [
    "GET",
    /^\/notifications\/admin$/,
    ({ db, qs }) => {
      const isRead = qs.get("isRead");
      const title = qs.get("title");
      const items = db.notifications
        .filter(
          (n) =>
            (isRead === null || String(n.isRead) === isRead) &&
            matches(title, n.title) &&
            inRange(n.createdAt, qs.get("from"), qs.get("to")),
        )
        .sort(newestFirst);
      return {
        ...paginate(items, qs),
        counts: {
          totalNotifications: db.notifications.length,
          totalUnreadNotifications: db.notifications.filter((n) => !n.isRead)
            .length,
        },
      };
    },
  ],
  [
    "PATCH",
    /^\/notifications\/([^/]+)\/read$/,
    ({ db, params: [id] }) => {
      const n = db.notifications.find((x) => x._id === id);
      if (!n) throw notFound("Notification");
      n.isRead = true;
      return n;
    },
  ],
  [
    "DELETE",
    /^\/notifications\/([^/]+)$/,
    ({ db, params: [id] }) => {
      const i = db.notifications.findIndex((x) => x._id === id);
      if (i < 0) throw notFound("Notification");
      return db.notifications.splice(i, 1)[0];
    },
  ],
];

export async function mockRequest(
  method: string,
  path: string,
  body: unknown,
): Promise<unknown | typeof NOT_MOCKED> {
  const [pathname, search = ""] = path.split("?");
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue;
    const match = pattern.exec(pathname);
    if (!match) continue;

    await sleep(150);
    const db = load();
    const result = handler({
      db,
      body: (body ?? {}) as Body,
      qs: new URLSearchParams(search),
      params: match.slice(1).map(decodeURIComponent),
    });
    if (method !== "GET") save(db);
    // Hand out copies so callers can't mutate the store.
    return structuredClone(result);
  }
  return NOT_MOCKED;
}
