import type { AuditLog } from "@journeyhome/schemas";
import { downloadCsv } from "@/lib/csv";
import { humanise } from "@/lib/format";

const VERB: Record<string, string> = {
  "service_request.created": "submitted",
  "service_request.viewed_by_admin": "viewed",
  "service_request.under_review": "started reviewing",
  "service_request.docs_verified": "verified the documents for",
  "service_request.more_info_required": "asked for more information on",
  "service_request.approved": "approved",
  "service_request.rejected": "rejected",
  "service_request.cancelled": "cancelled",
  "service_request.photographer_assigned": "assigned a photographer to",
  "plan.status_changed": "changed the status of",
  "package.created": "created the package",
  "package.updated": "updated the package",
  "package.synced": "synced with Paystack:",
};

export const ACTION_LABEL: Record<string, string> = {
  "service_request.created": "Request submitted",
  "service_request.viewed_by_admin": "Request viewed",
  "service_request.under_review": "Review started",
  "service_request.docs_verified": "Documents verified",
  "service_request.more_info_required": "More info requested",
  "service_request.approved": "Request approved",
  "service_request.rejected": "Request rejected",
  "service_request.cancelled": "Request cancelled",
  "service_request.photographer_assigned": "Photographer assigned",
  "plan.status_changed": "Plan status changed",
  "package.created": "Package created",
  "package.updated": "Package updated",
  "package.synced": "Package synced",
};

export const actionLabel = (a: string) =>
  ACTION_LABEL[a] ?? humanise(a.replace(/\./g, " "));
export const actorName = (e: AuditLog) =>
  e.actor?.name ?? e.actor?.email ?? "System";

/** A human label from `metadata.label`/`metadata.name` when present, else "service request 9a3f01". */
export function resourceLabel(e: AuditLog): string {
  const m = e.metadata ?? {};
  const named = [m.label, m.name, m.resourceLabel].find(
    (v): v is string => typeof v === "string" && v.trim() !== "",
  );
  return (
    named ??
    `${e.resourceType.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()} ${e.resourceId.slice(-6)}`
  );
}

/** Optional free-text reason recorded with the action. */
export const reasonOf = (e: AuditLog): string | undefined =>
  typeof e.metadata?.reason === "string" ? e.metadata.reason : undefined;

/** Filter options for the server-side `action` param. */
export const ACTION_OPTIONS = Object.entries(ACTION_LABEL).map(
  ([value, label]) => ({ value, label }),
);

export const RESOURCE_TYPE_OPTIONS = [
  { value: "ServiceRequest", label: "Service requests" },
  { value: "Plan", label: "Plans" },
  { value: "Package", label: "Packages" },
];

/** "Ops Admin approved Ada's service request". */
export const describe = (e: AuditLog) =>
  `${actorName(e)} ${VERB[e.action] ?? `${actionLabel(e.action).toLowerCase()} —`} ${resourceLabel(e)}`;

/** Where a resource lives in this console, if anywhere. */
export function resourceLink(
  e: AuditLog,
): { to: "/service-requests/$id" | "/plans/$id"; id: string } | null {
  if (e.resourceType === "ServiceRequest")
    return { to: "/service-requests/$id", id: e.resourceId };
  if (e.resourceType === "Plan") return { to: "/plans/$id", id: e.resourceId };
  return null;
}

export function exportAuditCsv(rows: AuditLog[]) {
  downloadCsv("audit-log.csv", [
    [
      "Time",
      "Actor",
      "Actor email",
      "Action",
      "Resource type",
      "Resource",
      "Resource ID",
      "Reason",
    ],
    ...rows.map((e) => [
      e.createdAt,
      actorName(e),
      e.actor?.email ?? "",
      e.action,
      e.resourceType,
      resourceLabel(e),
      e.resourceId,
      reasonOf(e) ?? "",
    ]),
  ]);
}
