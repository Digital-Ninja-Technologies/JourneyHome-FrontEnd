import {
  type AdminServiceRequestStatus,
  AdminServiceRequestStatusEnum,
  type DocumentType,
  type ServiceDocument,
  type ServiceRequestStatus,
} from "@journeyhome/schemas";
import { z } from "zod";
import { REQUEST_STATUS, statusOptions } from "@/components/status-pill";

export const REQUEST_STATUS_OPTIONS = statusOptions(REQUEST_STATUS);

export const DOCUMENT_LABEL: Record<DocumentType, string> = {
  Death_Certificate: "Death certificate",
  Valid_Identification: "Valid ID of the deceased",
  Other_Proof: "Other proof",
};

/** Requests that still need staff attention. */
export const NEEDS_REVIEW = new Set<ServiceRequestStatus>([
  "Submitted",
  "Under_Review",
  "Docs_Verified",
]);

export const isClosed = (s: ServiceRequestStatus) =>
  s === "Approved" || s === "Rejected" || s === "Cancelled" || s === "Closed";

/** Current documents only: a replaced upload is history, not something to review. */
export const currentDocuments = (docs: ServiceDocument[]) =>
  docs.filter((d) => !d.replacedBy);

/** Documents can be reviewed once the request is in review. */
export const canReviewDocuments = (s: ServiceRequestStatus) =>
  s === "Under_Review" || s === "More_Info_Required";

/**
 * Statuses staff can pick directly. `More_Info_Required` isn't one: the request
 * only moves there when a document is sent back for a new copy, which is the
 * one thing the customer can actually act on.
 */
export type RequestDecision = Exclude<
  AdminServiceRequestStatus,
  "More_Info_Required"
>;

/**
 * The decisions offered from each status. `Docs_Verified` is listed while in
 * review even before every document is approved; the UI disables it until then.
 */
export function availableDecisions(
  status: ServiceRequestStatus,
): RequestDecision[] {
  switch (status) {
    case "Submitted":
      return ["Under_Review", "Cancelled"];
    case "Under_Review":
      return ["Docs_Verified", "Approved", "Rejected"];
    case "More_Info_Required":
      return ["Docs_Verified", "Approved", "Rejected"];
    case "Docs_Verified":
      return ["Approved", "Rejected"];
    default:
      return [];
  }
}

/**
 * Whether "Approve request" can go ahead, and which documents it would approve
 * along the way. A document sent back for a new copy blocks approval: the
 * customer still owes a replacement, so it can't be approved on their behalf.
 */
export function approvalReadiness(
  documents: ServiceDocument[],
): { ok: true; pending: ServiceDocument[] } | { ok: false; reason: string } {
  const docs = currentDocuments(documents);
  if (docs.length === 0)
    return { ok: false, reason: "No documents have been submitted yet." };
  if (docs.some((d) => d.verificationStatus === "Requires_Resubmission"))
    return {
      ok: false,
      reason: "A document is waiting for a new copy from the customer.",
    };
  return {
    ok: true,
    pending: docs.filter((d) => d.verificationStatus === "Pending"),
  };
}

export const DECISION_LABEL: Record<RequestDecision, string> = {
  Under_Review: "Start review",
  Docs_Verified: "Mark documents verified",
  Approved: "Approve request",
  Rejected: "Reject",
  Cancelled: "Cancel request",
};

/** Customer-facing message is required when saying no. */
export const NEEDS_REASON = new Set<AdminServiceRequestStatus>(["Rejected"]);

export const decisionFormSchema = z
  .object({
    status: AdminServiceRequestStatusEnum,
    reason: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    if (NEEDS_REASON.has(v.status) && v.reason.length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Tell the customer why (at least 3 characters).",
      });
    }
  });
export type DecisionFormValues = z.infer<typeof decisionFormSchema>;

export const resubmitDocumentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Tell the customer what's wrong with this copy."),
});
export type ResubmitDocumentValues = z.infer<typeof resubmitDocumentSchema>;
