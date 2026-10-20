import { ApiError } from "./errors";
import { addMonths, getDb, nextId, nowIso, save, type Audit, type DB, type Doc, type Payment, type Plan, type Request, type User } from "./db";

export const NOT_MOCKED = Symbol("not-mocked");
export const DEMO_CODE = "123456";
export const DEMO_RESET_TOKEN = "demo-token";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const bad = (m: string) => new ApiError(400, m);
const notFound = (m: string) => new ApiError(404, m);

// ---- files: uploads in demo mode never leave the browser ----------------------------------------------------------
const demoFiles = new Map<string, File>();

/** Used by the apps in place of the real storage PUT when the upload URL is a demo one. */
export const isDemoUploadUrl = (url: string) => url.startsWith("demo://");
export function registerDemoFile(url: string, file: File) {
  demoFiles.set(url.replace("demo://upload/", ""), file);
}

function previewUrl(fileId: string, label: string) {
  const file = demoFiles.get(fileId);
  if (file) return URL.createObjectURL(file);
  const html = `<!doctype html><meta charset="utf-8"><title>${label}</title><body style="font-family:system-ui;padding:48px;max-width:560px;margin:auto"><h1>${label}</h1><p>This is a placeholder for a sample document in the demo. Documents you upload yourself open as the real file during the same session.</p></body>`;
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}

// ---- helpers ------------------------------------------------------------------------------------------------------
interface Ctx { params: Record<string, string>; body: Record<string, any>; query: URLSearchParams; user?: User; db: DB }

const publicUser = (u: User) => ({ id: u._id, email: u.email, name: u.name, role: u.role, isSuperAdmin: u.isSuperAdmin });
const isAdmin = (u?: User) => !!u && u.role !== "customer";
const first = (full: string) => full.trim().split(/\s+/)[0];

function need(c: Ctx): User {
  if (!c.user) throw new ApiError(401, "Token not found");
  return c.user;
}
function adminOnly(c: Ctx): User {
  const u = need(c);
  if (!isAdmin(u)) throw new ApiError(403, "Unauthorized to perform action");
  return u;
}
function superOnly(c: Ctx): User {
  const u = need(c);
  if (!u.isSuperAdmin && u.role !== "super_admin") throw new ApiError(403, "Unauthorized to perform action");
  return u;
}

