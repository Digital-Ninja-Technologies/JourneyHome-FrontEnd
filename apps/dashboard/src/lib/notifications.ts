import { firstName, formatMoney } from "./format";
import type { AppNotification, Plan } from "./types";

export type NoteTone = "success" | "due" | "alert" | "service" | "info";
export interface NoteView {
  title: string;
  body: string;
  tone: NoteTone;
  /** Where the notification points the customer. */
  link?: { to: string; label: string };
  policy?: boolean;
}

// The backend stores only the event type, the plan and a timestamp (the email is sent separately),
// so the wording shown here is composed from the event.
export function describeNotification(
  n: AppNotification,
  plan?: Plan,
): NoteView {
  const who = plan
    ? `${firstName(plan.coveredPerson.fullName)}'s plan`
    : "your plan";
  const amount = plan
    ? formatMoney(plan.contributionAmountMinor, plan.currency)
    : "your";
  const planLink = plan
    ? { to: `/app/plans/${plan._id}`, label: "View plan" }
    : undefined;
  const requests = { to: "/app/service-requests", label: "View request" };

  switch (n.event) {
    case "InitialPaymentSuccess":
      return {
        title: "Payment received",
        tone: "success",
        body: `Your first contribution to ${who} was received. The plan is now active.`,
        link: planLink,
      };
    case "InitialPaymentFailure":
      return {
        title: "Payment didn't go through",
        tone: "alert",
        body: `Your first contribution to ${who} didn't go through, and you haven't been charged.`,
        link:
          plan?.status === "Pending"
            ? { to: `/app/payments/new?plan=${plan._id}`, label: "Try again" }
            : planLink,
      };
    case "RecurringPaymentSuccess":
      return {
        title: "Payment received",
        tone: "success",
        body: `Your ${amount} contribution to ${who} was received and recorded.`,
        link: { to: "/app/payments", label: "View payments" },
      };
    case "RecurringPaymentFailure":
      return {
        title: "Payment missed",
        tone: "alert",
        body: `We couldn't collect the monthly contribution for ${who}. It's recorded as a deficit and cleared at your next payment — no penalty.`,
        policy: true,
      };
    case "UpcomingContribution":
      return {
        title: "Payment coming up",
        tone: "due",
        body: `${who[0].toUpperCase()}${who.slice(1)} has a contribution of ${amount} coming up.`,
        link: planLink,
      };
    case "GracePeriodStarted":
      return {
        title: "Grace period started",
        tone: "due",
        body: `${who[0].toUpperCase()}${who.slice(1)} missed a contribution and is now in a grace period.`,
        policy: true,
      };
    case "PaymentOverdue":
      return {
        title: "Payment overdue",
        tone: "alert",
        body: `${who[0].toUpperCase()}${who.slice(1)} is overdue.`,
        link: planLink,
        policy: true,
      };
    case "PaymentRecoverySuccess":
      return {
        title: "Payment recovered",
        tone: "success",
        body: `Your payment for ${who} went through and the plan is back on track.`,
        link: planLink,
      };
    case "ServiceRequestReceived":
      return {
        title: "Service request received",
        tone: "service",
        body: `We've received your service request for ${plan ? firstName(plan.coveredPerson.fullName) : "your loved one"} and will start reviewing it.`,
        link: requests,
      };
    case "ServiceDocumentsApproved":
      return {
        title: "Documents approved",
        tone: "service",
        body: "Your submitted documents have been approved.",
        link: requests,
      };
    case "ServiceDocumentsRejected":
      return {
        title: "Documents need attention",
        tone: "alert",
        body: "One or more documents need a new copy. Please upload a replacement.",
        link: requests,
      };
    case "ServiceMoreInfoRequired":
      return {
        title: "More information needed",
        tone: "due",
        body: "We need a little more information to continue with your service request.",
        link: requests,
      };
    case "ServiceRequestApproved":
      return {
        title: "Service request approved",
        tone: "service",
        body: "Your service request has been approved.",
        link: requests,
      };
    case "ServiceRequestRejected":
      return {
        title: "Service request not approved",
        tone: "alert",
        body: "Your service request couldn't be approved. Open the request to see why.",
        link: requests,
      };
    case "ServiceProviderAssigned":
      return {
        title: "Service team assigned",
        tone: "service",
        body: "A photographer or videographer has been assigned to your service.",
        link: requests,
      };
    case "ServiceScheduled":
      return {
        title: "Service scheduled",
        tone: "service",
        body: "Your service has been scheduled.",
        link: requests,
      };
    case "ServiceCompleted":
      return {
        title: "Service completed",
        tone: "success",
        body: "Your service has been completed.",
        link: requests,
      };
    default: {
      const title = (n.subject ?? n.event)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ");
      return {
        title,
        tone: "info",
        body: "There's an update on your account.",
      };
    }
  }
}

export function formatNotificationTime(iso: string, now = new Date()) {
  const d = new Date(iso);
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const h = d.getHours();
  const time = `${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? `Today, ${time}`
    : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${time}`;
}

// "Read" state is kept on this device only; the backend has no read/unread tracking.
const seenKey = (userId: string) => `jh_notifications_seen_${userId}`;

export function readSeen(userId: string): string | null {
  try {
    return localStorage.getItem(seenKey(userId));
  } catch {
    return null;
  }
}

export function writeSeen(userId: string, iso: string) {
  try {
    localStorage.setItem(seenKey(userId), iso);
  } catch {
    /* storage unavailable; read state lasts until reload */
  }
}
