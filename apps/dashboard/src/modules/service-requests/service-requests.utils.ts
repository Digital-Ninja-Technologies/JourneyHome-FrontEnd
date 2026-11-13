import type {
  DocumentType,
  DocumentVerificationStatus,
  Plan,
  ServiceDocument,
  ServiceRequest,
} from "@journeyhome/schemas";
import type { Tone } from "@/components/status-pill";
import type { Notice } from "@/modules/plans/plans.utils";

export const DOC_LABEL: Record<DocumentType, string> = {
  Death_Certificate: "Death certificate",
  Valid_Identification: "Valid ID of the deceased",
  Other_Proof: "Other proof",
};

/** The two documents the request form asks for. */
export const REQUIRED_DOCS: DocumentType[] = [
  "Death_Certificate",
  "Valid_Identification",
];

/** Accepted by `POST /service-requests/{id}/documents/upload-url`: PDF, JPG or PNG, up to 10 MB. */
export const DOC_ACCEPT = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};
export const DOC_MAX_BYTES = 10 * 1024 * 1024;
export const DOC_HINT = "JPG, PNG or PDF";

export const DOC_STATUS_LABEL: Record<DocumentVerificationStatus, string> = {
  Pending: "Awaiting review",
  Approved: "Approved",
  Requires_Resubmission: "Needs a new copy",
};
export const DOC_STATUS_TONE: Record<DocumentVerificationStatus, Tone> = {
  Pending: "review",
  Approved: "active",
  Requires_Resubmission: "due",
};

/** Plans that can have a service requested (matches the backend's eligibility rule). */
export const ELIGIBLE_PLAN = new Set<Plan["status"]>([
  "Active",
  "Payment_Due",
  "Overdue",
]);

export const STEPS = [
  "Submitted",
  "Verifying documents",
  "Approved",
  "Scheduled",
  "Completed",
];

/** Why the team asked for more information; the API doesn't document which field carries it. */
export const moreInfoReason = (req: ServiceRequest) =>
  req.moreInfoReason ?? req.reason;
export const rejectionReason = (req: ServiceRequest) =>
  req.rejectionReason ?? req.reason;

/**
 * A rejected or cancelled request leaves its plan as it was, so the customer
 * can submit a new one for the same plan while that plan is still eligible.
 */
export const canRequestAgain = (req: ServiceRequest, plan?: Plan) =>
  (req.status === "Cancelled" || req.status === "Rejected") &&
  Boolean(plan && ELIGIBLE_PLAN.has(plan.status));

/** Display state, combining the request's status with its plan's status (which carries scheduling and completion). */
export function requestState(
  req: ServiceRequest,
  plan?: Plan,
): { label: string; tone: Tone; step: number; closed: boolean } {
  if (plan?.status === "Completed")
    return { label: "Completed", tone: "active", step: 5, closed: true };
  if (req.status === "Rejected")
    return { label: "Rejected", tone: "cancelled", step: 0, closed: true };
  if (req.status === "Cancelled")
    return { label: "Cancelled", tone: "paused", step: 0, closed: true };
  if (plan?.status === "Service_Scheduled" || req.status === "Closed")
    return { label: "Scheduled", tone: "approved", step: 4, closed: false };
  switch (req.status) {
    case "Submitted":
      return { label: "Submitted", tone: "review", step: 1, closed: false };
    case "Under_Review":
      return { label: "Under review", tone: "review", step: 2, closed: false };
    case "More_Info_Required":
      return { label: "More info needed", tone: "due", step: 2, closed: false };
    case "Docs_Verified":
      return {
        label: "Documents verified",
        tone: "review",
        step: 2,
        closed: false,
      };
    default:
      return { label: "Approved", tone: "approved", step: 3, closed: false };
  }
}