function notify(db: DB, owner: string, event: string, plan?: string) {
  db.notifications.push({ _id: nextId(db, "n"), owner, plan, event, subject: event, status: "Sent", channel: "email", createdAt: nowIso() });
}
function record(db: DB, actor: User, action: string, req: Request) {
  const entry: Audit = {
    _id: nextId(db, "au"), actor: actor._id, actorName: actor.name, action, resourceType: "ServiceRequest", resourceId: req._id,
    resourceLabel: `${req.coveredPersonSnapshot.fullName}'s service request`, createdAt: nowIso(),
  };
  db.audit.push(entry);
}
const ownerPlan = (c: Ctx, id: string): Plan => {
  const p = c.db.plans.find((x) => x._id === id);
  if (!p || (!isAdmin(c.user) && p.owner !== c.user?._id)) throw notFound("Plan not found");
  return p;
};
const touch = <T extends { updatedAt: string }>(x: T) => { x.updatedAt = nowIso(); return x; };
const byNewest = <T extends { createdAt: string }>(list: T[]) => [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

const TRANSITIONS: Record<string, string[]> = {
  Pending: ["Active", "Cancelled"], Active: ["Payment_Due", "Paused", "Service_Request", "Cancelled"],
  Payment_Due: ["Active", "Overdue", "Paused", "Cancelled"], Overdue: ["Active", "Paused", "Cancelled", "Expired"], Paused: ["Active", "Cancelled"],
  Service_Request: ["Under_Review", "Cancelled"], Under_Review: ["Approved", "Cancelled"], Approved: ["Service_Scheduled", "Cancelled"],
  Service_Scheduled: ["Completed", "Cancelled"], Completed: [], Cancelled: [], Expired: [],
};

const CUSTOMER_PREFS = { paymentReminders: true, deficitAlerts: true, serviceUpdates: true, productNews: false };
const ADMIN_PREFS = { newServiceRequest: true, paymentFailed: true, weeklyDigest: false };
const prefsFor = (db: DB, u: User) => ({ ...(isAdmin(u) ? ADMIN_PREFS : CUSTOMER_PREFS), ...(db.prefs[u._id] ?? {}) });

// ---- routes -------------------------------------------------------------------------------------------------------
type Handler = (c: Ctx) => unknown;
const routes: [method: string, pattern: string, handler: Handler][] = [];
const route = (method: string, pattern: string, handler: Handler) => routes.push([method, pattern, handler]);

// auth
route("POST", "/auth/signup", ({ db, body }) => {
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (name.length < 2) throw bad("Name is required");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw bad("Invalid email format");
  if (String(body.password ?? "").length < 6) throw bad("Password must be at least 6 characters");
  if (db.users.some((u) => u.email === email)) throw new ApiError(409, "An account with this email already exists");
  const u: User = { _id: nextId(db, "c"), name, email, phone: body.phone ? String(body.phone) : undefined, password: String(body.password), role: "customer", isSuperAdmin: false, createdAt: nowIso() };
  db.users.push(u);
  return { user: publicUser(u), token: `demo.${u._id}` };
});
const login = (adminOnlyLogin: boolean): Handler => ({ db, body }) => {
  const u = db.users.find((x) => x.email === String(body.email ?? "").trim().toLowerCase() && x.password === body.password);
  if (!u || (adminOnlyLogin && u.role === "customer")) throw new ApiError(401, "Invalid email or password");
  return { user: publicUser(u), token: `demo.${u._id}` };
};
route("POST", "/auth/login", login(false));
route("POST", "/auth/admin/login", login(true));
route("POST", "/auth/verification/send", () => ({ sent: true }));
route("POST", "/auth/verification/confirm", ({ body }) => {
  if (body.code !== DEMO_CODE) throw bad("That code is incorrect or has expired.");
  return { verified: true };
});
route("POST", "/auth/forgot-password", () => ({ sent: true }));
route("POST", "/auth/reset-password", ({ body }) => {
  if (body.token !== DEMO_RESET_TOKEN) throw bad("This reset link is invalid or has expired.");
  if (String(body.password ?? "").length < 6) throw bad("Password must be at least 6 characters.");
  return { reset: true };
});

// me
route("GET", "/auth/me", (c) => {
  const u = need(c);
  return { id: u._id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt, preferences: prefsFor(c.db, u) };
});
route("PATCH", "/auth/me", (c) => {
  const u = need(c);
  if (c.body.name !== undefined) {
    if (String(c.body.name).trim().length < 2) throw bad("Please enter your full name.");
    u.name = String(c.body.name).trim();
  }
  if (c.body.phone !== undefined) u.phone = String(c.body.phone).trim();
  if (c.body.email) {
    const email = String(c.body.email).trim().toLowerCase();
    if (c.db.users.some((x) => x.email === email && x._id !== u._id)) throw new ApiError(409, "That email is already in use");
    u.email = email;
  }
  return { id: u._id, name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt };
});
route("PATCH", "/auth/me/password", (c) => {
  const u = need(c);
  if (c.body.currentPassword !== u.password) throw bad("Your current password is incorrect.");
  if (String(c.body.newPassword ?? "").length < 6) throw bad("New password must be at least 6 characters.");
  u.password = String(c.body.newPassword);
  return { changed: true };
});
route("PATCH", "/auth/me/preferences", (c) => {
  const u = need(c);
  c.db.prefs[u._id] = { ...(c.db.prefs[u._id] ?? {}), ...(c.body as Record<string, boolean>) };
  return prefsFor(c.db, u);
});
route("DELETE", "/auth/me", (c) => {
  const u = need(c);
  const db = c.db;
  db.users = db.users.filter((x) => x._id !== u._id);
  db.plans = db.plans.filter((x) => x.owner !== u._id);
  db.payments = db.payments.filter((x) => x.owner !== u._id);
  db.requests = db.requests.filter((x) => x.owner !== u._id);
  db.notifications = db.notifications.filter((x) => x.owner !== u._id);
  db.cards = db.cards.filter((x) => x.owner !== u._id);
  return { closed: true };
});
route("POST", "/auth/sessions/revoke-others", (c) => { need(c); return { revoked: 2 }; });

// admin team + customers
route("GET", "/auth/customers", (c) => {
  adminOnly(c);
  return c.db.users.filter((u) => u.role === "customer").map((u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })).reverse();
});
route("GET", "/auth/admins", (c) => {
  superOnly(c);
  return c.db.users.filter((u) => u.role !== "customer").map(publicUser);
});
route("POST", "/auth/admin", (c) => {
  superOnly(c);
  const email = String(c.body.email ?? "").trim().toLowerCase();
  if (c.db.users.some((u) => u.email === email)) throw new ApiError(409, "Admin with this email already exists");
  if (String(c.body.password ?? "").length < 6) throw bad("Password must be at least 6 characters");
  const u: User = { _id: nextId(c.db, "a"), name: String(c.body.name ?? "Admin").trim() || "Admin", email, password: String(c.body.password), role: "admin", isSuperAdmin: false, createdAt: nowIso() };
  c.db.users.push(u);
  return publicUser(u);
});
route("DELETE", "/auth/admin/:id", (c) => {
  superOnly(c);
  const target = c.db.users.find((u) => u._id === c.params.id && u.role !== "customer");
  if (!target) throw notFound("Admin not found");
  if (target.isSuperAdmin || target.role === "super_admin") throw bad("A super admin can't be removed");
  c.db.users = c.db.users.filter((u) => u._id !== target._id);
  return { deleted: true };
});

