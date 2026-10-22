import type { Tone } from "@/components/ui";
import type { PlanStatus, RequestStatus } from "@/lib/types";

export const PLAN_STATUS: Record<PlanStatus, [label: string, tone: Tone]> = {
  Pending: ["Pending", "paused"],
  Active: ["Active", "active"],
  Payment_Due: ["Payment due", "due"],
  Overdue: ["Overdue", "cancelled"],
  Paused: ["Paused", "paused"],
  Service_Request: ["Service requested", "review"],
  Under_Review: ["Under review", "review"],
  Approved: ["Approved", "approved"],
  Service_Scheduled: ["Service scheduled", "approved"],
  Completed: ["Completed", "active"],
  Cancelled: ["Cancelled", "cancelled"],
  Expired: ["Expired", "paused"],
};

export const REQUEST_STATUS: Record<
  RequestStatus,
  [label: string, tone: Tone]
> = {
  Submitted: ["New", "review"],
  Under_Review: ["Under review", "review"],
  More_Info_Required: ["Awaiting customer", "due"],
  Docs_Verified: ["Documents verified", "review"],
  Approved: ["Approved", "approved"],
  Rejected: ["Rejected", "cancelled"],
  Cancelled: ["Cancelled", "paused"],
};

/** Plans making monthly contributions. */
export const LIVE_PLAN = new Set<PlanStatus>([
  "Active",
  "Payment_Due",
  "Overdue",
]);
/** Requests that still need an admin's attention. */
export const NEEDS_REVIEW = new Set<RequestStatus>([
  "Submitted",
  "Under_Review",
  "Docs_Verified",
]);
export const OPEN_REQUEST = new Set<RequestStatus>([
  "Submitted",
  "Under_Review",
  "More_Info_Required",
  "Docs_Verified",
]);

/** Mirrors the backend's allowed plan status transitions. */
export const PLAN_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
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
