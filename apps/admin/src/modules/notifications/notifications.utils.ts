import type { AppNotification } from "@journeyhome/schemas";
import type { LinkProps } from "@tanstack/react-router";
import { Bell, Camera, FileText, Mail, Upload } from "lucide-react";

export type NotificationKind =
  | "service-request"
  | "document"
  | "plan"
  | "contact"
  | "other";

/**
 * Operational events cover new plans, service requests, submitted documents
 * and contact messages. The backend's event names aren't enumerated in the
 * docs, so classify by keyword rather than an exact list.
 */
export function kindOf(n: AppNotification): NotificationKind {
  const key = `${n.event ?? ""} ${n.title}`.toLowerCase();
  if (key.includes("document")) return "document";
  if (key.includes("service")) return "service-request";
  if (key.includes("contact") || key.includes("message")) return "contact";
  if (key.includes("plan")) return "plan";
  return "other";
}

export const KIND: Record<
  NotificationKind,
  {
    icon: typeof Bell;
    box: string;
    link?: { to: LinkProps["to"]; label: string };
  }
> = {
  "service-request": {
    icon: Camera,
    box: "bg-status-approved-bg text-status-approved",
    link: { to: "/service-requests", label: "Open requests" },
  },
  document: {
    icon: Upload,
    box: "bg-status-review-bg text-status-review",
    link: { to: "/service-requests", label: "Review documents" },
  },
  plan: {
    icon: FileText,
    box: "bg-status-active-bg text-status-active",
    link: { to: "/plans", label: "View plans" },
  },
  contact: {
    icon: Mail,
    box: "bg-cream text-status-due",
    link: { to: "/contact", label: "Read messages" },
  },
  other: { icon: Bell, box: "bg-muted text-muted-foreground" },
};

export const READ_FILTER_OPTIONS = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
] as const;