// packages
route("GET", "/packages", ({ db }) => db.packages.filter((p) => p.isActive));
route("GET", "/packages/admin", (c) => { adminOnly(c); return c.db.packages; });
route("GET", "/packages/:id", (c) => {
  need(c);
  const p = c.db.packages.find((x) => x._id === c.params.id);
  if (!p || (!p.isActive && !isAdmin(c.user))) throw notFound("Package not found");
  return p;
});
route("PATCH", "/packages/:id", (c) => {
  adminOnly(c);
  const p = c.db.packages.find((x) => x._id === c.params.id);
  if (!p) throw notFound("Package not found");
  if (c.body.monthlyContributionMinor !== undefined) {
    if (!Number.isInteger(c.body.monthlyContributionMinor) || c.body.monthlyContributionMinor <= 0) throw bad("Price must be a positive amount");
    p.monthlyContributionMinor = c.body.monthlyContributionMinor;
  }
  if (typeof c.body.isActive === "boolean") p.isActive = c.body.isActive;
  return p;
});

// plans
route("POST", "/plans", (c) => {
  const u = need(c);
  const pkg = c.db.packages.find((p) => p._id === c.body.packageId && p.isActive);
  if (!pkg) throw notFound("Package not found");
  const cp = c.body.coveredPerson ?? {};
  if (String(cp.fullName ?? "").trim().length < 2) throw bad("Covered person's name is required");
  if (String(cp.relationship ?? "").trim().length < 2) throw bad("Relationship is required");
  if (String(cp.address ?? "").trim().length < 5) throw bad("Address is required");
  if (!cp.dateOfBirth && cp.age === undefined) throw bad("Either dateOfBirth or age is required");
  const now = nowIso();
  const plan: Plan = {
    _id: nextId(c.db, "p"), owner: u._id, package: pkg._id, packageSnapshot: { ...pkg }, coveredPerson: cp,
    contributionAmountMinor: pkg.monthlyContributionMinor, currency: pkg.currency, billingFrequency: "monthly", startDate: now,
    nextPaymentDate: addMonths(now, 1), totalContributedMinor: 0, status: "Pending", coverageStatus: "Pending", createdAt: now, updatedAt: now,
  };
  c.db.plans.push(plan);
  return plan;
});
route("GET", "/plans", (c) => byNewest(c.db.plans.filter((p) => p.owner === need(c)._id)));
route("GET", "/plans/admin", (c) => { adminOnly(c); return byNewest(c.db.plans); });
route("GET", "/plans/:id", (c) => { need(c); return ownerPlan(c, c.params.id); });
route("PATCH", "/plans/:id/status", (c) => {
  adminOnly(c);
  const plan = ownerPlan(c, c.params.id);
  const to = String(c.body.status);
  if (!(TRANSITIONS[plan.status] ?? []).includes(to)) throw bad(`Plan cannot transition from ${plan.status} to ${to}`);
  plan.status = to;
  touch(plan);
  return plan;
});

