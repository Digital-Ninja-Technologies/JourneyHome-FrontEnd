import { queryOptions } from "@tanstack/react-query";
import { fetchAuditLog } from "./api";

export const auditLogQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["audit", userId] as const,
    queryFn: () => fetchAuditLog(),
    staleTime: 30_000,
  });
