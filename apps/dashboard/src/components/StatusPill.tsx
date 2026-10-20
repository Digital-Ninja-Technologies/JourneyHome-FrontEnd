import { cn } from "@journeyhome/ui/lib/utils";
import type { PaymentStatus, PlanStatus } from "../lib/types";

const PLAN: Record<PlanStatus, [label: string, tone: string]> = {
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

const TONES: Record<string, string> = {
  active: "bg-status-active-bg text-status-active",
  due: "bg-status-due-bg text-status-due",
  review: "bg-status-review-bg text-status-review",
  approved: "bg-status-approved-bg text-status-approved",
  paused: "bg-status-paused-bg text-status-paused",
  cancelled: "bg-status-cancelled-bg text-status-cancelled",
};

export function planStatusLabel(s: PlanStatus) {
  return PLAN[s]?.[0] ?? s;
}

export function StatusPill({ status, className }: { status: PlanStatus; className?: string }) {
  const [label, tone] = PLAN[status] ?? [status, "paused"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", TONES[tone], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export const PAYMENT_TEXT: Record<PaymentStatus, string> = {
  Pending: "text-status-paused",
  Processing: "text-status-due",
  Successful: "text-status-active",
  Failed: "text-status-cancelled",
  Refunded: "text-status-review",
  Cancelled: "text-status-cancelled",
};
