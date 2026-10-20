/**
 * In-browser database for demo mode. Persisted in localStorage so changes survive reloads.
 * Seeded with realistic sample data; shared shape for both the customer app and the admin console.
 */
export type Role = "customer" | "admin" | "super_admin";

export interface User { _id: string; name: string; email: string; phone?: string; password: string; role: Role; isSuperAdmin: boolean; createdAt: string }
export interface Pkg {
  _id: string; name: string; description: string; photographyIncluded: boolean; videographyIncluded: boolean; coverageDetails: string;
  deliverables: string[]; monthlyContributionMinor: number; currency: string; isActive: boolean;
}
export interface CoveredPerson { fullName: string; dateOfBirth?: string; age?: number; gender?: string; relationship: string; address: string; phoneNumber?: string }
export interface Plan {
  _id: string; owner: string; package: string; packageSnapshot: Pkg; coveredPerson: CoveredPerson; contributionAmountMinor: number; currency: string;
  billingFrequency: "monthly"; startDate: string; nextPaymentDate: string; totalContributedMinor: number; status: string; coverageStatus: string;
  lastPaymentAt?: string; createdAt: string; updatedAt: string;
}
export interface Payment {
  _id: string; owner: string; plan: string; amountMinor: number; currency: string; reference: string; purpose: "initial_contribution" | "recurring_contribution";
  status: string; failureMessage?: string; processedAt?: string; createdAt: string; updatedAt: string;
}
export interface Request {
  _id: string; owner: string; plan: string; coveredPersonSnapshot: CoveredPerson; dateOfDeath: string; burialLocation: string; expectedBurialDate: string;
  contactPerson: string; contactPhone: string; additionalInformation?: string; status: string; rejectionReason?: string; moreInfoReason?: string;
  verifiedAt?: string; approvedAt?: string; rejectedAt?: string; createdAt: string; updatedAt: string;
}
export interface Doc {
  _id: string; serviceRequest: string; owner: string; plan: string; file: string; documentType: string; verificationStatus: string;
  rejectionReason?: string; uploadedAt: string; replacedBy?: string;
}
export interface Note { _id: string; owner: string; plan?: string; event: string; subject: string; status: string; channel: "email"; createdAt: string }
export interface Card { _id: string; owner: string; brand: string; last4: string; expMonth: number; expYear: number; isDefault: boolean }
export interface Audit { _id: string; actor?: string; actorName?: string; action: string; resourceType: string; resourceId: string; resourceLabel?: string; createdAt: string }
export interface Pending { fileId: string; requestId: string; fileName: string; contentType: string; size: number; documentType: string }

export interface DB {
  seq: number;
  users: User[]; packages: Pkg[]; plans: Plan[]; payments: Payment[]; requests: Request[]; documents: Doc[];
  notifications: Note[]; cards: Card[]; audit: Audit[]; prefs: Record<string, Record<string, boolean>>; uploads: Pending[];
}

const KEY = "jh_demo_db_v2";
let cache: DB | null = null;

export function getDb(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw) as DB;
      return cache;
    }
  } catch {
    /* fall through to a fresh seed */
  }
  cache = seed();
  save();
  return cache;
}

export function save() {
  try {
    if (cache) localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable: changes last until reload */
  }
}

export function resetDemoData() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const nextId = (db: DB, prefix: string) => `${prefix}_${++db.seq}`;
export const nowIso = () => new Date().toISOString();

export function addMonths(iso: string, n: number) {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + n);
  return d.toISOString();
}

function at(daysFromNow: number, hour = 9, minute = 14) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const DEMO_ACCOUNTS = {
  customer: { email: "demo@journeyhome.ng", password: "demo1234" },
  admin: { email: "ops@journeyhome.ng", password: "admin123" },
};

