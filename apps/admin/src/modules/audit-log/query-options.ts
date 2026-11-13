import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import {
  type FetchAuditLogsParams,
  fetchAuditLog,
  fetchAuditLogs,
} from "./api";

export const auditLogsQueryOptions = (params?: FetchAuditLogsParams) =>
  queryOptions({
    queryKey: ["audit-log", "list", params] as const,
    queryFn: () => fetchAuditLogs(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export const auditLogQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["audit-log", "detail", id] as const,
    queryFn: () => fetchAuditLog(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

export function useAuditLogs(params?: FetchAuditLogsParams) {
  return useQuery(auditLogsQueryOptions(params));
}

export function useAuditLog(id: string | undefined) {
  return useQuery(auditLogQueryOptions(id ?? ""));
}
