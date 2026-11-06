import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchAuditLog } from "./api";

export const auditLogQueryOptions = () =>
  queryOptions({
    queryKey: ["audit-log"] as const,
    queryFn: () => fetchAuditLog(),
    staleTime: 30_000,
  });

export function useAuditLog() {
  return useQuery(auditLogQueryOptions());
}