// payments
route("POST", "/payments/plans/:planId/initialize-initial", (c) => {
  need(c);
  const plan = ownerPlan(c, c.params.planId);
  if (plan.status !== "Pending") throw bad("Initial checkout is only available for pending plans");
  let pay = c.db.payments.find((p) => p.plan === plan._id && p.purpose === "initial_contribution" && p.status !== "Successful");
  if (!pay) {
    const now = nowIso();
    pay = { _id: nextId(c.db, "pay"), owner: plan.owner, plan: plan._id, amountMinor: plan.contributionAmountMinor, currency: plan.currency, reference: `jh_init_${Math.random().toString(16).slice(2, 12)}`, purpose: "initial_contribution", status: "Processing", createdAt: now, updatedAt: now };
    c.db.payments.push(pay);
  }
  pay.status = "Processing";
  touch(pay);
  return { paymentId: pay._id, reference: pay.reference, accessCode: "demo", authorizationUrl: `${window.location.origin}/demo/checkout?reference=${pay.reference}` };
});
// Simulated Paystack: the demo checkout page reports the outcome here.
route("POST", "/__demo/checkout", (c) => {
  const pay = c.db.payments.find((p) => p.reference === c.body.reference);
  if (!pay) throw notFound("Payment not found");
  if (pay.status === "Successful") return pay;
  const plan = c.db.plans.find((p) => p._id === pay.plan)!;
  const now = nowIso();
  if (c.body.outcome === "success") {
    pay.status = "Successful";
    pay.processedAt = now;
    plan.status = "Active";
    plan.totalContributedMinor += pay.amountMinor;
    plan.lastPaymentAt = now;
    plan.nextPaymentDate = addMonths(now, 1);
    touch(plan);
    notify(c.db, pay.owner, "InitialPaymentSuccess", plan._id);
  } else if (c.body.outcome === "failed") {
    pay.status = "Failed";
    pay.failureMessage = "Your card was declined (simulated).";
    notify(c.db, pay.owner, "InitialPaymentFailure", plan._id);
  } else {
    pay.status = "Cancelled";
  }
  touch(pay);
  return pay;
});
route("POST", "/payments/verify/:reference", (c) => {
  need(c);
  const pay = c.db.payments.find((p) => p.reference === c.params.reference && (p.owner === c.user!._id || isAdmin(c.user)));
  if (!pay) throw notFound("Payment not found");
  return pay;
});
const withNames = (db: DB, p: Payment) => {
  const owner = db.users.find((u) => u._id === p.owner);
  const plan = db.plans.find((x) => x._id === p.plan);
  return { ...p, ownerName: owner?.name, planName: plan ? `${first(plan.coveredPerson.fullName)}'s plan` : undefined };
};
route("GET", "/payments/admin", (c) => { adminOnly(c); return byNewest(c.db.payments).map((p) => withNames(c.db, p)); });
route("GET", "/payments/methods", (c) => c.db.cards.filter((x) => x.owner === need(c)._id).map(({ owner: _o, ...card }) => card));
route("POST", "/payments/methods/initialize", (c) => {
  const u = need(c);
  const mine = c.db.cards.filter((x) => x.owner === u._id);
  c.db.cards.push({ _id: nextId(c.db, "card"), owner: u._id, brand: "Mastercard", last4: "1234", expMonth: 12, expYear: 2030, isDefault: mine.length === 0 });
  return { authorizationUrl: `${window.location.origin}/app/profile?card_added=1` };
});
route("DELETE", "/payments/methods/:id", (c) => {
  const u = need(c);
  c.db.cards = c.db.cards.filter((x) => !(x._id === c.params.id && x.owner === u._id));
  const mine = c.db.cards.filter((x) => x.owner === u._id);
  if (mine.length && !mine.some((x) => x.isDefault)) mine[0].isDefault = true;
  return { removed: true };
});
route("GET", "/payments", (c) => byNewest(c.db.payments.filter((p) => p.owner === need(c)._id)));
route("GET", "/payments/:id", (c) => {
  const p = c.db.payments.find((x) => x._id === c.params.id && x.owner === need(c)._id);
  if (!p) throw notFound("Payment not found");
  return p;
});

