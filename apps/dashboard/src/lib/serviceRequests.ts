import { api, uploadToStorage } from "./api";
import type { DocumentType, Plan, ServiceDocument, ServiceRequest } from "./types";
import type { Tone } from "../components/StatusPill";

export const DOC_LABEL: Record<DocumentType, string> = {
  Death_Certificate: "Death certificate",
  Valid_Identification: "Valid ID of the deceased",
  Other_Proof: "Other proof",
};

/** The two documents the request form asks for. */
export const REQUIRED_DOCS: DocumentType[] = ["Death_Certificate", "Valid_Identification"];

export const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_BYTES = 10 * 1024 * 1024;

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Please choose a JPG, PNG or PDF file.";
  if (file.size > MAX_BYTES) return "That file is over 10MB.";
  return null;
}

/** Plans that can have a service requested (matches the backend's eligibility rule). */
export const ELIGIBLE_PLAN = new Set<Plan["status"]>(["Active", "Payment_Due", "Overdue"]);

export const STEPS = ["Submitted", "Verifying documents", "Approved", "Scheduled", "Completed"];

/** Display state, combining the request's status with its plan's status (which carries scheduling and completion). */
export function requestState(req: ServiceRequest, plan?: Plan): { label: string; tone: Tone; step: number; closed: boolean } {
  if (plan?.status === "Completed") return { label: "Completed", tone: "active", step: 5, closed: true };
  if (req.status === "Rejected") return { label: "Rejected", tone: "cancelled", step: 0, closed: true };
  if (req.status === "Cancelled") return { label: "Cancelled", tone: "paused", step: 0, closed: true };
  if (plan?.status === "Service_Scheduled") return { label: "Scheduled", tone: "approved", step: 4, closed: false };
  switch (req.status) {
    case "Submitted": return { label: "Submitted", tone: "review", step: 1, closed: false };
    case "Under_Review": return { label: "Under review", tone: "review", step: 2, closed: false };
    case "More_Info_Required": return { label: "More info needed", tone: "due", step: 2, closed: false };
    case "Docs_Verified": return { label: "Documents verified", tone: "review", step: 2, closed: false };
    default: return { label: "Approved", tone: "approved", step: 3, closed: false };
  }
}

export function requestMessage(req: ServiceRequest, plan?: Plan): string {
  if (plan?.status === "Service_Scheduled") return "Your service has been scheduled.";
  switch (req.status) {
    case "Submitted": return "We've received your request and will start verifying your documents shortly.";
    case "Under_Review": return "We're checking the documents you submitted. You'll be notified as soon as there's an update.";
    case "More_Info_Required": return req.moreInfoReason ?? "We need a little more information. Please upload a replacement for any document marked below.";
    case "Docs_Verified": return "Your documents are verified. We're finalising the approval.";
    case "Approved": return "Your request has been approved. You'll be notified as the next steps are confirmed.";
    case "Rejected": return req.rejectionReason ?? "This request couldn't be approved.";
    default: return "";
  }
}

/** Uploads one document: get a signed URL, PUT the file straight to storage, then confirm it with the API. */
export async function uploadServiceDocument(requestId: string, file: File, documentType: DocumentType, replacesDocumentId?: string) {
  const init = await api<{ fileId: string; uploadUrl: string; uploadToken: string }>(`/service-requests/${requestId}/documents/upload-url`, {
    body: { documentType, fileName: file.name, contentType: file.type, size: file.size },
  });
  let res: Response | null;
  try {
    res = await uploadToStorage(init.uploadUrl, file);
  } catch {
    throw new Error(`Couldn't upload ${file.name}. Check your connection and try again.`);
  }
  if (res && !res.ok) throw new Error(`Couldn't upload ${file.name} (storage returned ${res.status}).`);
  return api<ServiceDocument>(`/service-requests/${requestId}/documents/complete`, {
    body: { fileId: init.fileId, uploadToken: init.uploadToken, documentType, ...(replacesDocumentId && { replacesDocumentId }) },
  });
}

export async function openServiceDocument(requestId: string, documentId: string) {
  const { url } = await api<{ url: string }>(`/service-requests/${requestId}/documents/${documentId}/download-url`);
  window.open(url, "_blank", "noopener");
}