function seed(): DB {
  const user = (id: string, name: string, email: string, daysAgo: number, role: Role = "customer", phone?: string): User => ({
    _id: id, name, email, phone, password: role === "customer" ? "demo1234" : "admin123", role, isSuperAdmin: role === "super_admin", createdAt: at(-daysAgo),
  });
  const users: User[] = [
    user("a1", "Ops Admin", "ops@journeyhome.ng", 500, "super_admin"),
    user("a2", "Finance Admin", "finance@journeyhome.ng", 400, "admin"),
    user("c1", "Chidi Okafor", "demo@journeyhome.ng", 300, "customer", "+234 802 345 6789"),
    user("c2", "Grace Adebayo", "grace@example.com", 100),
    user("c3", "Musa Lawal", "musa@example.com", 60),
    user("c4", "Bisi Oyelaran", "bisi@example.com", 200),
    user("c5", "Funke Adeyemi", "funke@example.com", 90),
    user("c6", "Ifeanyi Nwosu", "ifeanyi@example.com", 400),
  ];

  const pkg = (id: string, name: string, price: number, photo: boolean, video: boolean, coverage: string, deliverables: string[]): Pkg => ({
    _id: id, name, description: `${name} burial coverage package`, photographyIncluded: photo, videographyIncluded: video, coverageDetails: coverage,
    deliverables, monthlyContributionMinor: price, currency: "NGN", isActive: true,
  });
  const packages = [
    pkg("k1", "Basic", 500000, true, false, "Half-day photography", ["Half-day photography", "Digital gallery", "Dedicated coordinator"]),
    pkg("k2", "Standard", 1000000, true, true, "Full-day photography & video", ["Full-day photography & video", "Edited keepsake film", "Printed album, 40 pages", "Digital gallery for family abroad"]),
    pkg("k3", "Premium", 1800000, true, true, "Full-day, second camera", ["Everything in Standard", "Second videographer", "Drone coverage, where permitted", "Premium leather album"]),
  ];
  const pk = (id: string) => packages.find((p) => p._id === id)!;

  type P = [id: string, owner: string, person: string, rel: string, gender: string, dob: string, pkgId: string, status: string, n: number, startAgo: number, nextIn: number, address: string];
  const planRows: P[] = [
    ["p1", "c1", "Emeka Okafor", "father", "male", "1951-03-14", "k2", "Active", 12, 330, 3, "14 Awolowo Road, Ikoyi, Lagos"],
    ["p2", "c1", "Ngozi Okafor", "mother", "female", "1955-08-02", "k2", "Payment_Due", 12, 330, 0, "14 Awolowo Road, Ikoyi, Lagos"],
    ["p3", "c1", "Adaeze Nwosu", "grandmother", "female", "1944-11-21", "k3", "Under_Review", 8, 240, 10, "7 Ikeja Way, Ikeja, Lagos"],
    ["p4", "c1", "Ifeanyi Nwosu", "grandfather", "male", "1940-01-09", "k1", "Completed", 9, 400, 10, "22 Ring Road, Ibadan, Oyo"],
    ["p5", "c4", "Tola Bello", "aunt", "female", "1962-06-30", "k1", "Paused", 3, 120, 14, "3 Adetokunbo Ademola St, Victoria Island, Lagos"],
    ["p6", "c4", "Rasheed Oyelaran", "uncle", "male", "1958-04-12", "k2", "Cancelled", 4, 200, 14, "9 Bode Thomas St, Surulere, Lagos"],
    ["p7", "c3", "Kemi Lawal", "mother", "female", "1949-12-05", "k2", "Approved", 10, 300, 8, "5 Gwarinpa Estate, Abuja (FCT)"],
    ["p8", "c5", "Adesuwa Adeyemi", "mother", "female", "1953-09-18", "k3", "Active", 6, 190, 11, "18 Ogui Road, Enugu"],
    ["p9", "c2", "Samuel Adebayo", "father", "male", "1947-07-27", "k1", "Service_Request", 5, 150, 6, "7 Ikeja Way, Ikeja, Lagos"],
  ];
  const plans: Plan[] = planRows.map(([id, owner, fullName, relationship, gender, dob, pid, status, n, startAgo, nextIn, address]) => {
    const p = pk(pid);
    return {
      _id: id, owner, package: pid, packageSnapshot: p,
      coveredPerson: { fullName, relationship, gender, dateOfBirth: `${dob}T00:00:00.000Z`, address, phoneNumber: "0803 212 7765" },
      contributionAmountMinor: p.monthlyContributionMinor, currency: "NGN", billingFrequency: "monthly", startDate: at(-startAgo),
      nextPaymentDate: at(nextIn, 0, 0), totalContributedMinor: n * p.monthlyContributionMinor, status, coverageStatus: "Covered",
      lastPaymentAt: n > 0 ? at(status === "Payment_Due" ? -32 : -27) : undefined, createdAt: at(-startAgo), updatedAt: at(-3),
    };
  });

  const payments: Payment[] = [];
  let seq = 100;
  for (const p of plans) {
    const n = Math.round(p.totalContributedMinor / p.contributionAmountMinor);
    const last = p.lastPaymentAt ? new Date(p.lastPaymentAt).getTime() : 0;
    for (let i = 0; i < n; i++) {
      const d = new Date(last - i * 30 * 864e5).toISOString();
      payments.push({
        _id: `pay_${++seq}`, owner: p.owner, plan: p._id, amountMinor: p.contributionAmountMinor, currency: "NGN",
        reference: `jh_${i === n - 1 ? "init" : "rec"}_${82000 - seq}`, purpose: i === n - 1 ? "initial_contribution" : "recurring_contribution",
        status: "Successful", processedAt: d, createdAt: d, updatedAt: d,
      });
    }
  }
  payments.push(
    { _id: `pay_${++seq}`, owner: "c4", plan: "p5", amountMinor: 500000, currency: "NGN", reference: `jh_rec_${82000 - seq}`, purpose: "recurring_contribution", status: "Failed", failureMessage: "Insufficient funds", createdAt: at(-8), updatedAt: at(-8) },
    { _id: `pay_${++seq}`, owner: "c5", plan: "p8", amountMinor: 1800000, currency: "NGN", reference: `jh_rec_${82000 - seq}`, purpose: "recurring_contribution", status: "Pending", createdAt: at(-1), updatedAt: at(-1) },
    { _id: `pay_${++seq}`, owner: "c4", plan: "p6", amountMinor: 4000000, currency: "NGN", reference: `jh_rec_${82000 - seq}`, purpose: "recurring_contribution", status: "Refunded", processedAt: at(-50), createdAt: at(-50), updatedAt: at(-50) },
  );

  const snap = (planId: string) => plans.find((p) => p._id === planId)!.coveredPerson;
  const requests: Request[] = [
    { _id: "r1", owner: "c1", plan: "p3", coveredPersonSnapshot: snap("p3"), dateOfDeath: at(-14), burialLocation: "St. Peter's Church, Ikeja, Lagos", expectedBurialDate: at(6), contactPerson: "Chidi Okafor", contactPhone: "0802 345 6789", additionalInformation: "Family would like the keepsake film to include the recessional hymn.", status: "Under_Review", createdAt: at(-10), updatedAt: at(-9) },
    { _id: "r2", owner: "c1", plan: "p4", coveredPersonSnapshot: snap("p4"), dateOfDeath: at(-260), burialLocation: "Ring Road Chapel, Ibadan, Oyo", expectedBurialDate: at(-250), contactPerson: "Chidi Okafor", contactPhone: "0802 345 6789", status: "Approved", approvedAt: at(-255), verifiedAt: at(-257), createdAt: at(-262), updatedAt: at(-255) },
    { _id: "r3", owner: "c3", plan: "p7", coveredPersonSnapshot: snap("p7"), dateOfDeath: at(-12), burialLocation: "Gwarinpa Cemetery, Abuja (FCT)", expectedBurialDate: at(8), contactPerson: "Musa Lawal", contactPhone: "0809 300 4000", status: "Approved", approvedAt: at(-5), verifiedAt: at(-6), createdAt: at(-9), updatedAt: at(-5) },
    { _id: "r4", owner: "c2", plan: "p9", coveredPersonSnapshot: snap("p9"), dateOfDeath: at(-3), burialLocation: "Ikeja Parish Hall, Lagos", expectedBurialDate: at(11), contactPerson: "Grace Adebayo", contactPhone: "0802 441 9930", status: "Submitted", createdAt: at(-2), updatedAt: at(-2) },
  ];
  const doc = (id: string, reqId: string, owner: string, plan: string, type: string, status: string, ago: number): Doc => ({
    _id: id, serviceRequest: reqId, owner, plan, file: `f_${id}`, documentType: type, verificationStatus: status, uploadedAt: at(-ago),
  });
  const documents: Doc[] = [
    doc("d1", "r1", "c1", "p3", "Death_Certificate", "Pending", 9), doc("d2", "r1", "c1", "p3", "Valid_Identification", "Pending", 9),
    doc("d3", "r2", "c1", "p4", "Death_Certificate", "Approved", 261), doc("d4", "r2", "c1", "p4", "Valid_Identification", "Approved", 261),
    doc("d5", "r3", "c3", "p7", "Death_Certificate", "Approved", 8), doc("d6", "r3", "c3", "p7", "Valid_Identification", "Approved", 8),
    doc("d7", "r4", "c2", "p9", "Death_Certificate", "Pending", 2), doc("d8", "r4", "c2", "p9", "Valid_Identification", "Pending", 2),
  ];

  let n = 0;
  const note = (owner: string, event: string, plan: string | undefined, ago: number, hour = 9): Note => ({
    _id: `n_${++n}`, owner, plan, event, subject: event, status: "Sent", channel: "email", createdAt: at(-ago, hour),
  });
  const notifications: Note[] = [
    note("c1", "UpcomingContribution", "p2", 0, 8), note("c1", "RecurringPaymentSuccess", "p1", 27), note("c1", "RecurringPaymentSuccess", "p2", 32),
    note("c1", "RecurringPaymentFailure", "p2", 65, 6), note("c1", "InitialPaymentSuccess", "p1", 330),
    note("c1", "ServiceRequestReceived", "p3", 10), note("c2", "ServiceRequestReceived", "p9", 2),
    note("c3", "ServiceRequestApproved", "p7", 5), note("c1", "ServiceCompleted", "p4", 240),
  ];

  const audit: Audit[] = [
    ["a1", "Ops Admin", "service_request.viewed_by_admin", "r1", "Adaeze Nwosu's service request", 1],
    ["a1", "Ops Admin", "service_request.approved", "r3", "Kemi Lawal's service request", 5],
    ["a1", "Ops Admin", "service_request.docs_verified", "r3", "Kemi Lawal's service request", 6],
    ["c1", "Chidi Okafor", "service_request.created", "r1", "Adaeze Nwosu's service request", 10],
    ["a2", "Finance Admin", "service_request.viewed_by_admin", "r1", "Adaeze Nwosu's service request", 8],
    ["c2", "Grace Adebayo", "service_request.created", "r4", "Samuel Adebayo's service request", 2],
    ["a1", "Ops Admin", "service_request.approved", "r2", "Ifeanyi Nwosu's service request", 255],
    ["c1", "Chidi Okafor", "service_request.created", "r2", "Ifeanyi Nwosu's service request", 262],
  ].map(([actor, actorName, action, resourceId, resourceLabel, ago], i) => ({
    _id: `au_${i + 1}`, actor: actor as string, actorName: actorName as string, action: action as string, resourceType: "ServiceRequest",
    resourceId: resourceId as string, resourceLabel: resourceLabel as string, createdAt: at(-(ago as number), 8 + (i % 9)),
  }));

  return {
    seq: 1000, users, packages, plans, payments, requests, documents, notifications, audit, uploads: [],
    cards: [{ _id: "card_1", owner: "c1", brand: "Visa", last4: "4821", expMonth: 9, expYear: 2029, isDefault: true }],
    prefs: {},
  };
}