export function requestMessage(
  req: ServiceRequest,
  plan?: Plan,
  documents: ServiceDocument[] = req.documents,
): string {
  if (plan?.status === "Completed")
    return "This service is complete. Thank you for trusting us with it.";
  if (plan?.status === "Service_Scheduled" || req.status === "Closed")
    return req.photographerName
      ? `Your service has been scheduled. ${req.photographerName} has been assigned${
          req.photographerPhoneNo
            ? ` and can be reached on ${req.photographerPhoneNo}`
            : ""
        }.`
      : "Your service has been scheduled.";
  // Verification can't start until every required document is in, so don't promise it.
  if (
    (req.status === "Submitted" || req.status === "Under_Review") &&
    documentsSummary(documents).uploaded < REQUIRED_DOCS.length
  )
    return "We've received your request, but we can't start verifying it until all the required documents are uploaded.";
  switch (req.status) {
    case "Submitted":
      return "We've received your request and will start verifying your documents shortly.";
    case "Under_Review":
      return "We're checking the documents you submitted. You'll be notified as soon as there's an update.";
    case "More_Info_Required":
      return (
        moreInfoReason(req) ??
        "We need a little more information. Please upload a replacement for any document marked below."
      );
    case "Docs_Verified":
      return "Your documents are verified. We're finalising the approval.";
    case "Approved":
      return "Your request has been approved. You'll be notified as the next steps are confirmed.";
    case "Rejected":
      return rejectionReason(req) ?? "This request couldn't be approved.";
    case "Cancelled":
      return req.reason ?? "This request was cancelled.";
    default:
      return "";
  }
}

/**
 * The request that currently speaks for a plan: its newest one that wasn't
 * rejected or cancelled.
 */
export function activeRequestFor(
  planId: string,
  requests: ServiceRequest[] | undefined,
): ServiceRequest | undefined {
  return (requests ?? [])
    .filter(
      (r) =>
        r.plan === planId &&
        r.status !== "Rejected" &&
        r.status !== "Cancelled",
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
}

/** Plan statuses that mean a service is in progress. */
const SERVICE_IN_PROGRESS = new Set<Plan["status"]>([
  "Service_Request",
  "Under_Review",
  "Approved",
  "Service_Scheduled",
]);

/**
 * The plan banner while a service is in progress. The plan's own status can
 * trail the request (the backend doesn't move the plan when a request is
 * approved or a photographer is assigned), so once the request is past the
 * first review the banner follows the request instead. Returns null to fall
 * back to the plan-based notice.
 */
export function serviceNotice(
  plan: Plan,
  req: ServiceRequest | undefined,
): Notice | null {
  if (!req || !SERVICE_IN_PROGRESS.has(plan.status)) return null;
  // Early on the plan text is accurate, and list responses may not include
  // documents, which the early request messages depend on.
  if (req.status === "Submitted" || req.status === "Under_Review") return null;
  return {
    tone: req.status === "More_Info_Required" ? "due" : "review",
    text: requestMessage(req, plan),
  };
}

/** Documents can be added or replaced only while the request is still being verified. */
export function canUploadDocuments(req: ServiceRequest): boolean {
  return (
    req.status === "Submitted" ||
    req.status === "Under_Review" ||
    req.status === "More_Info_Required" ||
    req.status === "Docs_Verified"
  );
}

/** The current document of each type; replaced documents are history. */
export function currentDocuments(
  documents: ServiceDocument[],
): Map<DocumentType, ServiceDocument> {
  return new Map(
    documents.filter((d) => !d.replacedBy).map((d) => [d.documentType, d]),
  );
}

/** Document types to show: the required ones, plus anything else that was uploaded. */
export function documentTypes(
  current: Map<DocumentType, ServiceDocument>,
): DocumentType[] {
  return [...new Set<DocumentType>([...REQUIRED_DOCS, ...current.keys()])];
}

export function documentsSummary(documents: ServiceDocument[]) {
  const current = currentDocuments(documents);
  const docs = [...current.values()];
  return {
    uploaded: REQUIRED_DOCS.filter((t) => current.has(t)).length,
    required: REQUIRED_DOCS.length,
    needsAttention:
      docs.filter((d) => d.verificationStatus === "Requires_Resubmission")
        .length + REQUIRED_DOCS.filter((t) => !current.has(t)).length,
    resubmit: docs.filter(
      (d) => d.verificationStatus === "Requires_Resubmission",
    ).length,
  };
}
