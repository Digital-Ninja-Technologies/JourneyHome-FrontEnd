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
 * The decisions offered from each status. `Docs_Verified` is listed while in
 * review even before every document is approved; the UI disables it until then.
 */
export function availableDecisions(
  status: ServiceRequestStatus,
): AdminServiceRequestStatus[] {
  switch (status) {
    case "Submitted":
      return ["Under_Review", "Cancelled"];
    case "Under_Review":
      return ["Docs_Verified", "Approved", "More_Info_Required", "Rejected"];
    case "More_Info_Required":
      return ["Docs_Verified", "Approved", "Rejected"];
    case "Docs_Verified":
      return ["Approved", "More_Info_Required", "Rejected"];
    default:
      return [];
  }
}

export const DECISION_LABEL: Record<AdminServiceRequestStatus, string> = {
  Under_Review: "Start review",
  Docs_Verified: "Mark documents verified",
  Approved: "Approve request",
  More_Info_Required: "Request more info",
  Rejected: "Reject",
  Cancelled: "Cancel request",
};

/** Customer-facing message is required when asking for more or saying no. */
export const NEEDS_REASON = new Set<AdminServiceRequestStatus>([
  "More_Info_Required",
  "Rejected",
]);

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