// notifications + audit
route("GET", "/notifications", (c) => byNewest(c.db.notifications.filter((n) => n.owner === need(c)._id)));
route("GET", "/audit-logs", (c) => { adminOnly(c); return byNewest(c.db.audit); });

// service requests
const ELIGIBLE = ["Active", "Payment_Due", "Overdue"];
const reqFor = (c: Ctx, id: string): Request => {
  const r = c.db.requests.find((x) => x._id === id);
  if (!r || (!isAdmin(c.user) && r.owner !== c.user?._id)) throw notFound("Service request not found");
  return r;
};
route("POST", "/service-requests", (c) => {
  const u = need(c);
  const plan = c.db.plans.find((p) => p._id === c.body.planId && p.owner === u._id);
  if (!plan) throw notFound("Plan not found");
  if (!ELIGIBLE.includes(plan.status)) throw bad("A service can only be requested for a plan that is active, payment due or overdue");
  const b = c.body;
  if (String(b.burialLocation ?? "").trim().length < 3) throw bad("Burial location is required");
  if (String(b.contactPerson ?? "").trim().length < 2) throw bad("Contact person is required");
  if (String(b.contactPhone ?? "").trim().length < 5) throw bad("Contact phone is required");
  const now = nowIso();
  const req: Request = {
    _id: nextId(c.db, "r"), owner: u._id, plan: plan._id, coveredPersonSnapshot: plan.coveredPerson, dateOfDeath: b.dateOfDeath, burialLocation: b.burialLocation,
    expectedBurialDate: b.expectedBurialDate, contactPerson: b.contactPerson, contactPhone: b.contactPhone, additionalInformation: b.additionalInformation,
    status: "Submitted", createdAt: now, updatedAt: now,
  };
  c.db.requests.push(req);
  plan.status = "Service_Request";
  touch(plan);
  notify(c.db, u._id, "ServiceRequestReceived", plan._id);
  record(c.db, u, "service_request.created", req);
  return req;
});
route("GET", "/service-requests", (c) => byNewest(c.db.requests.filter((r) => r.owner === need(c)._id)));
route("GET", "/service-requests/admin", (c) => { adminOnly(c); return byNewest(c.db.requests); });
route("GET", "/service-requests/:id", (c) => {
  const u = need(c);
  const r = reqFor(c, c.params.id);
  // Don't log a new "viewed" entry for every refetch: one per admin per request per 5 minutes.
  const recentView = c.db.audit.some(
    (a) => a.actor === u._id && a.resourceId === r._id && a.action === "service_request.viewed_by_admin" && Date.now() - +new Date(a.createdAt) < 5 * 60_000,
  );
  if (isAdmin(u) && !recentView) record(c.db, u, "service_request.viewed_by_admin", r);
  return { request: r, documents: c.db.documents.filter((d) => d.serviceRequest === r._id) };
});
route("POST", "/service-requests/:id/documents/upload-url", (c) => {
  const u = need(c);
  const r = reqFor(c, c.params.id);
  if (r.owner !== u._id) throw notFound("Service request not found");
  if (["Approved", "Rejected", "Cancelled"].includes(r.status)) throw bad("Documents cannot be uploaded for this service request status");
  const { documentType, fileName, contentType, size } = c.body;
  if (!["Death_Certificate", "Valid_Identification", "Other_Proof"].includes(documentType)) throw bad("Invalid document type");
  if (!["application/pdf", "image/jpeg", "image/png"].includes(contentType)) throw bad("Only PDF, JPG and PNG files are supported");
  if (!(size > 0) || size > 10 * 1024 * 1024) throw bad("Files can be up to 10MB");
  const fileId = nextId(c.db, "f");
  c.db.uploads.push({ fileId, requestId: r._id, fileName, contentType, size, documentType });
  return { fileId, uploadUrl: `demo://upload/${fileId}`, uploadToken: `tok_${fileId}`, storageKey: `service-requests/documents/${fileId}`, expiresIn: 3600 };
});
route("POST", "/service-requests/:id/documents/complete", (c) => {
  const u = need(c);
  const r = reqFor(c, c.params.id);
  const up = c.db.uploads.find((x) => x.fileId === c.body.fileId && x.requestId === r._id);
  if (!up || c.body.uploadToken !== `tok_${up.fileId}`) throw bad("Upload not found or expired");
  c.db.uploads = c.db.uploads.filter((x) => x !== up);
  const doc: Doc = { _id: nextId(c.db, "d"), serviceRequest: r._id, owner: u._id, plan: r.plan, file: up.fileId, documentType: c.body.documentType, verificationStatus: "Pending", uploadedAt: nowIso() };
  if (c.body.replacesDocumentId) {
    const old = c.db.documents.find((d) => d._id === c.body.replacesDocumentId && d.serviceRequest === r._id);
    if (old) old.replacedBy = doc._id;
    if (r.status === "More_Info_Required" && !c.db.documents.some((d) => d.serviceRequest === r._id && !d.replacedBy && d.verificationStatus === "Requires_Resubmission")) {
      r.status = "Under_Review";
      touch(r);
    }
  }
  c.db.documents.push(doc);
  return doc;
});
route("GET", "/service-requests/:id/documents/:docId/download-url", (c) => {
  need(c);
  const r = reqFor(c, c.params.id);
  const d = c.db.documents.find((x) => x._id === c.params.docId && x.serviceRequest === r._id);
  if (!d) throw notFound("Document not found");
  const label = `${d.documentType.replace(/_/g, " ")} — ${r.coveredPersonSnapshot.fullName}`;
  return { document: d, url: previewUrl(d.file, label), expiresIn: 900 };
});

