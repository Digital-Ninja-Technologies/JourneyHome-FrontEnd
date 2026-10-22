import { capitalise, daysUntil, formatDay, formatMonthYear } from "./format";
import type { Plan } from "./types";

export const MARKETING_URL = import.meta.env.VITE_MARKETING_URL ?? "";

export const fullName = (p: Plan) => p.coveredPerson.fullName;
export const contributionCount = (p: Plan) =>
  Math.round(p.totalContributedMinor / p.contributionAmountMinor);
export const relationshipLabel = (p: Plan) =>
  capitalise(p.coveredPerson.relationship);
export const startedLabel = (p: Plan) => formatMonthYear(p.startDate);

/** Plans that are making monthly contributions. */
export const LIVE = new Set<Plan["status"]>([
  "Active",
  "Payment_Due",
  "Overdue",
]);
export const isDue = (p: Plan) =>
  p.status === "Payment_Due" ||
  p.status === "Overdue" ||
  daysUntil(p.nextPaymentDate) <= 0;

/**
 * The backend only lets a customer start a checkout for a plan's first contribution (Pending plans).
 * Every later contribution is charged automatically, so there is nothing to pay manually.
 */
export const canPayNow = (p: Plan) => p.status === "Pending";
export const payLink = (p: Plan) => `/app/payments/new?plan=${p._id}`;

export type Notice = {
  tone: "due" | "review" | "neutral";
  text: string;
  policy?: boolean;
};

export function planNotice(p: Plan): Notice | null {
  switch (p.status) {
    case "Payment_Due":
      return {
        tone: "due",
        policy: true,
        text: `This contribution is ${daysUntil(p.nextPaymentDate) === 0 ? "due today" : "due"}. If it's missed, it's recorded as a deficit and cleared at your next payment — no penalty.`,
      };
    case "Overdue":
      return {
        tone: "due",
        policy: true,
        text: "This contribution is overdue. It's recorded as a deficit and cleared at your next payment — no penalty.",
      };
    case "Pending":
      return {
        tone: "neutral",
        text: "Your plan starts once your first contribution is paid.",
      };
    case "Paused":
      return { tone: "neutral", text: "This plan is currently paused." };
    case "Service_Request":
    case "Under_Review":
      return {
        tone: "review",
        text: "A service has been requested for this plan. We're verifying the submitted documents — you'll be notified once a photographer or videographer is assigned.",
      };
    case "Approved":
      return {
        tone: "review",
        text: "Your service request has been approved. You'll be notified once a photographer or videographer is assigned.",
      };
    case "Service_Scheduled":
      return { tone: "review", text: "Your service has been scheduled." };
    default:
      return null;
  }
}

/** The third stat cell: when the next (or due) contribution falls. */
export function nextCell(p: Plan): {
  label: string;
  value: string;
  due: boolean;
} {
  if (p.status === "Pending")
    return { label: "Next payment", value: "—", due: false };
  if (p.status === "Payment_Due" || p.status === "Overdue") {
    const d = daysUntil(p.nextPaymentDate);
    return {
      label: p.status === "Overdue" ? "Overdue since" : "Due",
      value: d === 0 ? "Today" : formatDay(p.nextPaymentDate),
      due: true,
    };
  }
  return {
    label: "Next payment",
    value: formatDay(p.nextPaymentDate),
    due: false,
  };
}

export const lastPaymentLabel = (p: Plan) =>
  p.lastPaymentAt ? formatDay(p.lastPaymentAt) : "—";
