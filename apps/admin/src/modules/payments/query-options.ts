import { queryOptions } from "@tanstack/react-query";
import { fetchAdminPayments } from "./api";

export const adminPaymentsQueryOptions = (userId?: string) =>
  queryOptions({
    queryKey: ["admin-payments", userId] as const,
    queryFn: () => fetchAdminPayments(),
    staleTime: 30_000,
  });
