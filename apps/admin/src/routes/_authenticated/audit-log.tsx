import { createFileRoute } from "@tanstack/react-router";
import AuditLog from "@/pages/audit-log";

export const Route = createFileRoute("/_authenticated/audit-log")({
  component: AuditLog,
});
