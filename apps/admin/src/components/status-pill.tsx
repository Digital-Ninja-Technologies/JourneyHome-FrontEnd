import type {
  AdminUserStatus,
  DocumentVerificationStatus,
  PaymentStatus,
  PlanStatus,
  ServiceRequestStatus,
} from "@journeyhome/schemas";
import { cn } from "@journeyhome/ui/lib/utils";

export type Tone =
  | "active"
  | "due"
  | "review"
  | "approved"
  | "paused"
  | "cancelled";

type StatusMap<S extends string> = Record<S, [label: string, tone: Tone]>;

const TONES: Record<Tone, string> = {
  active: "bg-status-active-bg text-status-active",
  due: "bg-status-due-bg text-status-due",
  review: "bg-status-review-bg text-status-review",
  approved: "bg-status-approved-bg text-status-approved",
  paused: "bg-status-paused-bg text-status-paused",
  cancelled: "bg-status-cancelled-bg text-status-cancelled",
};

export const PLAN_STATUS: StatusMap<PlanStatus> = {
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

export const REQUEST_STATUS: StatusMap<ServiceRequestStatus> = {
  Submitted: ["New", "review"],
  Under_Review: ["Under review", "review"],
  More_Info_Required: ["Awaiting customer", "due"],
  Docs_Verified: ["Documents verified", "review"],
  Approved: ["Approved", "approved"],
  Rejected: ["Rejected", "cancelled"],
  Cancelled: ["Cancelled", "paused"],
  Closed: ["Closed", "active"],
};

export const PAYMENT_STATUS: StatusMap<PaymentStatus> = {
  Successful: ["Successful", "active"],
  Pending: ["Pending", "due"],
  Processing: ["Processing", "due"],
  Failed: ["Failed", "cancelled"],
  Refunded: ["Refunded", "paused"],
  Cancelled: ["Cancelled", "paused"],
};

export const DOCUMENT_STATUS: StatusMap<DocumentVerificationStatus> = {
  Pending: ["Awaiting review", "due"],
  Approved: ["Approved", "active"],
  Requires_Resubmission: ["New copy requested", "cancelled"],
};

export const USER_STATUS: StatusMap<AdminUserStatus> = {
  Request_Pending: ["Request pending", "review"],
  Active_Plan: ["Active", "active"],
  No_Active_Plan: ["No active plan", "paused"],
};

export function Pill({
  label,
  tone,
  className,
}: {
  label: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        TONES[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function MappedPill<S extends string>({
  map,
  status,
  className,
}: {
  map: StatusMap<S>;
  status: S;
  className?: string;
}) {
  const [label, tone] = map[status] ?? [status, "paused"];
  return <Pill label={label} tone={tone} className={className} />;
}

type PillProps<S extends string> = { status: S; className?: string };

export const PlanStatusPill = (p: PillProps<PlanStatus>) => (
  <MappedPill map={PLAN_STATUS} {...p} />
);
export const RequestStatusPill = (p: PillProps<ServiceRequestStatus>) => (
  <MappedPill map={REQUEST_STATUS} {...p} />
);
export const PaymentStatusPill = (p: PillProps<PaymentStatus>) => (
  <MappedPill map={PAYMENT_STATUS} {...p} />
);
export const DocumentStatusPill = (
  p: PillProps<DocumentVerificationStatus>,
) => <MappedPill map={DOCUMENT_STATUS} {...p} />;
export const UserStatusPill = (p: PillProps<AdminUserStatus>) => (
  <MappedPill map={USER_STATUS} {...p} />
);

/** `[{ value, label }]` options for a status filter `Select`. */
export const statusOptions = <S extends string>(map: StatusMap<S>) =>
  (Object.keys(map) as S[]).map((value) => ({
    value,
    label: map[value][0],
  }));