// service request review (admin)
const decide = (action: string, apply: (c: Ctx, r: Request, admin: User) => void): Handler => (c) => {
  const admin = adminOnly(c);
  const r = reqFor(c, c.params.id);
  apply(c, r, admin);
  touch(r);
  return r;
};
route("POST", "/service-requests/:id/under-review", decide("under-review", (c, r) => {
  if (r.status !== "Submitted") throw bad("Only new requests can be moved to review");
  r.status = "Under_Review";
  const plan = c.db.plans.find((p) => p._id === r.plan);
  if (plan && plan.status === "Service_Request") { plan.status = "Under_Review"; touch(plan); }
}));
route("PATCH", "/service-requests/:id/documents/:docId/verify", (c) => {
  const admin = adminOnly(c);
  const r = reqFor(c, c.params.id);
  const d = c.db.documents.find((x) => x._id === c.params.docId && x.serviceRequest === r._id);
  if (!d) throw notFound("Document not found");
  const { verificationStatus, reason } = c.body;
  if (verificationStatus === "Requires_Resubmission") {
    if (!String(reason ?? "").trim()) throw bad("reason is required when requesting resubmission");
    d.verificationStatus = "Requires_Resubmission";
    d.rejectionReason = String(reason).trim();
    r.status = "More_Info_Required";
    r.moreInfoReason = d.rejectionReason;
    notify(c.db, r.owner, "ServiceDocumentsRejected", r.plan);
  } else if (verificationStatus === "Approved") {
    d.verificationStatus = "Approved";
    d.rejectionReason = undefined;
  } else throw bad("Invalid verification status");
  touch(r);
  void admin;
  return d;
});
route("POST", "/service-requests/:id/docs-verified", decide("docs-verified", (c, r, admin) => {
  const docs = c.db.documents.filter((d) => d.serviceRequest === r._id && !d.replacedBy);
  if (docs.length === 0 || docs.some((d) => d.verificationStatus !== "Approved")) throw bad("All current documents must be approved first");
  r.status = "Docs_Verified";
  r.verifiedAt = nowIso();
  notify(c.db, r.owner, "ServiceDocumentsApproved", r.plan);
  record(c.db, admin, "service_request.docs_verified", r);
}));
route("POST", "/service-requests/:id/approve", decide("approve", (c, r, admin) => {
  if (!["Under_Review", "Docs_Verified"].includes(r.status)) throw bad("This request can't be approved in its current status");
  r.status = "Approved";
  r.approvedAt = nowIso();
  const plan = c.db.plans.find((p) => p._id === r.plan);
  if (plan) { plan.status = "Approved"; touch(plan); }
  notify(c.db, r.owner, "ServiceRequestApproved", r.plan);
  record(c.db, admin, "service_request.approved", r);
}));
route("POST", "/service-requests/:id/reject", decide("reject", (c, r, admin) => {
  const reason = String(c.body.reason ?? "").trim();
  if (reason.length < 3) throw bad("A rejection reason is required");
  if (["Approved", "Rejected", "Cancelled"].includes(r.status)) throw bad("This request can't be rejected in its current status");
  r.status = "Rejected";
  r.rejectionReason = reason;
  r.rejectedAt = nowIso();
  const plan = c.db.plans.find((p) => p._id === r.plan);
  if (plan && ["Service_Request", "Under_Review"].includes(plan.status)) { plan.status = "Active"; touch(plan); }
  notify(c.db, r.owner, "ServiceRequestRejected", r.plan);
  record(c.db, admin, "service_request.rejected", r);
}));
route("POST", "/service-requests/:id/request-more-info", decide("more-info", (c, r, admin) => {
  const reason = String(c.body.reason ?? "").trim();
  if (reason.length < 3) throw bad("A reason is required");
  if (["Approved", "Rejected", "Cancelled"].includes(r.status)) throw bad("This request can't change in its current status");
  r.status = "More_Info_Required";
  r.moreInfoReason = reason;
  notify(c.db, r.owner, "ServiceMoreInfoRequired", r.plan);
  record(c.db, admin, "service_request.more_info_required", r);
}));

