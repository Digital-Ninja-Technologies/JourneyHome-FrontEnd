import { createFileRoute } from "@tanstack/react-router";
import { TableViewSkeleton } from "@/components/skeletons";
import { auditLogSearchSchema } from "@/lib/search-schemas";
import { AuditLogView } from "@/modules/audit-log/components/audit-log-view";

export const Route = createFileRoute("/_protected/audit-log")({
  validateSearch: auditLogSearchSchema,
  component: AuditLogView,
  pendingComponent: TableViewSkeleton,
});
