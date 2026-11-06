import { type PlanStatus, PlanStatusEnum } from "@journeyhome/schemas";
import { z } from "zod";
import { PLAN_STATUS, statusOptions } from "@/components/status-pill";

/** Plans making monthly contributions. */
export const LIVE_PLAN = new Set<PlanStatus>([
  "Active",
  "Payment_Due",
  "Overdue",
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

export const PLAN_STATUS_OPTIONS = statusOptions(PLAN_STATUS);

export const planStatusFormSchema = z.object({
  status: PlanStatusEnum,
});
export type PlanStatusFormValues = z.infer<typeof planStatusFormSchema>;

export const transitionOptions = (from: PlanStatus) =>
  PLAN_TRANSITIONS[from].map((value) => ({
    value,
    label: PLAN_STATUS[value][0],
  }));