// ---- dispatcher ---------------------------------------------------------------------------------------------------
const compiled = routes.map(([method, pattern, handler]) => ({
  method, handler, keys: [...pattern.matchAll(/:(\w+)/g)].map((m) => m[1]),
  re: new RegExp("^" + pattern.replace(/:(\w+)/g, "([^/]+)") + "$"),
}));

export async function mockRequest(method: string, rawPath: string, body: unknown, token: string | null): Promise<unknown | typeof NOT_MOCKED> {
  const [path, qs] = rawPath.split("?");
  for (const r of compiled) {
    if (r.method !== method) continue;
    const m = r.re.exec(path);
    if (!m) continue;
    const db = getDb();
    const userId = token?.startsWith("demo.") ? token.slice(5) : null;
    const user = userId ? db.users.find((u) => u._id === userId) : undefined;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    await sleep(250);
    // A token for a user that no longer exists (e.g. after resetting demo data) is treated as signed out.
    if (token && !user && !path.startsWith("/auth/") && path !== "/packages") throw new ApiError(401, "Invalid token");
    const result = r.handler({ params, body: (body ?? {}) as Record<string, any>, query: new URLSearchParams(qs ?? ""), user, db });
    save();
    return structuredClone(result);
  }
  return NOT_MOCKED;
}
