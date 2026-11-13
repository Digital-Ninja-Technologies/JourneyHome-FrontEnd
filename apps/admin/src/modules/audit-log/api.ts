import {
  type AuditLog,
  type AuditLogQueryInput,
  type AuditLogRaw,
  auditLogRawSchema,
  auditLogSchema,
  type PaginatedAuditLogs,
  paginatedAuditLogsSchema,
} from "@journeyhome/schemas";
import { api, parseApiResponse, toQueryString } from "@/lib/api";

export type FetchAuditLogsParams = Partial<AuditLogQueryInput>;

/** Newest first, with `actor` populated. */
export async function fetchAuditLogs(
  params?: FetchAuditLogsParams,
): Promise<PaginatedAuditLogs> {
  const res = await api<unknown>(`/audit-logs${toQueryString(params)}`);
  return parseApiResponse(
    paginatedAuditLogsSchema,
    res,
    "Invalid audit log response from server",
  );
}

export async function fetchAuditLog(id: string): Promise<AuditLog> {
  const res = await api<unknown>(`/audit-logs/${encodeURIComponent(id)}`);
  return parseApiResponse(
    auditLogSchema,
    res,
    `Invalid audit log (${id}) response from server`,
  );
}

export async function deleteAuditLog(id: string): Promise<AuditLogRaw> {
  const res = await api<unknown>(`/audit-logs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return parseApiResponse(
    auditLogRawSchema,
    res,
    "Invalid audit log deletion response from server",
  );
}
